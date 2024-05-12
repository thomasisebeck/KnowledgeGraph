import 'dotenv/config'

const DATABASE = process.env.DATABASE;

const extractID = data => {
    return data.records[0]._fieldLookup.id;
}

const executeGenericQuery = async (query, driver, params) => {
    return await driver.executeQuery(
        query,
        params,
        {
            database: DATABASE
        }
    )
}

const createClassificationNode = async (label, driver) => {
    let query = 'MERGE (c:ClassificationNode {label: $label})'
    return extractID(await executeGenericQuery(query, driver, {label: label}, DATABASE));
}

const findClassificationNode = async (label, driver) => {

}

const createInformationNode = async (label, driver, snippet) => {
    let query = `MERGE (i:InformationNode {label: $label, snippet: $snippet}) WITH apoc.node.id(i) AS id RETURN id`;
    return extractID(await executeGenericQuery(query, driver, {
        label: label,
        snippet: snippet
    }));
}

const clearDB = async (driver) => {
    let query = 'MATCH (n) DETACH DELETE n';
    await executeGenericQuery(query, driver, {}, DATABASE);
}

export default {
    createInformationNode,
    createClassificationNode,
    clearDB
}