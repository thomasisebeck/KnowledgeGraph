import 'dotenv/config'
import {Driver, Relationship} from "neo4j-driver";
import * as crypto from "node:crypto";
import {executeGenericQuery, getField, toSnakeCase} from "../utils";
import {
    BOTH,
    CLASS,
    ConnectionPath,
    CreateStackReturnBody,
    Direction,
    GraphNode,
    INDEX_NAME,
    INFO,
    INITIAL_VOTES,
    Neo4jNode,
    NodeRelationship,
    RequestBody,
    ROOT,
    Segment,
    UpvoteResult
} from "../../../shared/interfaces";


// get nodes fully connected:
// MATCH (n)-[r]-() RETURN n,r
// delete:
// MATCH (n) DETACH DELETE n

//----------------------------- CREATION / MODIFICATION FUNCTIONS -----------------------------//

const findOrCreateInformationNode = async (driver: Driver, label: string, snippet: string): Promise<GraphNode> => {

    console.log("CALL findOrCreateInformationNode")

    let searchQuery = `MATCH (n:${INFO} {label: $label}) RETURN n.nodeId AS nodeId`;
    let searchResult = await executeGenericQuery(driver, searchQuery, {
        label: label
    })
    console.log("DONE FINDING")
    if (searchResult.records.length != 0) {
        //node already created, return it
        console.log("DONE")
        return {
            nodeId: getField(searchResult.records, "nodeId"),
            label: toSnakeCase(label),
            snippet: snippet,
            nodeType: INFO
        }
    }

    let query = `MERGE (n:${INFO} {label: $label, snippet: $snippet, nodeId: $nodeId}) RETURN n.nodeId AS nodeId`;
    let {records} = await executeGenericQuery(driver, query, {
        label: toSnakeCase(label), snippet: snippet, nodeId: crypto.randomUUID()
    })
    console.log("DONE")
    return {
        nodeId: getField(records, "nodeId"),
        label: toSnakeCase(label),
        snippet: snippet,
        nodeType: INFO
    }

}


const createRootNode = async (driver: Driver, label: string): Promise<GraphNode> => {
    const query =
        `MERGE (n:${ROOT} {label: $label}) 
        ON CREATE SET n.nodeId = '${crypto.randomUUID()}' 
        RETURN n.nodeId AS nodeId, n.label AS label`;

    let {records} = await executeGenericQuery(driver, query, {
        label: toSnakeCase(label)
    })

    return {
        nodeType: ROOT,
        nodeId: getField(records, "nodeId"),
        label: getField(records, "label")
    }

}

