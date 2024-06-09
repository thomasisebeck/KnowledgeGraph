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
    await q.clearDB(driver);
  })

  afterAll(async () => {
    if (driver != null) {
      await sess.disconnect(driver);
      console.log("session closed")
    }
  })

  // test('create info node', async () => {
  //   if (driver == null)
  //     throw "Driver is null"
  //   let id = await q.createInformationNode(driver, 'myNewInfoNode', "I am a new information node!");
  //   expect(id).not.toBe(null);
  //   nodeId = id;
  // })
  //
  // test('remove info node by id', async () => {
  //   if (driver == null)
  //     throw "Driver is null"
  //   if (nodeId == null)
  //     fail("node id is null");
  //   await q.removeNode(nodeId, driver);
  //   let afterDelete = await q.getNodeById(driver, nodeId);
  //   console.log(afterDelete);
  // })
  //
  // test('create relationship and get by ID', async () => {
  //   if (driver == null)
  //     throw "Driver is null"
  //
  //   console.log("CREATE INFO NODE 1")
  //   let fromId = await q.createInformationNode(driver, 'fromLabel', "I am a snippet in the from node");
  //   console.log("CREATE INFO NODE 2")
  //   let toId = await q.createInformationNode(driver, 'toLabel', "I am a snippet in the to node");
  //
  //   const label = "my label"
  //   console.log("CREATE REL")
  //   let newID = await q.createRelationship(driver, fromId, toId, true, label);
  //   expect(newID).not.toBe(null);
  //
  //   console.log("SEE IF REL EXISTS")
  //   let exists = await q.relationshipExistsBetweenNodes(driver, fromId, toId, label);
  //   expect(exists).toBe(true);
  //
  //   console.log("FIND REL BY ID")
  //   let findById = await q.getRelationshipById(driver, newID);
  //   console.log(findById);
  //
  // }, 10000)

  // test('delete relationship', async () => {
  //
  // })

  test('get nearest neighbor', async () => {
    if (driver == null)
      throw "Driver is null"

    console.log("CREATE NODES")
    let center = await q.createClassificationNode(driver, 'center');

    //left branch
    let classInnerL = await q.createClassificationNode(driver, 'classInnerL');
    let classOuterL = await q.createClassificationNode(driver, 'classOuterL');
    let infoL1 = await q.createInformationNode(driver, 'infoL1', 'snippet');
    let infoL2 = await q.createInformationNode(driver, 'infoL2', 'snippet')

    //right branch
    let classInnerR = await q.createClassificationNode(driver, 'classInnerR');
    let classOuterR = await q.createClassificationNode(driver, 'classOuterR');
    let infoR1 = await q.createInformationNode(driver, 'infoR1', 'snippet');
    let infoR2 = await q.createInformationNode(driver, 'infoR2', 'snippet');

    console.log("CONNECT NODES");
    await q.createRelationship(driver, center, classInnerR, true, "CIR");
    await q.createRelationship(driver, center, classInnerL, true, "CIL");
    await q.createRelationship(driver,classInnerL, classOuterL , true, "ILO");
    await q.createRelationship(driver,classInnerR, classOuterR , true, "IRO");
    await q.createRelationship(driver,classOuterL, infoL1 , true, "LOI1");
    await q.createRelationship(driver,classOuterL, infoL2 , true, "LOI2");
    await q.createRelationship(driver,classOuterR, infoR1 , true, "ROI1");
    await q.createRelationship(driver,classOuterR, infoR2 , true, "ROI2");

    console.log("GET NEAREST NEIGHBORS")
    console.dir(await q.getNearestNeighbors(driver, center, 5), { depth: null, colors: true });

  }, 30000)

})