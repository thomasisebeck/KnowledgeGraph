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
        console.error(e);
        throw e;
    }
}

const getField = (result: EagerResult<RecordShape>, field: string): any => {
    let f = null;
    if (result.records[0].has(field))
          f = result.records[0].get(field);

    if (f == null)
        throw "cannot find field in " + result.records[0];

    return f;
}


const getId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(0, 10);
}


const createInformationNode = async (driver: Driver,label: string, snippet: string) => {
    let searchQuery = `MATCH (n:${INFO} {label: $label}) RETURN n`;
    let searchResult = await executeGenericQuery(driver, searchQuery, {
        label: label
    })
    if (searchResult.records.length != 0)
        throw "cannot create duplicate labels for info nodes"

    let query = `MERGE (n:${INFO} {label: $label, snippet: $snippet, nodeId: $nodeId}) RETURN n.nodeId AS nodeId`;
    let result = await executeGenericQuery(driver, query, {
        label: label, snippet: snippet, nodeId: getId()
    })
    return {
        id: getField(result, "nodeId"),
        label: label,
        snippet: snippet
    }
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

const getNodeById = async (driver: Driver, nodeId: any) => {
    let query = `MATCH (n:${BOTH}) WHERE n.nodeId = $nodeId RETURN n`;
    return await executeGenericQuery(driver, query, {
        nodeId: nodeId
    });
}

const findOrCreateClassificationNode = async (driver: Driver, label: string) => {
    let query = `MERGE (n:${CLASS} {label: $label, nodeId: $nodeId}) RETURN n.nodeId AS nodeId, n.label AS label`;
    let result = await executeGenericQuery(driver, query, {
        label: label,
        nodeId: getId()
    })

    return {
        id: getField(result,"nodeId"),
        label: getField(result, "label")
    }
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

const upVoteRelationship = async (driver: Driver, relId: string)=> {
    const query =  `MATCH ()-[r {relId: $relId}]->() SET r.value = r.value + 1 RETURN r`;
    return await executeGenericQuery(driver, query, {
        relId: relId
    })
}

const relationshipExistsBetweenNodes = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, relationshipLabel: string): Promise<boolean> => {
    const query = `MATCH (n1 {nodeId: '${nodeIdFrom}'})-[:${formatLabel(relationshipLabel)}]-(n2 {nodeId: '${nodeIdTo}'}) RETURN EXISTS((n1)-[:${formatLabel(relationshipLabel)}]-(n2))`;
    const result = await executeGenericQuery(driver, query, {});
    console.warn("REL EXISTS BTW NODES")
    console.log(result);
    return getField(result, "EXISTS((n1)-[:MY_LABEL]-(n2))");
}

const getOrCreateRelationship = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, relationshipLabel: string) => {
    if (relationshipLabel.includes("-"))
        throw "labels cannot include hyphens";

    const checkNodesQuery = 'MATCH (n1 {nodeId: $nodeIdFrom}), (n2 {nodeId: $nodeIdTo}) RETURN n1, n2';
    const checkResult = await executeGenericQuery(driver, checkNodesQuery, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo
    })
    if (checkResult.records.length == 0)
        throw Error("cannot find nodes to connect")

    const query =
        `MERGE (n1 {nodeId: $nodeIdFrom})-[r:${formatLabel(relationshipLabel)}]->(n2 {nodeId: $nodeIdTo})
        ON CREATE SET r.votes = 0
        RETURN r`;
    const result = await executeGenericQuery(driver, query, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo
    });
    return getField(result, "r");
}

const getRelationshipById = async(driver: Driver, relId: string) => {
    const query =  `MATCH ()-[r {relId: '${relId}'}]->() RETURN r`;
    return getField(await executeGenericQuery(driver, query, {}), 'r');
}

interface Connection {
    label: string,
    from: boolean,
    to: boolean
}

interface RequestBody {
    infoNode: {
        label: string,
        info: string
    },
    classificationNodes: string[],
    connections: Connection[]
}

const createStack = async(driver: Driver, body: RequestBody)=> {
    const classificationNodes = body.classificationNodes;
    const infoNode = body.infoNode;

    //1. create classification nodes
    const classId1 = await findOrCreateClassificationNode(driver, classificationNodes[0]);
    const classId2 = await findOrCreateClassificationNode(driver, classificationNodes[1]);
    const classId3 = await findOrCreateClassificationNode(driver, classificationNodes[2]);

    //2. create info node
    const infoId = createInformationNode(driver, infoNode.label, infoNode.info);

    //3. connect the nodes
    if (body.connections.length != 3)
        throw "invalid number of connections";

    // for (const c of body.connections) {
    //     //between 1 and 2
    //     if (await relationshipExistsBetweenNodes(driver, classId1.id, classId2.id, c.label))
    //         upVoteRelationship()
    // }
}

export default {
    createInformationNode,
    clearDB,
    removeNode,
    getNodeById,
    createRelationship,
    getRelationshipById,
    findOrCreateClassificationNode,
    getOrCreateRelationship,
    relationshipExistsBetweenNodes
}