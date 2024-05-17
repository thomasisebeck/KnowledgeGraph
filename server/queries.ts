import 'dotenv/config'
import {Driver, EagerResult, RecordShape} from "neo4j-driver";

const DATABASE = process.env.DATABASE;

const INFO = 'InformationNode'
const CLASS = 'ClassificationNode'
const BOTH = `${INFO} | ${CLASS}`

const executeGenericQuery =  async (driver: Driver, query: string, params: any): Promise<EagerResult> => {
    try {
        return await driver.executeQuery(query, params, {
            database: DATABASE
        })
    } catch (e) {
        console.error("ERROR");
        throw e;
    }
}

const getField = (result: EagerResult<RecordShape>, field: string) => {
    if (result.records[0].has(field))
        return result.records[0].get(field);

    console.log("Available fields:")
    console.log(result.records[0].keys)
    throw "Cannot find field";
}


const getId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(0, 10);
}


const createClassificationNode = async (driver: Driver, label: string) => {
    let query = `MERGE (c:${CLASS} {label: $label, nodeId: $nodeId}) RETURN c.nodeId AS nodeId`;
    let newId = getId();
    let result = await executeGenericQuery(driver, query, {
        label: label, nodeId: newId
    }).then(result =>  getField(result, "nodeId"))
    return await getField(result, "nodeId");
}

const createInformationNode = async (driver: Driver,label: string, snippet: string) => {
    let query = `MERGE (n:${INFO} {label: $label, snippet: $snippet, nodeId: $nodeId}) RETURN n.nodeId AS nodeId`;
    let result = await executeGenericQuery(driver, query, {
        label: label, snippet: snippet, nodeId: getId()
    })
    return getField(result, "nodeId");
}

const formatLabel = (relationshipLabel:  string ) => {
    return relationshipLabel.replaceAll(' ', '_').toUpperCase();
}

function getSummaryDataPoint(summary: EagerResult<RecordShape>, field: string) {
    const validStats = ['nodesCreated', 'nodesDeleted', 'relationshipsCreated', 'relationshipsDeleted', 'propertiesSet', 'labelsAdded', 'labelsRemoved', 'indexesAdded', 'indexesRemoved', 'constraintsAdded', 'constraintsRemoved'];
    if (validStats.indexOf(field) === -1) throw "Invalid stat lookup of " + field;
    return summary.summary.counters.updates()[field];
}

const createRelationship = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, directed: boolean, label: string): Promise<string> => {
    let connection = directed ? "->" : "-"
    let newId = getId();
    let query = `CREATE (from {nodeId: $nodeIdFrom})-[rel:${formatLabel(label)} {relId: $relId}]${connection}(to {nodeId: $nodeIdTo})`;
    let result = await executeGenericQuery(driver, query, {
        nodeIdFrom: nodeIdFrom, nodeIdTo: nodeIdTo, relId: newId
    });
    if (getSummaryDataPoint(result, "relationshipsCreated") !== 1) throw "failed to create relationship";
    return newId;
}

//TODO: fix broken return
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

const clearDB = async (driver: Driver) => {
    let query = 'MATCH (n) DETACH DELETE n';
    await executeGenericQuery(driver, query, {});
}

const relationshipExistsBetweenNodes = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, relationshipLabel: string) => {
    const query = `MATCH (n1 {nodeId: '${nodeIdFrom}'})-[:${formatLabel(relationshipLabel)}]-(n2 {nodeId: '${nodeIdTo}'}) RETURN EXISTS((n1)-[:${formatLabel(relationshipLabel)}]-(n2))`;
    const result = await executeGenericQuery(driver, query, {});
    return getField(result, "EXISTS((n1)-[:MY_LABEL]-(n2))");
}

const getRelationshipById = async(driver: Driver, relId: string) => {
    const query =  `MATCH ()-[r {relId: '${relId}'}]->() RETURN r`;
    return getField(await executeGenericQuery(driver, query, {}), 'r');
}

export default {
    createInformationNode,
    createClassificationNode,
    clearDB,
    removeNode,
    getNodeById,
    createRelationship,
    relationshipExistsBetweenNodes,
    getRelationshipById
}