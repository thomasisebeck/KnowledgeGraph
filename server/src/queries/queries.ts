import 'dotenv/config'
import {Driver, Relationship} from "neo4j-driver";
import * as crypto from "node:crypto";
import {executeGenericQuery, formatLabel, getField} from "../utils";
import {
    CreateStackReturnBody,
    Direction,
    Neo4jNode,
    Node,
    NodeRelationship,
    RequestBody,
    RequestBodyConnection,
    UpvoteResult
} from "../../../shared/interfaces";

const INFO = 'INFO'
const CLASS = 'CLASS'
const ROOT = 'ROOT'
const BOTH = `${INFO} | ${CLASS}`

// get nodes fully connected:
// MATCH (n)-[r]-() RETURN n,r
// delete:
// MATCH (n) DETACH DELETE n

//----------------------------- CREATION / MODIFICATION FUNCTIONS -----------------------------//

const findOrCreateInformationNode = async (driver: Driver, label: string, snippet: string): Promise<Node> => {
    let searchQuery = `MATCH (n:${INFO} {label: $label}) RETURN n.nodeId AS nodeId`;
    let searchResult = await executeGenericQuery(driver, searchQuery, {
        label: label
    })
    if (searchResult.records.length != 0) {
        //node already created, return it
        return {
            nodeId: getField(searchResult.records, "nodeId"),
            label: label,
            snippet: snippet,
            nodeType: INFO
        }
    }

    let query = `MERGE (n:${INFO} {label: $label, snippet: $snippet, nodeId: $nodeId}) RETURN n.nodeId AS nodeId`;
    let {records, summary} = await executeGenericQuery(driver, query, {
        label: label, snippet: snippet, nodeId: crypto.randomUUID()
    })
    return {
        nodeId: getField(records, "nodeId"),
        label: label,
        snippet: snippet,
        nodeType: INFO
    }
}

const findOrCreateClassificationNode = async (driver: Driver, label: string, createRoot?: boolean): Promise<Node> => {
    let query;
    if (createRoot)
        query = `MERGE (n:${ROOT} {label: $label}) ON CREATE SET n.nodeId = '${crypto.randomUUID()}' RETURN n.nodeId AS nodeId, n.label AS label`;
    else
        query = `MERGE (n:${CLASS} {label: $label}) ON CREATE SET n.nodeId = '${crypto.randomUUID()}' RETURN n.nodeId AS nodeId, n.label AS label`;
    let {records, summary} = await executeGenericQuery(driver, query, {
        label: label
    })

    return {
        nodeType: CLASS,
        nodeId: getField(records, "nodeId"),
        label: getField(records, "label")
    }
}

const removeNode = async (nodeId: string, driver: Driver) => {
    let query = `MATCH (n:${BOTH}) WHERE n.nodeId = $nodeId DETACH DELETE n`;
    return await executeGenericQuery(driver, query, {
        nodeId: nodeId
    });
}

const createTopicNodes = async (driver: Driver) => {

    //create the topic nodes
    //1. Computer science and info
    //2. Philosophy and Psychology
    //3. Science
    //4. Language
    //5. Technology
    //6. Arts
    //7. History
    //8. Geography

    return await Promise.all([
        findOrCreateClassificationNode(driver, "Computer &\nInfo Science", true),
        findOrCreateClassificationNode(driver, "Philosophy", true),
        findOrCreateClassificationNode(driver, "Psychology", true),
        findOrCreateClassificationNode(driver, "Science", true),
        findOrCreateClassificationNode(driver, "Language", true),
        findOrCreateClassificationNode(driver, "Technology", true),
        findOrCreateClassificationNode(driver, "Arts", true),
        findOrCreateClassificationNode(driver, "History", true),
        findOrCreateClassificationNode(driver, "Geography", true),
    ]);

}


