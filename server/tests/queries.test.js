import q from '../queries.js'
import sess from '../session.js'
import 'dotenv/config'

const URI = process.env.NEO4J_URI
const USER = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD
const DATABASE = process.env.DATABASE
describe('queries', () => {
    let driver;
    let nodeId;

    beforeAll(async () => {
        driver = await sess.connect(URI, USER, PASSWORD);
        expect(driver).not.toBe(null);
    })

    afterAll(async () => {
        if (driver != null) {
            await sess.disconnect(driver);
            console.log("session closed")
        }
    })

    test('create info node', async () => {
       let id = await q.createInformationNode(driver,'myNewInfoNode', "I am a new information node!");
       expect(id).not.toBe(null);
       nodeId = id;
    })

    test('remove info node by id', async () => {
        if (nodeId == null)
            fail("node id is null");
        await q.removeNode(nodeId, driver);
        let afterDelete = await q.getById(driver, nodeId);
        console.log(afterDelete);
    })

    test('create relationship', async ()=> {
        let fromId = await q.createInformationNode(driver, 'fromLabel', "I am a snippet in the from node");
        let toId = await q.createInformationNode(driver, 'toLabel', "I am a snippet in the to node");

        //above working

        const label = "my label"
        let newID = await q.createRelationship(driver, fromId, toId, true, label);
        expect(newID).not.toBe(null);

        let exists = await q.relationshipExistsBetweenNodes(driver, fromId, toId, label);
        expect(exists).toBe(true);
    })

    // test('delete relationship', async () => {
    //
    // })

})