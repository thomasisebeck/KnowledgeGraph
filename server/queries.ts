import 'dotenv/config'
import {Driver, EagerResult, Record, RecordShape} from "neo4j-driver";
import * as crypto from "node:crypto";

const DATABASE = process.env.DATABASE;

const INFO = 'InformationNode'
const CLASS = 'ClassificationNode'
const BOTH = `${INFO} | ${CLASS}`

//-------------------------- UTILITY FUNCTIONS ---------------------------------//

//const records: Record<RecordShape, PropertyKey, RecordShape<PropertyKey, number>>[]
const executeGenericQuery =  async (driver: Driver, query: string, params: any)  => {
    try {
        const { records, summary } = await driver.executeQuery(query, params, {
            database: DATABASE
        })
        return { records, summary };
    } catch (e) {
        console.error("ERROR");
        console.error(e);
        throw e;
    }
}

const getId = () => {
    return crypto.randomUUID();
}

const getField = (records: Record[] , field: string) => {
    return records?.at(0)?.get(field);
}

const formatLabel = (relationshipLabel:  string ) => {
    return relationshipLabel.replaceAll(' ', '_').toLocaleUpperCase();
}

const clearDB = async (driver: Driver) => {
    let query = 'MATCH (n) DETACH DELETE n';
    await executeGenericQuery(driver, query, {});
}
//----------------------------- CREATION FUNCTIONS -----------------------------//

const createInformationNode = async (driver: Driver,label: string, snippet: string) => {
    let searchQuery = `MATCH (n:${INFO} {label: $label}) RETURN n`;
    let searchResult = await executeGenericQuery(driver, searchQuery, {
        label: label
    })
    if (searchResult.summary.counters.updates().nodesCreated == 0)
        throw "cannot create duplicate labels for info nodes"

    let query = `MERGE (n:${INFO} {label: $label, snippet: $snippet, nodeId: $nodeId}) RETURN n.nodeId AS nodeId`;
    let { records, summary} = await executeGenericQuery(driver, query, {
        label: label, snippet: snippet, nodeId: crypto.randomUUID()
    })
    return {
        id: getField(records, "nodeId"),
        label: label,
        snippet: snippet
    }
}

const createRelationship = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, directed: boolean, label: string): Promise<string> => {
    let connection = directed ? "->" : "-"
    let newId = crypto.randomUUID();
    let query = `CREATE (from {nodeId: $nodeIdFrom})-[rel:${formatLabel(label)} {relId: $relId}]${connection}(to {nodeId: $nodeIdTo})`;
    let {records, summary} = await executeGenericQuery(driver, query, {
        nodeIdFrom: nodeIdFrom, nodeIdTo: nodeIdTo, relId: newId
    });

    if (summary.counters.updates().relationshipsCreated !== 1)
        throw "failed to create relationship";

    return newId;
}

const findOrCreateClassificationNode = async (driver: Driver, label: string) => {
    let query = `MERGE (n:${CLASS} {label: $label, nodeId: $nodeId}) RETURN n.nodeId AS nodeId, n.label AS label`;
    let {records, summary} = await executeGenericQuery(driver, query, {
        label: label,
        nodeId: crypto.randomUUID()
    })

    return {
        id: getField(records, "nodeId"),
        label: getField(records, "label"),
    }
}

//----------------------------- FINDING / CREATION FUNCTIONS -----------------------------//

const relationshipExistsBetweenNodes = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, relationshipLabel: string): Promise<boolean> => {
    const query = `MATCH (n1 {nodeId: '${nodeIdFrom}'})-[:${formatLabel(relationshipLabel)}]-(n2 {nodeId: '${nodeIdTo}'}) RETURN EXISTS((n1)-[:${formatLabel(relationshipLabel)}]-(n2))`;
    const { records, summary} = await executeGenericQuery(driver, query, {});
    console.warn("REL EXISTS BTW NODES")


    console.log(records.at(0)?.get(`EXISTS((n1)-[:${formatLabel(relationshipLabel)}]-(n2))`));
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

const upVoteRelationship = async (driver: Driver, relId: string)=> {
    const query =  `MATCH ()-[r {relId: $relId}]->() SET r.value = r.value + 1 RETURN r`;
    return await executeGenericQuery(driver, query, {
        relId: relId
    })
}

const getOrCreateRelationship = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, relationshipLabel: string) => {
    if (relationshipLabel.includes("-"))
        throw "labels cannot include hyphens";

    const checkNodesQuery = 'MATCH (n1 {nodeId: $nodeIdFrom}), (n2 {nodeId: $nodeIdTo}) RETURN n1, n2';
    let { records, summary} = await executeGenericQuery(driver, checkNodesQuery, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo
    })

    let nodesFound = 0;
    for (let record of records) {
        nodesFound++;
    }
    if (nodesFound != 2)
        throw "cannot find nodes to connect"

    const query =
        `MERGE (n1 {nodeId: $nodeIdFrom})-[r:${formatLabel(relationshipLabel)}]->(n2 {nodeId: $nodeIdTo})
        ON CREATE SET r.votes = 0, r.relId = $relId
        RETURN r`;

    let result = await executeGenericQuery(driver, query, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo,
        relId: crypto.randomUUID()
    });
    return result.records.at(0)?.get("r");
}

const getRelationshipById = async(driver: Driver, relId: string) => {
    const query =  `MATCH ()-[r {relId: '${relId}'}]->() RETURN r`;
    const { records } = await executeGenericQuery(driver, query, {});
    return records.at(0)?.get("r")
}

const createStack2 = async(body: RequestBody)=> {
    const classificationNodes = body.classificationNodes;
    const infoNode = body.infoNode;

    //error: Element implicitly has an any type because expression of type 0 can't be used to index type string[
    console.log(classificationNodes[0]);


    //error: length does not exist on type Connection[]
    if (body.connections.length == 3)
        throw "invalid number of connections";

    //works
    for (const c of body.connections) { //no error
        //between 1 and 2
    }
}

const createStack = async(driver: Driver, body: RequestBody)=> {
    const classificationNodes = body.classificationNodes;
    const infoNode = body.infoNode;

    //error: Element implicitly has an any type because expression of type 0 can't be used to index type string[
    const classId1 = await findOrCreateClassificationNode(driver, classificationNodes[0]!);

    //works
    const classId2 = await findOrCreateClassificationNode(driver,  classificationNodes.at(1)!);
    const classId3 = await findOrCreateClassificationNode(driver, classificationNodes.at(2)!);

    const infoId = createInformationNode(driver, infoNode.label, infoNode.info);

    //error: length does not exist on type Connection[]
    if (body.connections.length == 3)
        throw "invalid number of connections";

    //works
    for (const c of body.connections) { //no error
        //between 1 and 2
        if (await relationshipExistsBetweenNodes(driver, classId1.id, classId2.id, c.label)) {

        }
    }
}

//--------------------------- INTERFACES ----------------------------------//

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