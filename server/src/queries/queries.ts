import 'dotenv/config'
import {Driver, Relationship} from "neo4j-driver";
import * as crypto from "node:crypto";
import {executeGenericQuery, formatLabel, getField} from "../utils";
import {
    CreateStackReturnBody,
    Direction,
    Neo4jNode,
    Node,
    NodeRelationship,
    RequestBody,
    RequestBodyConnection,
    UpvoteResult,
    ROOT,
    INFO,
    BOTH,
    CLASS,
    Segment
} from "../../../shared/interfaces";


// get nodes fully connected:
// MATCH (n)-[r]-() RETURN n,r
// delete:
// MATCH (n) DETACH DELETE n

//----------------------------- CREATION / MODIFICATION FUNCTIONS -----------------------------//

const findOrCreateInformationNode = async (driver: Driver, label: string, snippet: string): Promise<Node> => {

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
            label: label,
            snippet: snippet,
            nodeType: INFO
        }
    }

    let query = `MERGE (n:${INFO} {label: $label, snippet: $snippet, nodeId: $nodeId}) RETURN n.nodeId AS nodeId`;
    let {records, summary} = await executeGenericQuery(driver, query, {
        label: label, snippet: snippet, nodeId: crypto.randomUUID()
    })
    console.log("DONE")
    return {
        nodeId: getField(records, "nodeId"),
        label: label,
        snippet: snippet,
        nodeType: INFO
    }

}

const createRootNode = async (driver: Driver, label: string): Promise<Node> => {
    const query =
        `MERGE (n:${ROOT} {label: $label}) 
        ON CREATE SET n.nodeId = '${crypto.randomUUID()}' 
        RETURN n.nodeId AS nodeId, n.label AS label`;

    let {records, summary} = await executeGenericQuery(driver, query, {
        label: label
    })

    return {
        nodeType: ROOT,
        nodeId: getField(records, "nodeId"),
        label: getField(records, "label")
    }

}

const findOrCreateClassificationNode = async (driver: Driver, label: string): Promise<Node> => {

    console.log("CALL findOrCreateClassificationNode")

    const query = `MERGE (n:${CLASS} {label: $label})
        ON CREATE SET n.nodeId = '${crypto.randomUUID()}'
        SET n.label = $label
        RETURN n.nodeId AS nodeId, n.label AS label`;

    let {records, summary} = await executeGenericQuery(driver, query, {
        label: label
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
        createRootNode(driver, "Computer &\nInfo Science"),
        createRootNode(driver, "Philosophy"),
        createRootNode(driver, "Psychology"),
        createRootNode(driver, "Science"),
        createRootNode(driver, "Language"),
        createRootNode(driver, "Technology"),
        createRootNode(driver, "Arts"),
        createRootNode(driver, "History"),
        createRootNode(driver, "Geography"),
    ]);

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
            const node = toAdd as Node;
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

    let rels: NodeRelationship[] = [];
    let nodes: Node[] = [];

    let fromNode: Node | null = null;
    let toNode: Node | null = null;

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
                const node = key == 'from' ? record.get('from') as Node : record.get('to');
                const toPush: Node = {
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

                    rels = tryPushToArray(toPush, rels, true);
                }
            }
        })
    })

    return {
        nodes: nodes,
        relationships: rels
    }
}

//todo: continue with this!!!!
const willNodeGetStranded = async (driver: Driver, nodeIdFrom: string, relId: string) => {
    const pathToRootQuery =
        `MATCH (start {nodeId: '${nodeIdFrom}'}), (end:${ROOT})
        MATCH path = shortestPath((start)-[*]-(end))
        RETURN path`


    //WHERE NONE (rel in relationships(path) WHERE rel.relId = '${relId}')

    // const pathToRootQuery =
    //    `MATCH (myNode {nodeId: '${nodeIdFrom}'})
    //     CALL apoc.path.shortest(myNode, {end_node: (root:${ROOT})}) YIELD path
    //     WHERE none(rel in relationships(path) WHERE rel.relId = '${relId}')
    //     RETURN path AS p`;

    console.log("trying to execute query...")
    const result = await executeGenericQuery(driver, pathToRootQuery, {})
    console.log("Result of node is stranded...")
    console.dir(result.records, {depth: null})
    const hasPath = getField(result.records, 'path')
    return true;
    return (hasPath === undefined);
}

//downvoteRelationship
//destroy connection when it gets to 0
//unless it creates a stray node, then just return - upvotes

