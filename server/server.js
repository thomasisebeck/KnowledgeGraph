import express from 'express';
import neo4j from 'neo4j-driver';
import 'dotenv/config';
const app = express();
import q from './queries.js'

const URI = process.env.NEO4J_URI
const USER = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD
const DATABASE = process.env.DATABASE

async function connect() {
    let driver;

    try {
        driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
        const serverInfo = await driver.getServerInfo()
        console.log('Connection established')
        return driver;
    } catch (err) {
        console.log(`Connection error\n${err}\nCause: ${err.cause}`)
        await driver?.close()
        return null;
    }
}

//connection
(async () => {
    let driver = await connect();
    // await q.createInformationNode('my first node!', driver, DATABASE)
    // await q.createInformationNode('info on dogs!', driver, DATABASE, 'Hello there, here is info on dogs')
    await q.createClassificationNode('dogs', driver, DATABASE);
})();

app.get('/', (req, res) => {
    res.send('GeeksforGeeks');
})
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Running on PORT ${process.env.SERVER_PORT}`);
})

