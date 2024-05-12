import q from '../queries.js'
import sess from '../session.js'
import 'dotenv/config'

const URI = process.env.NEO4J_URI
const USER = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD
const DATABASE = process.env.DATABASE
describe('queries', () => {
    let driver;

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

    test('createInfoNode', async () => {
       let id = await q.createInformationNode('myNewInfoNode', driver, "I am a new information node!");
       expect(id).toBeGreaterThan(-1);
    })
})