const upVoteRelationship = async (driver: Driver, relId: string, mustUpvote: boolean): Promise<UpvoteResult> => {


    const query = `MATCH (from)-[r {relId: $relId}]->(to) SET r.votes = r.votes ${mustUpvote ? '+' : '-'} 1 RETURN r, from, to`;
    const result = await executeGenericQuery(driver, query, {
        relId: relId
    })

    const r = getField(result.records, "r") as Relationship;
    const from = getField(result.records, 'from') as Neo4jNode;
    const to = getField(result.records, 'to') as Neo4jNode;

    console.log("NODES")
    console.log(to)
    console.log(from)

    //if undefined remove
    if (!r) {
        return {
            relId: relId,
            votes: 0
        }
    }

    if (r.properties != null && r.properties.votes.toNumber() <= 0) {
        //1. Delete the relationship
        //2. if node is stranded, add it back with an (is deleted) connection

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

        console.log("Result of node is stranded...")
        console.log(mayBeStranded);

        if (!mayBeStranded) {
            return {
                relId: r.properties.relId,
                votes: 0
            }
        } else {
            console.log("KEEPING CONNECTION ALIVE")
            console.log("Adding connection back")

            const numRelsDeleted = result.summary.counters.updates().relationshipsDeleted;
            let res;
            if (numRelsDeleted === 1) {
                console.log("adding single sided connection")
                res = await findOrCreateRelationship(driver, from.properties.nodeId, to.properties.nodeId, r.type, Direction.AWAY);
            } else {
                console.log("adding double sided connection")
                res = await findOrCreateRelationship(driver, from.properties.nodeId, to.properties.nodeId, r.type, Direction.NEUTRAL);
            }

            console.dir(r, {depth: null})
            console.log("VOTES")
            console.log(r.properties.votes.toNumber());

            //keep connection alive
            return {
                relId: r.properties.relId,
                newRelId: res.relId,
                votes: 5
            }
        }

    }

    //prevent deletion if there isn't a path
    const newVotes = r.properties.votes.toNumber() > 0 ? r.properties.votes.toNumber() : 1;

    return {
        relId: r.properties.relId,
        votes: newVotes,
    };

    //
    //     console.log("VOTES = 0 or negative...")
    //
    //     //assume nodes will be stranded
    //     let fromWillBeStranded = false;
    //     let toWillBeStranded = false;
    //
    //     //won't be stranded if root
    //     //double check if not a root
    //     if (from.labels[0] != ROOT) {
    //         console.log("trying stranded from...")
    //         fromWillBeStranded = await willNodeGetStranded(driver, from.properties.nodeId, r.properties.relId);
    //         console.log("done")
    //
    //     }
    //     if (to.labels[0] != ROOT) {
    //         console.log("trying stranded to...")
    //         toWillBeStranded = await willNodeGetStranded(driver, to.properties.nodeId, r.properties.relId);
    //         console.log("done")
    //     }
    //
    //     console.log("stranded from:")
    //     console.log(fromWillBeStranded)
    //     console.log("stranded to:")
    //     console.log(toWillBeStranded)
    //
    //     //both won't get stranded, continue with deletion
    //     if (!fromWillBeStranded && !toWillBeStranded) {
    //         console.log("trying to delete")
    //         //remove the relationship
    //         const query = `MATCH ()-[r {relId: '${relId}'}]-() DELETE r`
    //         const result = await executeGenericQuery(driver, query, {})
    //         console.log("Setting votes to 0 to delete")
    //
    //         return {
    //             relId: r.properties.relId,
    //             votes: 0,
    //         }
    //
    //     } else {
    //         console.log("Node will get stranded, not deleting...")
    //     }
    //
    // }
    //
    // //prevent deletion if there isn't a path
    // const newVotes = r.properties.votes.toNumber() > 0 ? r.properties.votes.toNumber() : 1;
    //
    // return {
    //     relId: r.properties.relId,
    //     votes: newVotes,
    // };
}

