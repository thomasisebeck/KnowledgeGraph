import 'dotenv/config'

const DATABASE = process.env.DATABASE;

const executeGenericQuery = async (query, driver, params) => {
    return await driver.executeQuery(
        query,
        params,
        {
            database: DATABASE
        }
    )
}

const extractId = (obj) => {
    return obj.records[0]._fieldLookup['nodeId'];
}

const createClassificationNode = async (label, driver) => {
    let query = 'MERGE (c:ClassificationNode {label: $label}) RETURN elementId(c)'
    return await extractId(await executeGenericQuery(query, driver, {label: label}, DATABASE))
}

const getId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(0, 10);
}

const getNodeArray = (queryResults) => {
    let nodes = [];
    console.log('RESULTS: ')
    console.log(queryResults[0]);
    for (const record in queryResults.records) {
        console.log(record)
    }
    return nodes;
}

const createInformationNode = async (label, driver, snippet) => {
    let query = 'MERGE (n:InformationNode {label: $label, snippet: $snippet, nodeId: $nodeId}) RETURN n.nodeId AS nodeId';
    let newId = getId();
    await executeGenericQuery(query, driver, {
        label: label,
        snippet: snippet,
        nodeId: newId
    });
    return newId;
}

const getById = async (nodeId, driver) => {
    let query = `MATCH (n:InformationNode|ClassificationNode) WHERE n.nodeId = $nodeId RETURN n`;
    let result =  await executeGenericQuery(query, driver, {
        nodeId: nodeId
    });
    return getNodeArray(result);
}

const removeNode = async (nodeId, driver) => {
    let query = 'MATCH (n:InformationNode|ClassificationNode) WHERE n.nodeId = $nodeId DETACH DELETE n';
    return await executeGenericQuery(query, driver, {
        nodeId: nodeId
    });
}

const clearDB = async (driver) => {
    let query = 'MATCH (n) DETACH DELETE n';
    await executeGenericQuery(query, driver, {}, DATABASE);
}

export default {
    createInformationNode,
    createClassificationNode,
    clearDB,
    removeNode,
    getById
}