const findOrCreateClassificationNode = async (driver: Driver, label: string): Promise<GraphNode> => {

    console.log("CALL findOrCreateClassificationNode")

    const query = `MERGE (n:${CLASS} {label: $label})
        ON CREATE SET n.nodeId = '${crypto.randomUUID()}'
        SET n.label = $label
        RETURN n.nodeId AS nodeId, n.label AS label`;

    let {records} = await executeGenericQuery(driver, query, {
        label: toSnakeCase(label)
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

    //create the index when you make the topic nodes
    const createIndexQuery = `CREATE FULLTEXT INDEX ${INDEX_NAME} IF NOT EXISTS FOR (n:CLASS) ON EACH [n.label]`
    await executeGenericQuery(driver, createIndexQuery, {})

     const topicNodes = await Promise.all([
        createRootNode(driver, "Existence"), //being, reality, possibility
        createRootNode(driver, "Ethics"), //morality, right vs wrong, conscience
        createRootNode(driver, "Logic"), //reasoning, deduction, mathematics, truth
        createRootNode(driver, "Culture"), //customs, traditions, art, literature
        createRootNode(driver, "Nature"), //physical phenomenons, environment
        createRootNode(driver, "Belief"), //faith, religion, spirituality
    ]);

    for (const t of topicNodes) {
        rootNodeIds.push(t.nodeId)
    }

    return topicNodes;

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

const rootNodeIds: string[] = [];

const getAllData = async (driver: Driver) => {
    const allNodesQuery =
        `MATCH (from)-[r1]->(to)
        WITH from, r1, to
        OPTIONAL MATCH (toNode { nodeId: to.nodeId })-[r2 { relId: r1.relId }]->(fromNode { nodeId: from.nodeId}) 
        WHERE id(r2) <> id(r1)
        RETURN from, to, to.snippet, from.snippet, r1, r2 IS NOT NULL AS is_double_sided`;

    const rootNodesQuery =
        `MATCH (n:${ROOT}) RETURN n`;

    const [result, rootNodes] = await Promise.all([
        executeGenericQuery(driver, allNodesQuery, {}),
        executeGenericQuery(driver, rootNodesQuery, {}),
    ])

    let relationships: NodeRelationship[] = [];
    let nodes: GraphNode[] = [];

    let fromNode: GraphNode | null = null;
    let toNode: GraphNode | null = null;

    //only get root nodes
    rootNodes.records.forEach(record => {
        const node = getField([record], 'n');
        nodes = tryPushToArray({
            label: node.properties.label,
            nodeType: node.labels[0],
            nodeId: node.properties.nodeId,
        }, nodes);
    })

    result.records.forEach(record => {
        record.keys.forEach((key) => {

            //first get from node
            //then get to node
            //then get r
            if (key == 'from' || key == 'to') {
                const node = key == 'from' ? record.get('from') as Neo4jNode : record.get('to');
                const toPush: GraphNode = {
                    label: node.properties.label,
                    nodeType: node.labels[0],
                    nodeId: node.properties.nodeId,
                    snippet: node.properties.snippet
                }
                nodes = tryPushToArray(toPush, nodes);

                if (key == 'from') //push to from
                    fromNode = toPush;
                if (key == 'to')
                    toNode = toPush;
            } else if (key == 'r1') {
                const rel = record.get('r1');
                if (fromNode != null && toNode != null) {

                    console.warn("DOUBLE: ", record.get('is_double_sided'));

                    const toPush = {
                        to: toNode.nodeId,
                        from: fromNode.nodeId,
                        votes: rel.properties.votes.toNumber(),
                        relId: rel.properties.relId,
                        type: rel.type,
                        direction: record.get('is_double_sided') ? Direction.NEUTRAL : Direction.AWAY
                    }

                    relationships = tryPushToArray(toPush, relationships, true);
                }
            }
        })
    })

    return {
        nodes: nodes,
        relationships: relationships
    }
}

//down vote Relationship
//destroy connection when it gets to 0
//unless it creates a stray node, then just return - up votes

const upVoteRelationship = async (driver: Driver, relId: string, mustUpvote: boolean): Promise<UpvoteResult> => {

    console.log("TO MATCH: ")
    console.log(relId)


    const query = `MATCH (from)-[r {relId: $relId}]-(to) SET r.votes = r.votes ${mustUpvote ? '+' : '-'} 1 RETURN r, from, to`;
    const result = await executeGenericQuery(driver, query, {
        relId: relId
    })

    const r = getField(result.records, "r") as Relationship;
    const from = getField(result.records, 'from') as Neo4jNode;
    const to = getField(result.records, 'to') as Neo4jNode;

    //if undefined remove
    if (!r) {
        console.error("UNDEFINED!")
        console.error("CHECK QUERY")
        return {
            relId: relId,
            votes: 0
        }
    }

    console.log("votes to number")
    console.log(r.properties.votes.toNumber())

    if (r.properties != null && r.properties.votes.toNumber() <= 0) {
        //1. Delete the relationship
        //2. if node is stranded, add it back with an (is deleted) connection

        console.warn("VOTES ARE ZERO")

        const query = `MATCH ()-[r {relId: '${relId}'}]-() DELETE r`
        const result = await executeGenericQuery(driver, query, {})

        const fromStranded = `
            MATCH (start {nodeId: '${from.properties.nodeId}'}), (end:${ROOT})
            MATCH path = shortestPath((start)-[*]-(end))
            RETURN path IS NOT NULL as path_exists`

        const toStranded = `
            MATCH (start {nodeId: '${to.properties.nodeId}'}), (end:${ROOT})
            MATCH path = shortestPath((start)-[*]-(end))
            RETURN path IS NOT NULL as path_exists`

        const toExecute = [];

        //check if either node is stranded...
        if (to.labels.indexOf(ROOT) == -1) {
            //to not a root, push query
            toExecute.push(toStranded)
        }
        if (from.labels.indexOf(ROOT) == -1) {
            //from not a root, push query
            toExecute.push(fromStranded)
        }

        const strandedResults = await Promise.all(toExecute.map(
            async fun => await executeGenericQuery(driver, fun, {})
        ));

        let mayBeStranded = false;

        for (const res of strandedResults) {
            console.log(res)
            if (res.records.length == 0)
                mayBeStranded = true;
        }

        if (!mayBeStranded) {
            //delete connection
            return {
                relId: r.properties.relId,
                votes: 0
            }
        } else {
            console.log("KEEPING CONNECTION ALIVE")
            console.log("Adding connection back")

            const numRelationshipsDeleted = result.summary.counters.updates().relationshipsDeleted;
            let res: NodeRelationship;
            if (numRelationshipsDeleted === 1) {
                console.log("adding single sided connection")
                res = await findOrCreateRelationship(driver, from.properties.nodeId, to.properties.nodeId, r.type,
                    Direction.AWAY, true);
            } else {
                console.log("adding double sided connection")
                res = await findOrCreateRelationship(driver, from.properties.nodeId, to.properties.nodeId, r.type,
                    Direction.NEUTRAL, true);
            }

            console.log("VOTES")
            console.log(res.relId);

            //keep connection alive
            return {
                relId: r.properties.relId,
                newRelId: res.relId,
                votes: res.votes
            }
        }

    }

    //prevent deletion if there isn't a path
    const newVotes = r.properties.votes.toNumber() > 0 ? r.properties.votes.toNumber() : 1;

    return {
        relId: r.properties.relId,
        votes: newVotes,
    };

}

const findOrCreateRelationship = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, connName: string, direction: Direction, addingBack: boolean = false): Promise<NodeRelationship> => {

    if (connName.includes("-"))
        throw "labels cannot include hyphens";

    //----------------- see if the nodes exist ----------------------//
    const checkNodesQuery = 'MATCH (n1 {nodeId: $nodeIdFrom}), (n2 {nodeId: $nodeIdTo}) RETURN n1, n2';
    let {records} = await executeGenericQuery(driver, checkNodesQuery, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo
    })

    let node1 = getField(records, "n1");
    let node2 = getField(records, "n2");

    if (node1 == null || node2 == null)
        throw "cannot find nodes to connect"


    //----------------- create the connections ----------------------//

    const REL_ID = crypto.randomUUID();

    //merge forms part of a query
    const merges = [];
    const AWAY = `MATCH (n1 {nodeId: $nodeIdFrom}), (n2 {nodeId: $nodeIdTo})`;
    const TOWARDS = `MATCH (n1 {nodeId: $nodeIdTo}), (n2 {nodeId: $nodeIdFrom})`;

    switch (direction) {
        case Direction.NEUTRAL:
            merges.push(AWAY)
            merges.push(TOWARDS)
            break;
        case Direction.AWAY: //normal
            merges.push(AWAY)
            break;
        case Direction.TOWARDS: //backwards
            merges.push(TOWARDS)
    }

    const queries = [];

    //NB: votes set to 5 initially
    for (const m of merges) {
        queries.push(
            `${m}
             MERGE (n1)-[r:${toSnakeCase(connName)}]->(n2)
             ON CREATE SET
             r.relId = '${REL_ID}',
             r.votes = ${addingBack ? 1 : INITIAL_VOTES}
             RETURN r`
        )
    }

    const queryFunctionCalls = queries.map(query => executeGenericQuery(driver, query, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo
    }))

    const myRelationships = await Promise.all(queryFunctionCalls)
    const r = getField(myRelationships[0].records, "r");

    return {
        to: nodeIdTo,
        from: nodeIdFrom,
        type: r.type,
        relId: r.properties.relId,
        votes: r.properties.votes.toNumber(),
        direction: direction
    }

}

