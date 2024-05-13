import q from '../queries.js'
import sess from '../session.js'
import 'dotenv/config'

const URI = process.env.NEO4J_URI
const USER = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD
const DATABASE = process.env.DATABASE

//commit me for tests

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
       let id = await q.createInformationNode('myNewInfoNode', driver, "I am a new information node!");
       expect(id).not.toBe(null);
       nodeId = id;
    })

    test('remove info node by id', async () => {
        if (nodeId == null)
            fail("node id is null");
        await q.removeNode(nodeId, driver);
        let afterDelete = await q.getById(nodeId, driver);
        console.log(afterDelete);
    })

    // test('create and remove classification node', async () => {
    //     let id = await q.createClassificationNode('myNewNode', driver);
    //     expect(id).toBeGreaterThan(-1);
    //
    //     let node = await q.getById(id, driver);
    //     console.log(node);
    //
    //     let removeId = await q.removeNode(id, driver);
    //     expect(id).toBe(removeId);
    // })

})