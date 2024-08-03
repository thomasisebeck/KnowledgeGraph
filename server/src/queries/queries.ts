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
    RequestBodyConnection
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

const upVoteRelationship = async (driver: Driver, relId: string, mustUpvote: boolean): Promise<NodeRelationship> => {

    const query = `MATCH (from)-[r {relId: $relId}]->(to) SET r.votes = r.votes ${mustUpvote ? '+' : '-'} 1 RETURN r, from, to`;
    const result = await executeGenericQuery(driver, query, {
        relId: relId
    })

    const r = getField(result.records, "r") as Relationship;
    const from = getField(result.records, 'from') as Neo4jNode;
    const to = getField(result.records, 'to') as Neo4jNode;

    // console.log("R")
    // console.dir(r, {depth: null})


    if (r.properties.votes.toNumber() < 0) {
        //went into the negative, remove the connection if it doesn't break anything
        //todo: implement
        //send request to see how many connections are present
        // console.log("REMOVING REL")
        // console.log("FROM")
        // console.log(from)
        // console.log("TO")
        // console.log(to)

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
                to: to.properties.nodeId,
                from: from.properties.nodeId,
                direction: Direction.AWAY,
                type: r.properties.type,
            }
        }

    }

    //prevent deletion if there isn't a path
    const newVotes = r.properties.votes.toNumber() > 0 ? r.properties.votes.toNumber() : 1;

    return {
        relId: r.properties.relId,
        votes: newVotes,
        to: to.properties.nodeId,
        from: from.properties.nodeId,
        direction: Direction.AWAY,
        type: r.type,
    };
}

const getOrCreateRelationship = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, connection: RequestBodyConnection): Promise<NodeRelationship> => {
    if (connection.name.includes("-"))
        throw "labels cannot include hyphens";

    const checkNodesQuery = 'MATCH (n1 {nodeId: $nodeIdFrom}), (n2 {nodeId: $nodeIdTo}) RETURN n1, n2';
    let {records, summary} = await executeGenericQuery(driver, checkNodesQuery, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo
    })

    let node1 = getField(records, "n1");
    let node2 = getField(records, "n2");

    if (node1 == null || node2 == null)
        throw "cannot find nodes to connect"


    const REL_ID = crypto.randomUUID();

    const merges = [];
    const AWAY = `MERGE (n1)-[r:${formatLabel(connection.name)}]->(n2)`;
    const TOWARDS = `MERGE (n2)-[r:${formatLabel(connection.name)}]->(n1)`;

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
    const classificationNodeStrings = body.classificationNodes;
    const infoNode = body.infoNode;

    const nodes: Node[] = [];


    const nodeFunctionCalls = body.classificationNodes.map(node => findOrCreateClassificationNode(driver, node))
    nodeFunctionCalls.push(findOrCreateInformationNode(driver, infoNode.label, infoNode.snippet))
    const myNodes = await Promise.all(nodeFunctionCalls)

    console.log("NODES")
    console.log(myNodes)

    //todo: remove
    return {
        nodes: [],
        relationships: []
    }

    // for (let i = 0; i < myNodes.length; i++) {
    //     const n = myNodes[i];
    //
    //     if (i == myNodes.length - 1)
    //         nodes.push({
    //             label: n.label,
    //             nodeId: n.nodeId,
    //             nodeType: INFO,
    //             snippet: n.snippet
    //         })
    //     else
    //         nodes.push({
    //             label: n.label,
    //             nodeId: n.nodeId,
    //             nodeType: CLASS
    //         })
    // }
    //
    // if (body.connections.length !== 3)
    //     throw "invalid number of connections";
    //
    //
    // const createdRels = await Promise.all([
    //     getOrCreateRelationship(driver, nodes[0].nodeId, nodes[1].nodeId, body.connections[0]),
    //     getOrCreateRelationship(driver, nodes[1].nodeId, nodes[2].nodeId, body.connections[1]),
    //     getOrCreateRelationship(driver, nodes[2].nodeId, nodes[3].nodeId, body.connections[2]),
    // ])
    //
    // //don't have to upvote twice, they have the same relID
    // const myRels = await Promise.all([
    //     upVoteRelationship(driver, createdRels[0].relId, true),
    //     // createdRels[0][1] && upVoteRelationship(driver, createdRels[0][1].relId),
    //
    //     upVoteRelationship(driver, createdRels[1].relId, true),
    //     // createdRels[1][1] && upVoteRelationship(driver, createdRels[1][1].relId),
    //
    //     upVoteRelationship(driver, createdRels[2].relId, true),
    //     // createdRels[2][1] && upVoteRelationship(driver, createdRels[2][1].relId),
    // ])
    //
    // return {
    //     nodes: nodes,
    //     relationships: myRels
    // }
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
    getOrCreateRelationship,
    relationshipExistsBetweenNodes,
    createStack,
    createTopicNodes,
    upVoteRelationship,
    getAllData
}