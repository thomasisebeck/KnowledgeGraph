import 'dotenv/config'
import {Driver, EagerResult, Record, RecordShape} from "neo4j-driver";
import * as crypto from "node:crypto";

const DATABASE = process.env.DATABASE;

const INFO = 'InformationNode'
const CLASS = 'ClassificationNode'
const BOTH = `${INFO} | ${CLASS}`

// get nodes fully connected:
// MATCH (n) MATCH (n)-[r]-() RETURN n,r

//-------------------------- UTILITY FUNCTIONS ---------------------------------//

//const records: Record<RecordShape, PropertyKey, RecordShape<PropertyKey, number>>[]
const executeGenericQuery = async (driver: Driver, query: string, params: any) => {
    try {
        const {records, summary} = await driver.executeQuery(query, params, {
            database: DATABASE
        })
        return {records, summary};
    } catch (e) {
        console.error("ERROR");
        console.error(e);
        throw e;
    }
}

const getId = () => {
    return crypto.randomUUID();
}

const getField = (records: Record[], field: string) => {
    return records?.at(0)?.get(field);
}

const formatLabel = (relationshipLabel: string) => {
    return relationshipLabel.replaceAll(' ', '_').toLocaleUpperCase();
}

const clearDB = async (driver: Driver) => {
    let query = 'MATCH (n) DETACH DELETE n';
    await executeGenericQuery(driver, query, {});
}
//----------------------------- CREATION FUNCTIONS -----------------------------//

const createOrRetrieveInformationNode = async (driver: Driver, label: string, snippet: string): Promise<Node> => {
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

const findOrCreateClassificationNode = async (driver: Driver, label: string) => {
    let query = `MERGE (n:${CLASS} {label: $label}) ON CREATE SET n.nodeId = '${crypto.randomUUID()}' RETURN n.nodeId AS nodeId, n.label AS label`;
    let {records, summary} = await executeGenericQuery(driver, query, {
        label: label
    })

    return {
        nodeId: getField(records, "nodeId"),
        label: getField(records, "label"),
    }
}

//----------------------------- FINDING / CREATION FUNCTIONS -----------------------------//

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

const removeNode = async (nodeId: string, driver: Driver) => {
    let query = `MATCH (n:${BOTH}) WHERE n.nodeId = $nodeId DETACH DELETE n`;
    return await executeGenericQuery(driver, query, {
        nodeId: nodeId
    });
}

const upVoteRelationship = async (driver: Driver, relId: string) => {
    const query = `MATCH (from:${BOTH})-[r {relId: $relId}]->(to:${BOTH}) SET r.votes = r.votes + 1 RETURN r, from, to`;
    const result = await executeGenericQuery(driver, query, {
        relId: relId
    })
    const r = getField(result.records, "r");
    const from = getField(result.records, "from");
    const to = getField(result.records, "to");

    return {
        relId: r.properties.relId,
        type: r.type,
        votes: r.properties.votes.toNumber(),
        from: from.nodeId,
        to: to.nodeId
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

const getRelationshipById = async (driver: Driver, relId: string) => {
    const query = `MATCH ()-[r {relId: '${relId}'}]->() RETURN r`;
    const {records} = await executeGenericQuery(driver, query, {});
    return records.at(0)?.get("r")
}

//returns the stack
const createStack = async (driver: Driver, body: RequestBody): Promise<CreateStackReturnBody> => {
    const classificationNodeStrings = body.classificationNodes;
    const infoNode = body.infoNode;

    const nodes: Node[] = [];

    //create 3 classification nodes
    for (let i = 0; i < 3; i++) {
        const current = await findOrCreateClassificationNode(driver, classificationNodeStrings[i]);
        nodes.push({
            label: current.label,
            nodeId: current.nodeId,
            nodeType: nodeType.CLASSIFICATION
        })
    }

    //create the information node
    const info = await createOrRetrieveInformationNode(driver, infoNode.label, infoNode.snippet);
    nodes.push({
        label: info.label,
        snippet: info.snippet,
        nodeId: info.nodeId,
        nodeType: nodeType.INFORMATION
    })

    //error: length does not exist on type Connection[]
    if (body.connections.length !== 3)
        throw "invalid number of connections";

    const relationships: NodeRelationship[] = [];

    const NUM_RELATIONSHIPS = 3;
    for (let i = 0; i < NUM_RELATIONSHIPS; i++) {
        let curr: NodeRelationship[];
        if (i == NUM_RELATIONSHIPS - 1) { //last class to info
            curr = await getOrCreateRelationship(driver, nodes[i].nodeId, info.nodeId, body.connections[i], body.doubleSided[i]);
        } else {
            curr = await getOrCreateRelationship(driver, nodes[i].nodeId, nodes[i + 1].nodeId, body.connections[i], body.doubleSided[i]);
        }

        //upvote relationship, whether it's existing or new
        relationships.push(await upVoteRelationship(driver, curr[0].relId));
    }

    return {
        nodes: nodes,
        relationships: relationships
    }
}

//--------------------------- INTERFACES ----------------------------------//

export enum nodeType {
    CLASSIFICATION,
    INFORMATION
}

interface Node {
    label: string,
    nodeId: string
    snippet?: string
    nodeType: nodeType
}

export interface CreateStackReturnBody {
    nodes: Node[],
    relationships: NodeRelationship[]
}

export interface RequestBody {
    infoNode: {
        label: string,
        snippet: string
    },
    classificationNodes: string[],
    connections: string[],
    doubleSided: boolean[]
}

export interface NodeRelationship {
    type: string,
    relId: string,
    votes: number,
    to: string,
    from: string
}


export default {
    createOrRetrieveInformationNode,
    clearDB,
    removeNode,
    getNodeById,
    getRelationshipById,
    findOrCreateClassificationNode,
    getOrCreateRelationship,
    relationshipExistsBetweenNodes,
    createStack
}