const findOrCreateRelationship = async (driver: Driver, nodeIdFrom: string, nodeIdTo: string, connName: string, direction: Direction): Promise<NodeRelationship> => {
    const VOTES_ON_CREATION = 5;

    if (connName.includes("-"))
        throw "labels cannot include hyphens";

    //----------------- see if the nodes exist ----------------------//
    const checkNodesQuery = 'MATCH (n1 {nodeId: $nodeIdFrom}), (n2 {nodeId: $nodeIdTo}) RETURN n1, n2';
    let {records, summary} = await executeGenericQuery(driver, checkNodesQuery, {
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

    //NB: votes set to 5 intialiall
    for (const m of merges) {
        queries.push(
            `${m}
             MERGE (n1)-[r:${formatLabel(connName)}]->(n2)
             ON CREATE SET
             r.relId = '${REL_ID}',
             r.votes = ${VOTES_ON_CREATION}
             RETURN r`
        )
    }

    const queryFunctionCalls = queries.map(query => executeGenericQuery(driver, query, {
        nodeIdFrom: nodeIdFrom,
        nodeIdTo: nodeIdTo
    }))

    const myRels = await Promise.all([...queryFunctionCalls])
    const r = getField(myRels[0].records, "r");

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
   const index = array.findIndex(seg => seg.rel.properties.relId == segment.rel.properties.relId)
    if (index !== -1) //already there
        return array;

    console.log("PUSHING: ", segment.rel.properties.relId);

    return [{
        rel: {
            type: segment.rel.type,
            properties: {
                relId: segment.rel.properties.relId,
                votes: segment.rel.properties.votes.toNumber()
            }
        },
        endNodeId: segment.endNodeId,
        startNodeId: segment.startNodeId,
        isDoubleSided: segment.isDoubleSided
    }, ...array]
}

const convertSegmentsToNodeRelationships = (toRetSegments: Segment[]): NodeRelationship[] => {
    const res: NodeRelationship[] = [];

    for (const s of toRetSegments) {
       res.push({
           relId: s.rel.properties.relId,
           votes: s.rel.properties.votes,
           direction: s.isDoubleSided ? Direction.NEUTRAL : Direction.AWAY,
           type: s.rel.type,
           from: s.startNodeId,
           to: s.endNodeId
       })
    }

    return res;
}

const getNeighborhood = async (driver: Driver, nodeId: string, depth: number) => {
    console.log("ID: " + nodeId)
    console.log("DEPTH: " + depth)
    // const query =
    //     `MATCH (start {nodeId: '${nodeId}'})
    //      MATCH p=(start)-[r*..depth]-()
    //      RETURN p, start, r`
    //
    // const query =
    //     `MATCH (start {nodeId: '${nodeId}'})
    //     MATCH p=(start)-[r*..${depth}]-()
    //     UNWIND relationships(p) AS rel
    //     RETURN collect(DISTINCT {
    //     startNodeId: startNode(rel).nodeId,
    //     endNodeId: endNode(rel).nodeId,
    //     rel: rel
    //     }) AS segments`

    const query =
        `MATCH (start {nodeId: '${nodeId}'})
MATCH p=(start)-[r*..${depth}]->(end)
UNWIND relationships(p) AS rel
WITH rel, startNode(rel) AS startNode, endNode(rel) AS endNode
OPTIONAL MATCH (endNode)-[r2 {relId: rel.relId}]->(startNode)
RETURN collect(DISTINCT {
    startNodeId: startNode.nodeId,
    endNodeId: endNode.nodeId,
    rel: rel,
    isDoubleSided: r2 IS NOT NULL
}) AS segments`;

    console.dir("CALLED EXPAND NODE.....")

    const result = await driver.executeQuery(query, {})

    const segments = getField(result.records, 'segments') as Segment[];
    // console.dir(segments, {depth: null})

    let toRetSegments:Segment[] = [];

    for (const s of segments) {
        toRetSegments = tryPushSegment(s, toRetSegments);
    }

    // console.dir(toRetSegments, {depth: null})

    const relationships = convertSegmentsToNodeRelationships(toRetSegments);

    console.log("RETURNING")
    console.log(relationships);

    //todo: remove
    return [];

}

const createStack = async (driver: Driver, body: RequestBody): Promise<CreateStackReturnBody> => {

    console.log("create stack...")
    console.dir(body, {depth: null});

    console.log("pushing functions")
    //stack node function calls
    const nodeFunctionCalls = body.connections.map(((conn, index) => {
        return async () => {
            if (index == 0) { //root
                const rootNode = await getNodeById(driver, body.rootNodeId) as Neo4jNode;
                console.log("ROOOT")
                console.log(rootNode)
                return {
                    nodeType: ROOT,
                    nodeId: rootNode.properties.nodeId,
                    label: rootNode.labels[0]
                }
            }
            return findOrCreateClassificationNode(driver, conn.nodeName)
        }
    }));

    nodeFunctionCalls.push(
        async () => {
            return findOrCreateInformationNode(driver, body.infoNode.label, body.infoNode.snippet)
        }
    )

    console.log("calling...")

    console.dir("CALLS")
    console.dir(nodeFunctionCalls, {depth: null})

    //create all nodes
    const myNodes = await Promise.all(nodeFunctionCalls.map((call) => call()))

    console.log("NODES")
    console.log(myNodes)

    //stack connection function calls then fire to create connections
    const relFunctionCalls = body.connections.map((conn, index) =>
        async () => {
            console.log("MY NODE", myNodes[index])
            console.log("+ 1: ", myNodes[index + 1].nodeId)
            return findOrCreateRelationship(driver, myNodes[index].nodeId, myNodes[index + 1].nodeId, conn.connectionName, conn.direction)
        }
    );
    const myRelationships = await Promise.all(relFunctionCalls.map((call) => call()))

    //stack upvote function calls then fire to upvote all relationships
    const upvoteRelFunctionCalls = myRelationships.map((conn) =>
        async () => {
            return upVoteRelationship(driver, conn.relId, true)
        }
    )
    const upvotedRelationshipsCalls = await Promise.all(upvoteRelFunctionCalls.map((call) => call()))

    const upvotedRelationships: NodeRelationship[] = upvotedRelationshipsCalls.map((conn, index) => {
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

    console.log("queries.ts createStack AFTER CREATION....")
    console.dir({
        nodes: myNodes,
        relationships: myRelationships
    }, {depth: null})

    return {
        nodes: myNodes,
        relationships: upvotedRelationships
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
    getNeighborhood
}