import 'dotenv/config'
import {Driver, EagerResult, PathSegment, RecordShape} from "neo4j-driver";

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
    if (result.records && result.records[0].has(field))
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
    return await executeGenericQuery(driver, query, {
        label: label, nodeId: newId
    }).then(result =>  getField(result, "nodeId"))
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
    let query = `MATCH (from {nodeId: $nodeIdFrom}), (to {nodeId: $nodeIdTo}) CREATE (from)-[rel:${formatLabel(label)} {relId: $relId}]${connection}(to)`;
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

type Segment = {
    relId: string, startNodeId: string, endNodeId: string, label: string
}

function formatSegment(seg: PathSegment): Segment {
   return {
       relId: seg.relationship.properties.relId,
       startNodeId: seg.start.properties.nodeId,
       endNodeId: seg.end.properties.nodeId,
       label: seg.relationship.type
   }
}

const formatNode = (node: { properties: { nodeId: any; label: any; }; }) => {
    return {
        nodeId: node.properties.nodeId,
        label: node.properties.label
    }
}

const containsSegment = (array: Segment[], relIdToFind: string): boolean => {
    for (let seg of array)
       if (seg.relId == relIdToFind)
           return true;
    return false;
}

type GraphNode = {
    nodeId: string, label: string
}

const containsNode = (array: GraphNode[], nodeIdToFind: string) => {
    for (let node of array)
        if (node.nodeId == nodeIdToFind)
            return true;
    return false;
}

const formatNearestNeighbors = (records: any) => {
    console.log("FORMATTING:")
    console.dir(records, {depth: null});
    console.log("-----------------------------")

    //1. add nodes
    let nodes: GraphNode[] = [];
    let segments: Segment[]= [];
    for (let r of records.records) {
        let startNode = formatNode(r._fields[0].start);
        let endNode = formatNode(r._fields[0].end);

        for (let seg of r._fields[0].segments) {
            console.log("checking segment: ");
            console.dir(seg, {depth: null})
            !containsSegment(segments, seg.relationship.properties.relId) && segments.push(formatSegment(seg));
        }

        !containsNode(nodes, startNode.nodeId) && nodes.push(startNode);
        !containsNode(nodes, endNode.nodeId) && nodes.push(endNode);
    }

    return {
        nodes: nodes,
        segments: segments
    }

}

const getNearestNeighbors = async(driver: Driver, nodeId: string, depth: number)=> {
    //MATCH p=(startNode {nodeId: 'lx7m2urp0.jjgtbf9t'})-[*1..3]->(neighbor) RETURN neighbor, p
    const query = `MATCH p=(startNode {nodeId: '${nodeId}'})-[*1..${depth}]->(neighbor) WITH DISTINCT p RETURN p`;
    return formatNearestNeighbors(await executeGenericQuery(driver, query, {}));
}

export default {
    createInformationNode,
    createClassificationNode,
    clearDB,
    removeNode,
    getNodeById,
    createRelationship,
    relationshipExistsBetweenNodes,
    getRelationshipById,
    getNearestNeighbors
}

//return all nodes
/*
MATCH (startNode)-[]->(neighbor)
RETURN startNode, neighbor
 */