const tryPushSegment = (segment: Segment, array: Segment[]): Segment[] => {
    const forwardLinkIndex = array.findIndex(seg => seg.rel.properties.relId == segment.rel.properties.relId)
    const newArray = array;

    if (forwardLinkIndex == -1) {//not found
        newArray.push({
            rel: {
                type: segment.rel.type,
                properties: {
                    relId: segment.rel.properties.relId,
                    votes: segment.rel.properties.votes.toNumber()
                }
            },
            endNodeId: segment.endNodeId,
            startNodeId: segment.startNodeId,
            isDoubleSided: segment.isDoubleSided,
        })
    }

    if (segment.distinctBacklink != null) {
        console.log("BACKLINK: ")
        console.log(segment.distinctBacklink)


        const backLinkIndex = array.findIndex(seg => seg.rel.properties.relId == segment.distinctBacklink.properties.relId);

        if (backLinkIndex == -1) {
            newArray.push({
                rel: {
                    type: segment.distinctBacklink.type,
                    properties: {
                        relId: segment.distinctBacklink.properties.relId,
                        votes: segment.distinctBacklink.properties.votes.toNumber()
                    },
                },
                endNodeId: segment.startNodeId,
                startNodeId: segment.endNodeId,
                isDoubleSided: false
            })
        }
    }

    return newArray;
}

