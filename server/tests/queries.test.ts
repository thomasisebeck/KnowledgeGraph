import {Driver} from 'neo4j-driver'
import q from '../queries'
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
  })

  afterAll(async () => {
    if (driver != null) {
      await q.clearDB(driver);
      await sess.disconnect(driver);
      console.log("session closed")
    }
  })

  test('create info node', async () => {
    if (driver == null)
      throw "Driver is null"
    let result = await q.createInformationNode(driver, 'myNewInfoNode', "I am a new information node!");
    expect(result).not.toBe(null);
    nodeId = result.id;
  })

  test('remove info node by id', async () => {
    if (driver == null)
      throw "Driver is null"
    if (nodeId == null)
      fail("node id is null");
    await q.removeNode(nodeId, driver);
    let afterDelete = await q.getNodeById(driver, nodeId);
    console.log(afterDelete);
  })

  test('create relationship and get by ID', async () => {
    if (driver == null)
      throw "Driver is null"

    console.log("CREATE INFO NODE 1")
    let fromRes = await q.createInformationNode(driver, 'fromLabel', "I am a snippet in the from node");
    console.log("CREATE INFO NODE 2")
    let toRes = await q.createInformationNode(driver, 'toLabel', "I am a snippet in the to node");

    const label = "my label"
    console.log("CREATE REL")
    let newID = await q.createRelationship(driver, fromRes.id, toRes.id, true, label);
    expect(newID).not.toBe(null);

    console.log("SEE IF REL EXISTS")
    let exists = await q.relationshipExistsBetweenNodes(driver, fromRes.id, toRes.id, label);
    expect(exists).toBe(true);

    console.log("FIND REL BY ID")
    let findById = await q.getRelationshipById(driver, newID);
    console.log(findById);

  }, 10000)

  test('get node by label', async () => {
    if (driver == null)
      throw "Driver is null"

    console.log("CREATE INFO NODE 1")
    let info1 = await q.createInformationNode(driver, 'myNode1', "I am a snippet in the from node");
    console.log("CREATE INFO NODE 2")
    let info2 = await q.createInformationNode(driver, 'myNode2', "I am a snippet in the to node");

    console.log("CREATE CLASS NODE 1")
    let class1 = await q.findOrCreateClassificationNode(driver, 'myNode3');
    console.log("CREATE CLASS NODE 2")
    let class2 = await q.findOrCreateClassificationNode(driver, 'myNode4');

    console.log("GET ALL NODES BY LABELS")
    let resclass1 = await q.findOrCreateClassificationNode(driver, "myNode3");
    let resclass2 = await q.findOrCreateClassificationNode(driver, "myNode4");

    expect(resclass1.label).toBe("myNode3");
    expect(resclass1.id).not.toBe(null);

    expect(resclass2.label).toBe("myNode4");
    expect(resclass2.id).not.toBe(null);
  }, 15000)

  test('getOrCreateRel', async () => {

    if (driver == null)
      fail("driver is null")

    let info1 = await q.createInformationNode(driver, 'relInfo1', "I am a snippet in the from node");
    let class1 = await q.findOrCreateClassificationNode(driver, "classNode1");
    let class2 = await q.findOrCreateClassificationNode(driver, "classNode2");

    let getRel1 = await q.getOrCreateRelationship(driver, info1.id, class1.id, "rel info1 class1");
    console.log("result 1");
    console.log(getRel1);
    let getRel2 = await q.getOrCreateRelationship(driver, class2.id, class1.id, "rel class2 class1");
    console.log("result 2");
    console.log(getRel2);

    let relExists = await q.relationshipExistsBetweenNodes(driver, info1.id, class1.id, "rel info1 class1");
    expect(relExists).toBe(true);

    relExists = await q.relationshipExistsBetweenNodes(driver, class2.id, class1.id, "rel class2 class1");
    expect(relExists).toBe(true);

  }, 15000)


})