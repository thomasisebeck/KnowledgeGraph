import 'dotenv/config'

const DATABASE = process.env.DATABASE;

const INFO = 'InformationNode'
const CLASS = 'ClassificationNode'
const BOTH = `${INFO} | ${CLASS}`

const executeGenericQuery = async (driver, query, params) => {
    try {
        return await driver.executeQuery(query, params, {
            database: DATABASE
        })
    } catch (e) {
        console.error("ERROR");
        console.error(e)
    }
}

const getField = (obj, field) => {
    let index = obj.records[0]._fieldLookup[field];
    return obj.records[0]._fields[index];
}


const getId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(0, 10);
}

const getNodeArray = (queryResults) => {
    let nodes = [];
    for (const record in queryResults.records) {
        console.log(record)
    }
    return nodes;
}

const createClassificationNode = async (driver, label) => {
    let query = `MERGE (c:${CLASS} {label: $label, nodeId: $nodeId}) RETURN c.nodeId AS nodeId`;
    let newId = getId();
    let result = await executeGenericQuery(driver, query, {
        label: label, nodeId: newId
    })
    return await getField(result, "nodeId");
}

const createInformationNode = async (driver,label, snippet) => {
    let query = `MERGE (n:${INFO} {label: $label, snippet: $snippet, nodeId: $nodeId}) RETURN n.nodeId AS nodeId`;
    let result = await executeGenericQuery(driver, query, {
        label: label, snippet: snippet, nodeId: getId()
    })
    return getField(result, "nodeId");
}

const formatLabel = (relationshipLabel) => {
    return relationshipLabel.replaceAll(' ', '_').toUpperCase();
}

function getSummaryDataPoint(summary, field) {
    const validStats = ['nodesCreated', 'nodesDeleted', 'relationshipsCreated', 'relationshipsDeleted', 'propertiesSet', 'labelsAdded', 'labelsRemoved', 'indexesAdded', 'indexesRemoved', 'constraintsAdded', 'constraintsRemoved'];
    if (validStats.indexOf(field) === -1) throw "Invalid stat lookup of " + field;
    return summary.summary.counters._stats[field];
}

const createRelationship = async (driver, nodeIdFrom, nodeIdTo, directed, label) => {
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
const getById = async (driver, nodeId) => {
    let query = `MATCH (n:${BOTH}) WHERE n.nodeId = $nodeId RETURN n`;
    let result = await executeGenericQuery(driver, query, {
        nodeId: nodeId
    });
    return getNodeArray(result);
}

const removeNode = async (nodeId, driver) => {
    let query = `MATCH (n:${BOTH}) WHERE n.nodeId = $nodeId DETACH DELETE n`;
    return await executeGenericQuery(driver, query, {
        nodeId: nodeId
    });
}

const clearDB = async (driver) => {
    let query = 'MATCH (n) DETACH DELETE n';
    await executeGenericQuery(driver, query, {});
}

const relationshipExistsBetweenNodes = async (driver, nodeIdFrom, nodeIdTo, relationshipLabel) => {
    const query = `MATCH (n1 {nodeId: '${nodeIdFrom}'})-[:${formatLabel(relationshipLabel)}]-(n2 {nodeId: '${nodeIdTo}'}) RETURN EXISTS((n1)-[:${formatLabel(relationshipLabel)}]-(n2))`;
    const result = await executeGenericQuery(driver, query, {});
    return getField(result, "EXISTS((n1)-[:MY_LABEL]-(n2))");
}

export default {
    createInformationNode,
    createClassificationNode,
    clearDB,
    removeNode,
    getById,
    createRelationship,
    relationshipExistsBetweenNodes
}