const tryPushToArray = (toAdd: any, array: any, isRel?: boolean) => {

    try {
        if (isRel) {
            //check that from and to are different
            console.log("TRYING TO ADD REL")
            const rel = toAdd as NodeRelationship;
            console.log(rel)
            const normalPos = array.findIndex((e: { relId: any; }) => e.relId == rel.relId);
            console.log(normalPos)
            if (normalPos == -1)
                array.push(toAdd);
        } else {
            const node = toAdd as Node;
            const pos = array.findIndex((n: { nodeId: any; }) => n.nodeId == toAdd.nodeId);
            console.log(pos)
            if (pos == -1) {
                array.push(toAdd)
            }
        }
    } catch (e) {
        console.error(e)
    }

    return array;
}

const getAllData = async (driver: Driver) => {
    const allNodesQuery =
        `MATCH (from)-[r1]->(to)
        WITH from, r1, to
        OPTIONAL MATCH (toNode { nodeId: to.nodeId })-[r2 { relId: r1.relId }]->(fromNode { nodeId: from.nodeId}) 
        WHERE id(r2) <> id(r1)
        RETURN from, to, r1, r2 IS NOT NULL AS is_double_sided`;

    const rootNodesQuery =
        `MATCH (n:${ROOT}) RETURN n`;

    const [result, rootNodes] = await Promise.all([
        executeGenericQuery(driver, allNodesQuery, {}),
        executeGenericQuery(driver, rootNodesQuery, {}),
    ])

    let rels: NodeRelationship[] = [];
    let nodes: Node[] = [];

    let fromNode: Node | null = null;
    let toNode: Node | null = null;

    rootNodes.records.forEach(record => {
        const node = getField([record], 'n');
        const toPush: Node = {
            label: node.properties.label,
            nodeType: node.labels[0],
            nodeId: node.properties.nodeId,
        }
        nodes = tryPushToArray(toPush, nodes);
    })

    result.records.forEach(record => {
        record.keys.forEach((key) => {

            //first get from node
            //then get to node
            //then get r
            if (key == 'from' || key == 'to') {
                const node = key == 'from' ? record.get('from') as Node : record.get('to');
                const toPush: Node = {
                    label: node.properties.label,
                    nodeType: node.labels[0],
                    nodeId: node.properties.nodeId,
                }
                nodes = tryPushToArray(toPush, nodes);

                if (key == 'from') //push to from
                    fromNode = toPush;
                if (key == 'to')
                    toNode = toPush;
            } else if (key == 'r1') {
                const rel = record.get('r1');
                if (fromNode != null && toNode != null) {

                    console.warn("DOUBLE: ", record.get('is_double_sided'));

                    const toPush = {
                        to: toNode.nodeId,
                        from: fromNode.nodeId,
                        votes: rel.properties.votes.toNumber(),
                        relId: rel.properties.relId,
                        type: rel.type,
                        direction: record.get('is_double_sided') ? Direction.NEUTRAL : Direction.AWAY
                    }

                    rels = tryPushToArray(toPush, rels, true);
                }
            }
        })
    })

    return {
        nodes: nodes,
        relationships: rels
    }
}

//todo: continue with this!!!!
const willNodeGetStranded = async (driver: Driver, nodeIdFrom: string, relId: string) => {

    const pathToRootQuery =
        `MATCH p=(myNode {nodeId: '${nodeIdFrom}'})-[*..100]-(root:${ROOT})
        WHERE none(rel in relationships(p) WHERE rel.relId = '${relId}')
        RETURN p
        `
       //MATCH p=((myNode {nodeId: '${nodeIdFrom}'})-[r*1..100 WHERE r.relId != '${relId}']-(root:ROOT)) RETURN p
    console.warn("to remove rel: ")
    console.log(relId)

    console.warn("TRYING...")
    const result = await executeGenericQuery(driver, pathToRootQuery, {})

    console.log("---------------------------")
    const hasPath = getField(result.records, 'p')
    console.log("PATH")
    console.dir(hasPath, {depth: null})
    console.log("---------------------------")

    //no path, will get stranded
    return (hasPath === undefined);
}