const convertSegmentsToNodeRelationships = (toRetSegments: Segment[]): NodeRelationship[] => {
    const res: NodeRelationship[] = [];

    console.log('converting segments');

    for (const s of toRetSegments) {
        console.log(s);

        res.push({
            relId: s.rel.properties.relId,
            votes: s.rel.properties.votes,
            direction: s.isDoubleSided ? Direction.NEUTRAL : Direction.AWAY,
            type: s.rel.type,
            from: s.startNodeId,
            to: s.endNodeId
        })
    }

    console.log('done')

    return res;
}

const getNeighborhood = async (driver: Driver, nodeId: string, depth: number) => {

    if (rootNodeIds.indexOf(nodeId) != -1) {
        console.log("is a root node")
        depth = 1;
    }

    const relationshipsQuery =
        `MATCH (start {nodeId: '${nodeId}'})
        MATCH p=(start)-[*..${depth + 1}]-(end)
        WITH p, relationships(p) AS rels
        UNWIND rels AS rel
        WITH p, rel, startNode(rel) AS startNode, endNode(rel) AS endNode
        OPTIONAL MATCH (endNode)-[r2 {relId: rel.relId}]->(startNode)
        OPTIONAL MATCH (endNode)-[distinctBacklink]->(startNode)
        RETURN collect(DISTINCT {
                startNodeId: startNode.nodeId,
                    endNodeId: endNode.nodeId,
                    rel: rel,
                    isDoubleSided: r2 IS NOT NULL,
                    distinctBacklink: distinctBacklink
        }) AS segments`;


    const nodeQuery =
        `MATCH (start {nodeId: '${nodeId}'})-[*..${depth}]-(neighbors)
        RETURN neighbors`

    const [resultRelationships, nodeResult] = await Promise.all([
        await driver.executeQuery(relationshipsQuery, {}),
        await driver.executeQuery(nodeQuery, {})
    ]);

    const segments = getField(resultRelationships.records, 'segments') as Segment[];
    // console.dir(segments, {depth: null})

    let toRetSegments: Segment[] = [];
    let toRetNodes: Node[] = [];

    for (const s of segments) {
        console.log(s.isDoubleSided)
        toRetSegments = tryPushSegment(s, toRetSegments);
    }

    for (const n of nodeResult.records) {
        const neighbors = getField([n], 'neighbors');
        const newNode: GraphNode = {
            nodeId: neighbors.properties.nodeId,
            label: neighbors.properties.label,
            nodeType: neighbors.labels[0],
            snippet: neighbors.properties.snippet,
        }
        toRetNodes = tryPushToArray(newNode, toRetNodes, false);
    }

    // console.log("--------------------------")
    // console.log({
    //     relationships: convertSegmentsToNodeRelationships(toRetSegments),
    //     nodes: toRetNodes
    // })
    // console.log("--------------------------")

    return {
        relationships: convertSegmentsToNodeRelationships(toRetSegments),
        nodes: toRetNodes
    }

}

const createConnectionPath = async (driver: Driver, body: ConnectionPath): Promise<CreateStackReturnBody> => {

    console.log("CREATE CONNECTION PATH");

    const nodeFunctionCalls = body.nodes.map(async nodeName => {
        return await findOrCreateClassificationNode(driver, nodeName);
    })

    const myNodes = await Promise.all([...nodeFunctionCalls]);

    let index = 0;

    console.log("NUM NODES")
    console.log(myNodes.length)
    console.log("NUM CONN")
    console.log(body.connections.length)

    const relFunctionCalls = body.connections.map(async (conn, index) => {
        let fromNodeId;

        if (index == 0)
            fromNodeId = body.firstNodeId;
        else
            fromNodeId = myNodes[index - 1].nodeId;

        let toNodeId;
        if (index == body.connections.length - 1)
            toNodeId = body.secondNodeId
        else
            toNodeId = myNodes[index].nodeId;

        index++;
        return await findOrCreateRelationship(driver, fromNodeId, toNodeId, conn.label, conn.direction);
    })

    const myRels = await Promise.all([...relFunctionCalls]);

    return {
        nodes: myNodes,
        relationships: myRels
    }


}


