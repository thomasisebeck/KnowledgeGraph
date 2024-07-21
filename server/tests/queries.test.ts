import {Driver, Relationship} from 'neo4j-driver'
import q, {CreateStackReturnBody, NodeRelationship, nodeType, RequestBody} from '../queries'
import sess from '../session'
import 'dotenv/config'

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
        await q.clearDB(driver);
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
    //     let result = await q.createOrRetrieveInformationNode(driver, 'myNewInfoNode', "I am a new information node!");
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

    // test('create relationship and get by ID', async () => {
    //     if (driver == null)
    //         throw "Driver is null"
    //
    //     console.log("CREATE INFO NODE 1")
    //     let fromRes = await q.createOrRetrieveInformationNode(driver, 'fromLabel', "I am a snippet in the from node");
    //     console.log("CREATE INFO NODE 2")
    //     let toRes = await q.createOrRetrieveInformationNode(driver, 'toLabel', "I am a snippet in the to node");
    //
    //     const label = "my label"
    //     console.log("CREATE REL")
    //     let newID = await q.getOrCreateRelationship(driver, fromRes.nodeId, toRes.nodeId, label);
    //     expect(newID).not.toBe(null);
    //
    //     console.log("SEE IF REL EXISTS")
    //     let exists = await q.relationshipExistsBetweenNodes(driver, fromRes.nodeId, toRes.nodeId, label);
    //     expect(exists).toBe(true);
    //
    //     console.log("FIND REL BY ID")
    //     let findById = await q.getRelationshipById(driver, newID.relId);
    //     console.log(findById);
    //
    // }, 10000)
    //
    // test('get node by label', async () => {
    //     if (driver == null)
    //         throw "Driver is null"
    //
    //     await q.createOrRetrieveInformationNode(driver, 'myNode1', "I am a snippet in the from node");
    //     await q.createOrRetrieveInformationNode(driver, 'myNode2', "I am a snippet in the to node");
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
    // }, 15000)
    //
    // test('getOrCreateRel', async () => {
    //
    //     if (driver == null)
    //         fail("driver is null")
    //
    //     let info1 = await q.createOrRetrieveInformationNode(driver, 'relInfo1', "I am a snippet in the from node");
    //     let class1 = await q.findOrCreateClassificationNode(driver, "classNode1");
    //     let class2 = await q.findOrCreateClassificationNode(driver, "classNode2");
    //
    //     //shouldn't exist
    //     let relExists = await q.relationshipExistsBetweenNodes(driver, info1.nodeId, class1.nodeId, "rel info1 class1");
    //     expect(relExists).toBe(false);
    //     relExists = await q.relationshipExistsBetweenNodes(driver, class2.nodeId, class1.nodeId, "rel class2 class1");
    //     expect(relExists).toBe(false);
    //
    //    let getRel1 = await q.getOrCreateRelationship(driver, info1.nodeId, class1.nodeId, "rel info1 class1");
    //    let getRel2 = await q.getOrCreateRelationship(driver, class2.nodeId, class1.nodeId, "rel class2 class1");
    //
    //    expect(getRel1.type).toBe("REL_INFO1_CLASS1")
    //    expect(getRel2.type).toBe("REL_CLASS2_CLASS1")
    //
    //     //should exist
    //     relExists = await q.relationshipExistsBetweenNodes(driver, info1.nodeId, class1.nodeId, "rel info1 class1");
    //     expect(relExists).toBe(true);
    //     relExists = await q.relationshipExistsBetweenNodes(driver, class2.nodeId, class1.nodeId, "rel class2 class1");
    //     expect(relExists).toBe(true);
    //
    // }, 15000)

    test('create stack', async () => {

        if (driver == null)
            fail("driver is null")

       const request: RequestBody = {
           infoNode: {
               snippet: "If you have ever owned a puppy, you would know that they are the best",
               label: "dogs are the best"
           },
           classificationNodes: [
             "animals",
             "pets",
             "dogs"
           ],
           connections: [
               "subset",
               "subset",
               "subset"
           ],
           doubleSided: [
               true,
               false,
               false
           ]
       }

        const request2: RequestBody = {
            infoNode: {
                snippet: "I love it when cats purr",
                label: "cat purring"
            },
            classificationNodes: [
                "animals",
                "pets",
                "cats"
            ],
            connections: [
                "goes into",
                "subset",
                "subset"
            ],
            doubleSided: [
                true,
                false,
                false
            ]
        }
        console.log("Creating stack...");

       const result = await q.createStack(driver, request);

       //todo: create the stack again, to see if the votes changed
        const result2 = await q.createStack(driver, request);

        const nodes = result2.nodes;
        const rels = result2.relationships;

        //check nodes
        expect(nodes[0].label).toBe("animals")
        expect(nodes[0].nodeType).toBe(nodeType.CLASSIFICATION)
        expect(nodes[1].label).toBe("pets")
        expect(nodes[1].nodeType).toBe(nodeType.CLASSIFICATION)
        expect(nodes[2].label).toBe("dogs")
        expect(nodes[2].nodeType).toBe(nodeType.CLASSIFICATION)
        expect(nodes[3].label).toBe("dogs are the best")
        expect(nodes[3].nodeType).toBe(nodeType.INFORMATION);
        expect(nodes[3].snippet).toBe("If you have ever owned a puppy, you would know that they are the best");

        //check rels and double sided!!!!
        // for (let i = 0; i < 3; i++) {
        //     expect(rels[i].type).toBe('SUBSET')
        //     expect(rels[i].votes).toBe(2)
        // }
        //
        // const result3 = await q.createStack(driver, request2);

    }, 45000)


})