//downvoteRelationship
//destroy connection when it gets to 0
//unless it creates a stray node, then just return - upvotes

const upVoteRelationship = async (driver: Driver, relId: string, mustUpvote: boolean): Promise<UpvoteResult> => {

    const query = `MATCH (from)-[r {relId: $relId}]->(to) SET r.votes = r.votes ${mustUpvote ? '+' : '-'} 1 RETURN r, from, to`;
    const result = await executeGenericQuery(driver, query, {
        relId: relId
    })

    const r = getField(result.records, "r") as Relationship;
    const from = getField(result.records, 'from') as Neo4jNode;
    const to = getField(result.records, 'to') as Neo4jNode;


    if (r.properties.votes.toNumber() < 0) {

        //assume nodes will be stranded
        let fromWillBeStranded = true;
        let toWillBeStranded = true;

        //wont be stranded if root
        if (from.labels[0] == ROOT) {
            console.log("FROM IS A ROOT NODE")
            fromWillBeStranded = false;
        }
        if (to.labels[0] == ROOT) {
            console.log("TO IS A ROOT NODE")
            toWillBeStranded = false;
        }

        if (fromWillBeStranded) { //possibility that from gets stranded, not root
            console.log("FROM WILL BE STRANDED")
            const willGetStrandedFrom = await willNodeGetStranded(driver, from.properties.nodeId, r.properties.relId);
            console.log(willGetStrandedFrom)
        }

        if (toWillBeStranded) {
            console.log("TO WILL BE STRANDED")
            const willGetStrandedTo = await willNodeGetStranded(driver, to.properties.nodeId, r.properties.relId);
            console.dir(willGetStrandedTo)
        }

        if (!fromWillBeStranded && !toWillBeStranded) {
            //remove the relationship
            const query = `MATCH ()-[r {relId: '${relId}'}]-() DELETE r`
            const result = await executeGenericQuery(driver, query, {})
            console.warn("Setting votes to 0 to delete")
            return {
                relId: r.properties.relId,
                votes: 0,
            }
        }

    }

    //prevent deletion if there isn't a path
    const newVotes = r.properties.votes.toNumber() > 0 ? r.properties.votes.toNumber() : 1;

    //todo: find a way to preserve direction

    return {
        relId: r.properties.relId,
        votes: newVotes,
    };
}

const findOrCreateRelationship = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, connection: RequestBodyConnection): Promise<NodeRelationship> => {
    if (connection.connectionName.includes("-"))
        throw "labels cannot include hyphens";

    //----------------- see if the nodes exist ----------------------//
    const checkNodesQuery = 'MATCH (n1 {nodeId: $nodeIdFrom}), (n2 {nodeId: $nodeIdTo}) RETURN n1, n2';
    let {records, summary} = await executeGenericQuery(driver, checkNodesQuery, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo
    })

    let node1 = getField(records, "n1");
    let node2 = getField(records, "n2");

    if (node1 == null || node2 == null)
        throw "cannot find nodes to connect"


    //----------------- create the connections ----------------------//

    const REL_ID = crypto.randomUUID();

    //merge forms part of a query
    const merges = [];
    const AWAY = `MERGE (n1)-[r:${formatLabel(connection.connectionName)}]->(n2)`;
    const TOWARDS = `MERGE (n2)-[r:${formatLabel(connection.connectionName)}]->(n1)`;

    switch (connection.direction) {
        case Direction.NEUTRAL:
            merges.push(AWAY)
            merges.push(TOWARDS)
            break;
        case Direction.AWAY: //normal
            merges.push(AWAY)
            break;
        case Direction.TOWARDS: //backwards
            merges.push(TOWARDS)
    }

    const queries = [];

    for (const m of merges) {
        queries.push(
            `MATCH (n1 {nodeId: $nodeIdFrom}), (n2 {nodeId: $nodeIdTo})
             ${m}
             ON CREATE SET
             r.relId = '${REL_ID}',
             r.votes = 0
             RETURN r`
        )
    }

    const queryFunctionCalls = queries.map(query => executeGenericQuery(driver, query, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo
    }))

    const myRels = await Promise.all([...queryFunctionCalls])
    const r = getField(myRels[0].records, "r");

    return {
        to: nodeIdTo,
        from: nodeIdFrom,
        type: r.type,
        relId: r.properties.relId,
        votes: r.properties.votes.toNumber(),
        direction: connection.direction
    }

}