const createStack = async (driver: Driver, body: RequestBody): Promise<CreateStackReturnBody> => {
    console.log("create stack...")

    //stack node function calls
    let nodeFunctionCalls = body.connections.map(async (conn, index) => {
        if (index == 0) { //root
            const rootNode = await getNodeById(driver, body.rootNodeId) as Neo4jNode;
            return {
                nodeType: ROOT,
                nodeId: rootNode.properties.nodeId,
                label: rootNode.labels[0]
            }
        }
        return await findOrCreateClassificationNode(driver, conn.nodeName);
    });

    nodeFunctionCalls.push(findOrCreateInformationNode(driver, body.infoNode.label, body.infoNode.snippet))

    //create all nodes
    const myNodes = await Promise.all(nodeFunctionCalls)


    //stack connection function calls then fire to create connections
    const relFunctionCalls = body.connections.map(async (conn, index) => {
        return findOrCreateRelationship(driver, myNodes[index].nodeId, myNodes[index + 1].nodeId,
            conn.connectionName, conn.direction)
    });
    const myRelationships = await Promise.all(relFunctionCalls)

    //stack upvote function calls then fire to upvote all relationships
    const upvoteRelFunctionCalls = myRelationships.map((conn) => {
        return upVoteRelationship(driver, conn.relId, true)
    })
    const upVotedRelationshipsCalls = await Promise.all(upvoteRelFunctionCalls)

    const upVotedRelationships: NodeRelationship[] = upVotedRelationshipsCalls.map((conn, index) => {
        //only thing that needs to change is the votes
        return {
            relId: myRelationships[index].relId,
            votes: conn.votes,
            from: myRelationships[index].from,
            direction: myRelationships[index].direction,
            type: myRelationships[index].type,
            to: myRelationships[index].to
        }
    })

    return {
        nodes: myNodes,
        relationships: upVotedRelationships
    }
}
//----------------------------- DOES EXIST FUNCTIONS -----------------------------//

const relationshipExistsBetweenNodes = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, relationshipLabel: string): Promise<boolean> => {
    const query = `MATCH (n1 {nodeId: '${nodeIdFrom}'})-[:${toSnakeCase(
        relationshipLabel)}]-(n2 {nodeId: '${nodeIdTo}'}) RETURN EXISTS((n1)-[:${toSnakeCase(
        relationshipLabel)}]-(n2))`;
    const {records} = await executeGenericQuery(driver, query, {});

    if (records.length == 0)
        return false;

    return getField(records, `EXISTS((n1)-[:${toSnakeCase(relationshipLabel)}]-(n2))`);
}

const getNodeById = async (driver: Driver, nodeId: any): Promise<Neo4jNode> => {
    console.log("CALL getNodeById")
    let query = `MATCH (n) WHERE n.nodeId = $nodeId RETURN n`;
    const result = await executeGenericQuery(driver, query, {
        nodeId: nodeId
    });
    return getField(result.records, 'n') as Neo4jNode;
}

const getRelationshipById = async (driver: Driver, relId: string) => {
    const query = `MATCH ()-[r {relId: '${relId}'}]->() RETURN r`;
    const {records} = await executeGenericQuery(driver, query, {});
    return records.at(0)?.get("r")
}

/*
 CALL db.index.fulltext.queryNodes("movieNamesIndex", "title:matrix")
 YIELD node, score
 RETURN node.title as title, score
 */
const fuzzySearchLabel = async (driver: Driver, searchQuery: string) => {
    const query =
        `CALL db.index.fulltext.queryNodes("${INDEX_NAME}", "label:*${searchQuery}*")
        YIELD node, score
        RETURN node.label AS label, score
        LIMIT 10`

    const {records, summary} = await executeGenericQuery(driver, query, {})

    const result = [];
    for (const record of records) {
        result.push(getField([record], 'label'));
    }
    return result;
}

export default {
    findOrCreateInformationNode,
    removeNode,
    getNodeById,
    getRelationshipById,
    findOrCreateClassificationNode,
    findOrCreateRelationship,
    relationshipExistsBetweenNodes,
    createStack,
    createTopicNodes,
    upVoteRelationship,
    getAllData,
    getNeighborhood,
    fuzzySearchLabel,
    createConnectionPath
}