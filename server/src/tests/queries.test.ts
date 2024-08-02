import {Driver, Relationship} from 'neo4j-driver'
import q from "../queries/queries"
import sess from '../session'
import 'dotenv/config'
import {clearDB} from "../utils";
import {nodeType, RequestBody, Direction} from "../../../shared/interfaces";

const URI = process.env.NEO4J_URI
const USER = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD
const DATABASE = process.env.DATABASE

//commit me for tests

describe('queries', () => {
    let driver: Driver | null;
    let nodeId: string;

    beforeAll(async () => {
        if (URI === undefined || USER === undefined || PASSWORD == undefined || DATABASE == undefined)
            throw "Can't make connection, env var is undefined";

        driver = await sess.connect(URI, USER, PASSWORD);
        if (driver == null)
            throw "Driver is null"
        expect(driver.executeQuery).not.toBe(null);
        await clearDB(driver);
    })

    afterAll(async () => {
        if (driver != null) {
            await sess.disconnect(driver);
            console.log("session closed")
        }
    })

    // test('create info node', async () => {
    //     if (driver == null)
    //         throw "Driver is null"
    //     let result = await q.findOrCreateInformationNode(driver, 'myNewInfoNode', "I am a new information node!");
    //     expect(result).not.toBe(null);
    //     nodeId = result.nodeId;
    // })
    //
    // test('remove info node by id', async () => {
    //     if (driver == null)
    //         throw "Driver is null"
    //     if (nodeId == null)
    //         fail("node id is null");
    //     await q.removeNode(nodeId, driver);
    //     let afterDelete = await q.getNodeById(driver, nodeId);
    //     console.log(afterDelete);
    // })
    //
    // test('create relationship and get by ID', async () => {
    //     if (driver == null)
    //         throw "Driver is null"
    //
    //     // console.log("CREATE INFO NODE 1")
    //     let fromRes = await q.findOrCreateInformationNode(driver, 'fromLabel', "I am a snippet in the from node");
    //     // console.log("CREATE INFO NODE 2")
    //     let toRes = await q.findOrCreateInformationNode(driver, 'toLabel', "I am a snippet in the to node");
    //
    //     // console.log("CREATE REL")
    //     let newID = await q.getOrCreateRelationship(driver, fromRes.nodeId, toRes.nodeId, {
    //         name: "TOWARDS",
    //         direction: Direction.TOWARDS
    //     });
    //     expect(newID).not.toBe(null);
    //
    //     //todo: implement
    //
    // }, 15000)
    //
    // test('get node by label', async () => {
    //     if (driver == null)
    //         throw "Driver is null"
    //
    //     await q.findOrCreateInformationNode(driver, 'myNode1', "I am a snippet in the from node");
    //     await q.findOrCreateInformationNode(driver, 'myNode2', "I am a snippet in the to node");
    //
    //     await q.findOrCreateClassificationNode(driver, 'myNode3');
    //     let class2 = await q.findOrCreateClassificationNode(driver, 'myNode4');
    //
    //     let resclass1 = await q.findOrCreateClassificationNode(driver, "myNode3");
    //     let resclass2 = await q.findOrCreateClassificationNode(driver, "myNode4");
    //
    //     expect(resclass1.label).toBe("myNode3");
    //     expect(resclass1.nodeId).not.toBe(null);
    //
    //     expect(resclass2.label).toBe("myNode4");
    //     expect(resclass2.nodeId).not.toBe(null);
    //
    //     //todo: implement
    //
    // }, 15000)
    //
    // test('getOrCreateRel', async () => {
    //
    //     if (driver == null)
    //         fail("driver is null")
    //
    //     let info1 = await q.findOrCreateInformationNode(driver, 'relInfo1', "I am a snippet in the from node");
    //     let class1 = await q.findOrCreateClassificationNode(driver, "classNode1");
    //     let class2 = await q.findOrCreateClassificationNode(driver, "classNode2");
    //
    //     //shouldn't exist
    //     let relExists = await q.relationshipExistsBetweenNodes(driver, info1.nodeId, class1.nodeId, "rel info1 class1");
    //     expect(relExists).toBe(false);
    //     relExists = await q.relationshipExistsBetweenNodes(driver, class2.nodeId, class1.nodeId, "rel class2 class1");
    //     expect(relExists).toBe(false);
    //
    //     //create neutral connection
    //     let getRel1 = await q.getOrCreateRelationship(driver, info1.nodeId, class1.nodeId, {
    //         name: "rel info1 class1",
    //         direction: Direction.NEUTRAL
    //     });
    //     //create neutral connection
    //     let getRel2 = await q.getOrCreateRelationship(driver, class2.nodeId, class1.nodeId, {
    //         name: "rel class2 class1",
    //         direction: Direction.NEUTRAL
    //     });
    //
    //     expect(getRel1.type).toBe("REL_INFO1_CLASS1")
    //     expect(getRel2.type).toBe("REL_CLASS2_CLASS1")
    //
    //     //should exist
    //     relExists = await q.relationshipExistsBetweenNodes(driver, info1.nodeId, class1.nodeId, "rel info1 class1");
    //     expect(relExists).toBe(true);
    //     relExists = await q.relationshipExistsBetweenNodes(driver, class2.nodeId, class1.nodeId, "rel class2 class1");
    //     expect(relExists).toBe(true);
    //
    // }, 15000)

    test('connection directions', async () => {
        if (driver == null)
            fail("driver is null")


        const functionCalls = [
            q.findOrCreateClassificationNode(driver, "from1"),
            q.findOrCreateClassificationNode(driver, "to1"),
            q.findOrCreateClassificationNode(driver, "from2"),
            q.findOrCreateClassificationNode(driver, "to2"),
            q.findOrCreateClassificationNode(driver, "from3"),
            q.findOrCreateClassificationNode(driver, "to3")
        ];

        const nodes = await Promise.all(functionCalls);
        console.dir(nodes, {depth: null});

        const relFunctionCalls = [
            //from->to AWAY
            q.getOrCreateRelationship(driver, nodes[0].nodeId, nodes[1].nodeId, {name: "ONE", direction: Direction.AWAY}),
            //from<-to TOWARDS
            q.getOrCreateRelationship(driver, nodes[2].nodeId, nodes[3].nodeId, {name: "TWO", direction: Direction.TOWARDS}),
            //NEUTRAL
            q.getOrCreateRelationship(driver, nodes[4].nodeId, nodes[5].nodeId, {name: "THREE", direction: Direction.NEUTRAL}),
        ]

        console.log("RELS RESULT")
        const rels = await Promise.all(relFunctionCalls);
        console.dir(rels, {depth: null});

        expect(rels[0].from).toBe(nodes[0].nodeId)
        expect(rels[0].to).toBe(nodes[1].nodeId)

        expect(rels[1].from).toBe(nodes[3].nodeId)
        expect(rels[1].to).toBe(nodes[2].nodeId)

        expect(rels[2].from).toBe(nodes[4].nodeId)
        expect(rels[2].to).toBe(nodes[5].nodeId)


    }, 20000)

    // test('create stack', async () => {
    //
    //     if (driver == null)
    //         fail("driver is null")
    //
    //     const request: RequestBody = {
    //         infoNode: {
    //             snippet: "If you have ever owned a puppy, you would know that they are the best",
    //             label: "dogs are the best"
    //         },
    //         classificationNodes: [
    //             "animals",
    //             "pets",
    //             "dogs"
    //         ],
    //         connections: [
    //             {name: "subset", direction: Direction.NEUTRAL},
    //             {name: "subset", direction: Direction.NEUTRAL},
    //             {name: "subset", direction: Direction.NEUTRAL},
    //         ],
    //     }
    //
    //     const request2: RequestBody = {
    //         infoNode: {
    //             snippet: "I love it when cats purr",
    //             label: "cat purring"
    //         },
    //         classificationNodes: [
    //             "animals",
    //             "pets",
    //             "cats"
    //         ],
    //         connections: [
    //             {name: "subset", direction: Direction.NEUTRAL},
    //             {name: "subset", direction: Direction.NEUTRAL},
    //             {name: "subset", direction: Direction.NEUTRAL},
    //         ],
    //     }
    //     console.log("Creating stack...");
    //
    //     const result = await q.createStack(driver, request);
    //
    //
    //
    // }, 45000)


})