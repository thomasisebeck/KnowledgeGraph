import 'dotenv/config'
import {Driver} from "neo4j-driver";
import * as crypto from "node:crypto";
import {executeGenericQuery, formatLabel, getField} from "../utils";
import {nodeType, RequestBody, Node, NodeRelationship, CreateStackReturnBody} from "./interfaces";

const INFO = 'InformationNode'
const CLASS = 'ClassificationNode'
const BOTH = `${INFO} | ${CLASS}`

// get nodes fully connected:
// MATCH (n) MATCH (n)-[r]-() RETURN n,r

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
            nodeType: nodeType.INFORMATION
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
        nodeType: nodeType.INFORMATION
    }
}

const findOrCreateClassificationNode = async (driver: Driver, label: string): Promise<Node> => {
    let query = `MERGE (n:${CLASS} {label: $label}) ON CREATE SET n.nodeId = '${crypto.randomUUID()}' RETURN n.nodeId AS nodeId, n.label AS label`;
    let {records, summary} = await executeGenericQuery(driver, query, {
        label: label
    })

    return {
        nodeType: nodeType.CLASSIFICATION,
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
        findOrCreateClassificationNode(driver, "Computer &\nInfo Science"),
        findOrCreateClassificationNode(driver, "Philosophy"),
        findOrCreateClassificationNode(driver, "Psychology"),
        findOrCreateClassificationNode(driver, "Science"),
        findOrCreateClassificationNode(driver, "Language"),
        findOrCreateClassificationNode(driver, "Technology"),
        findOrCreateClassificationNode(driver, "Arts"),
        findOrCreateClassificationNode(driver, "History"),
        findOrCreateClassificationNode(driver, "Geography"),
    ]);

}

const upVoteRelationship = async (driver: Driver, relId: string) => {
    const query = `MATCH (from:${BOTH})-[r {relId: $relId}]->(to:${BOTH}) SET r.votes = r.votes + 1 RETURN r, from, to`;
    const result = await executeGenericQuery(driver, query, {
        relId: relId
    })

    const r = getField(result.records, "r");
    const from = getField(result.records, 'from');
    const to = getField(result.records, 'to');

    // console.log("FROM:");
    // console.log(from);

    return {
        relId: r.properties.relId,
        type: r.type,
        votes: r.properties.votes.toNumber(),
        from: from.properties.nodeId,
        to: to.properties.nodeId
    };
}

const getOrCreateRelationship = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, relationshipLabel: string, doubleSided?: boolean): Promise<NodeRelationship[]> => {
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

    const toRet: NodeRelationship[] = [];


    toRet.push(
        {
            relId: r.properties.relId,
            type: r.type,
            votes: r.properties.votes.toNumber(),
            to: nodeIdTo,
            from: nodeIdFrom
        }
    )

    if (r2 != null)
        toRet.push(
            {
                relId: r2.properties.relId,
                type: r2.type,
                votes: r2.properties.votes.toNumber(),
                to: nodeIdFrom,
                from: nodeIdTo
            }
        )

    return toRet;
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
                nodeType: nodeType.INFORMATION,
                snippet: n.snippet
            })
        else
            nodes.push({
                label: n.label,
                nodeId: n.nodeId,
                nodeType: nodeType.CLASSIFICATION
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
        upVoteRelationship(driver, createdRels[0][0].relId),
        // createdRels[0][1] && upVoteRelationship(driver, createdRels[0][1].relId),

        upVoteRelationship(driver, createdRels[1][0].relId),
        // createdRels[1][1] && upVoteRelationship(driver, createdRels[1][1].relId),

        upVoteRelationship(driver, createdRels[2][0].relId),
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
    createTopicNodes
}