const createStack = async (driver: Driver, body: RequestBody): Promise<CreateStackReturnBody> => {
    const infoNode = body.infoNode;

    //stack node function calls
    const nodeFunctionCalls = body.connections.map(conn =>
        findOrCreateClassificationNode(driver, conn.nodeName)
    )
    nodeFunctionCalls.push(
        findOrCreateInformationNode(driver, infoNode.label, infoNode.snippet)
    )

    //create all nodes
    const myNodes = await Promise.all(nodeFunctionCalls)

    console.log("NODES AFTER CREATION")
    console.log(myNodes)

    //stack connection function calls
    const relFunctionCalls = body.connections.map((conn, index) =>
        findOrCreateRelationship(driver, myNodes[index].nodeId, myNodes[index + 1].nodeId, conn)
    );

    //create all connections
    const myRelationships = await Promise.all(relFunctionCalls)

    //upvote all connections
    const upvoteRelFunctionCalls = myRelationships.map((conn) =>
        upVoteRelationship(driver, conn.relId, true)
    )
    const upvotedRelationshipsCalls = await Promise.all(upvoteRelFunctionCalls)

    const upvotedRelationships: NodeRelationship[] = upvotedRelationshipsCalls.map((conn, index) => {
        //only thing that needs to change is the votes
        return {
            relId: myRelationships[index].relId,
            votes: conn.votes,
            from: myRelationships[index].from,
            direction: myRelationships[index].direction,
            type: myRelationships[index].type,
            to: myRelationships[index].to
        }
    })

    console.log("CONNECTIONS AFTER CREATION")
    console.log(myRelationships)

    return {
        nodes: myNodes,
        relationships: upvotedRelationships
    }
}

//----------------------------- DOES EXIST FUNCTIONS -----------------------------//

const relationshipExistsBetweenNodes = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, relationshipLabel: string): Promise<boolean> => {
    const query = `MATCH (n1 {nodeId: '${nodeIdFrom}'})-[:${formatLabel(relationshipLabel)}]-(n2 {nodeId: '${nodeIdTo}'}) RETURN EXISTS((n1)-[:${formatLabel(relationshipLabel)}]-(n2))`;
    const {records, summary} = await executeGenericQuery(driver, query, {});

    if (records.length == 0)
        return false;

    return getField(records, `EXISTS((n1)-[:${formatLabel(relationshipLabel)}]-(n2))`);
}

const getNodeById = async (driver: Driver, nodeId: any) => {
    let query = `MATCH (n:${BOTH}) WHERE n.nodeId = $nodeId RETURN n`;
    return await executeGenericQuery(driver, query, {
        nodeId: nodeId
    });
}

const getRelationshipById = async (driver: Driver, relId: string) => {
    const query = `MATCH ()-[r {relId: '${relId}'}]->() RETURN r`;
    const {records} = await executeGenericQuery(driver, query, {});
    return records.at(0)?.get("r")
}


export default {
    findOrCreateInformationNode,
    removeNode,
    getNodeById,
    getRelationshipById,
    findOrCreateClassificationNode,
    findOrCreateRelationship,
    relationshipExistsBetweenNodes,
    createStack,
    createTopicNodes,
    upVoteRelationship,
    getAllData
}