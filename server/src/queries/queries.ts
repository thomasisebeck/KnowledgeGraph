import 'dotenv/config'
import {Driver, Record, Relationship} from "neo4j-driver";
import * as crypto from "node:crypto";
import {executeGenericQuery, formatLabel, getField} from "../utils";
import {nodeType, RequestBody, Node, NodeRelationship, CreateStackReturnBody} from "../../../shared/interfaces";

const INFO = 'INFO'
const CLASS = 'ClASS'
const ROOT = 'ROOT'
const BOTH = `${INFO} | ${CLASS}`

// get nodes fully connected:
// MATCH (n)-[r]-() RETURN n,r

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

//todo: continue
const willNodeGetStranded = async (driver: Driver, nodeIdFrom: string, relId: string) => {
    const query =
        `MATCH (from {nodeId: '${nodeIdFrom}'}), (to:${ROOT}), p = shortestPath((from)-[r]-(to))
       WHERE NONE(r IN relationships(p) WHERE r.relId = '${relId}')
       return labels(from) AS from_labels, p`

    const result = await executeGenericQuery(driver, query, {})

    //no paths to a root node found
    if (result.records.length == 0) {

        console.warn("NO PATHS TO ROOT WILL GET STRANDED")
        return true;
    }

    const labels = getField(result.records, 'from_labels')
    const path = getField(result.records, 'p')

    console.warn("WILL NODE GET STRANDED")
    console.dir(result.records, {depth: null})
    console.log("----------")
    console.log(labels)
    console.log("----------")
    console.log(path)

    return result;

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
        `MATCH (from)-[r]-(to)
        WHERE id(from) < id(to)
        WITH from, r, to
        OPTIONAL MATCH (to)-[r2]-(from) 
        RETURN from, to, r, r2 IS NOT NULL AS is_double_sided`;

    const rootNodesQuery =
        `MATCH (n:Root) RETURN n`;

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
            } else if (key == 'r') {
                const rel = record.get('r');
                if (fromNode != null && toNode != null) {

                    const toPush = {
                        to: toNode.nodeId,
                        from: fromNode.nodeId,
                        votes: rel.properties.votes.toNumber(),
                        relId: rel.properties.relId,
                        type: rel.type,
                        doubleSided: record.get('is_double_sided')
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

//downvoteRelationship
//destroy connection when it gets to 0
//unless it creates a stray node, then just return - upvotes

const upVoteRelationship = async (driver: Driver, relId: string, mustUpvote: boolean): Promise<NodeRelationship> => {

    const query = `MATCH (from)-[r {relId: $relId}]->(to) SET r.votes = r.votes ${mustUpvote ? '+' : '-'} 1 RETURN r, from, to`;
    const result = await executeGenericQuery(driver, query, {
        relId: relId
    })

    const r = getField(result.records, "r");
    const from = getField(result.records, 'from');
    const to = getField(result.records, 'to');

    let isRemoved = false;

    console.log("R")
    console.dir(r, {depth: null})

    if (r.properties.votes.toNumber() < 0) {
        //went into the negative, remove the connection if it doesn't break anything
        //todo: implement
        //send request to see how many connections are present
        console.log("REMOVING REL")
        console.log("FROM")
        console.log(from)
        console.log("TO")
        console.log(to)

        //assume nodes will be stranded
        let fromWillBeStranded = true;
        let toWillBeStranded = true;

        //wont be stranded if root
        if (from.labels[0] == 'Root')
            fromWillBeStranded = false;
        if (to.labels[0] == 'Root')
            toWillBeStranded = false;

        if (fromWillBeStranded) { //possibility that from gets stranded, not root
            const willGetStrandedFrom = await willNodeGetStranded(driver, from, r.properties.relId);
            console.dir(willGetStrandedFrom, {depth: null})
        }

        if (toWillBeStranded) {
            const willGetStrandedTo = await willNodeGetStranded(driver, from, r.properties.relId);
            console.dir(willGetStrandedTo, {depth: null})
        }

        if (!fromWillBeStranded && !toWillBeStranded) {
            //remove the relationship
            const query = `MATCH ()-[r {relId: '${relId}'}]-() DELETE r`
            const result = await executeGenericQuery(driver, query, {})
            console.warn("DELETING....")
        }

    }

    //todo: return an object with isRemoved property
    return {
        relId: r.properties.relId,
        type: r.type,
        votes: r.properties.votes.toNumber(),
        from: from.properties.nodeId,
        to: to.properties.nodeId,
        doubleSided: result.records.length == 2,
    };
}

const getOrCreateRelationship = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, relationshipLabel: string, doubleSided?: boolean): Promise<NodeRelationship> => {
    if (relationshipLabel.includes("-"))
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
    const query =
        `MATCH (n1 {nodeId: $nodeIdFrom}), (n2 {nodeId: $nodeIdTo})
        MERGE (n1)-[r:${formatLabel(relationshipLabel)}]->(n2)
        ON CREATE SET 
        r.relId = '${REL_ID}', 
        r.votes = 0      
        RETURN r`;

    let result = await executeGenericQuery(driver, query, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo
    });

    let result2;

    if (doubleSided) {
        const query =
            `MATCH (n1 {nodeId: $nodeIdFrom}), (n2 {nodeId: $nodeIdTo})
        MERGE (n1)-[r:${formatLabel(relationshipLabel)}]->(n2)
        ON CREATE SET 
        r.relId = '${REL_ID}', 
        r.votes = 0      
        RETURN r`;

        result2 = await executeGenericQuery(driver, query, {
            nodeIdFrom: nodeIdTo,
            nodeIdTo: nodeIdFrom
        });
    }

    const r = result.records.at(0)?.get("r");
    let r2 = result2 != null ? result2.records.at(0)?.get("r") : null;

    return {
        relId: r.properties.relId,
        type: r.type,
        votes: r.properties.votes.toNumber(),
        to: nodeIdTo,
        from: nodeIdFrom,
        doubleSided: r2 != null
    }

}

const createStack = async (driver: Driver, body: RequestBody): Promise<CreateStackReturnBody> => {
    const classificationNodeStrings = body.classificationNodes;
    const infoNode = body.infoNode;

    const nodes: Node[] = [];

    const myNodes = await Promise.all([
        findOrCreateClassificationNode(driver, classificationNodeStrings[0]),
        findOrCreateClassificationNode(driver, classificationNodeStrings[1]),
        findOrCreateClassificationNode(driver, classificationNodeStrings[2]),
        findOrCreateInformationNode(driver, infoNode.label, infoNode.snippet)
    ])

    //create 3 classification nodes
    for (let i = 0; i < myNodes.length; i++) {
        const n = myNodes[i];

        if (i == myNodes.length - 1)
            nodes.push({
                label: n.label,
                nodeId: n.nodeId,
                nodeType: INFO,
                snippet: n.snippet
            })
        else
            nodes.push({
                label: n.label,
                nodeId: n.nodeId,
                nodeType: CLASS
            })
    }

    if (body.connections.length !== 3)
        throw "invalid number of connections";


    const createdRels = await Promise.all([
        getOrCreateRelationship(driver, nodes[0].nodeId, nodes[1].nodeId, body.connections[0], body.doubleSided[0]),
        getOrCreateRelationship(driver, nodes[1].nodeId, nodes[2].nodeId, body.connections[1], body.doubleSided[1]),
        getOrCreateRelationship(driver, nodes[2].nodeId, nodes[3].nodeId, body.connections[2], body.doubleSided[2]),
    ])

    //don't have to upvote twice, they have the same relID
    const myRels = await Promise.all([
        upVoteRelationship(driver, createdRels[0].relId, true),
        // createdRels[0][1] && upVoteRelationship(driver, createdRels[0][1].relId),

        upVoteRelationship(driver, createdRels[1].relId, true),
        // createdRels[1][1] && upVoteRelationship(driver, createdRels[1][1].relId),

        upVoteRelationship(driver, createdRels[2].relId, true),
        // createdRels[2][1] && upVoteRelationship(driver, createdRels[2][1].relId),
    ])

    return {
        nodes: nodes,
        relationships: myRels
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
    getOrCreateRelationship,
    relationshipExistsBetweenNodes,
    createStack,
    createTopicNodes,
    upVoteRelationship,
    getAllData
}