import express from 'express';
import 'dotenv/config';
import {Driver} from "neo4j-driver";
import bodyParser from "body-parser";

import q, {RequestBody} from "./queries";
import sess from './session'

const app = express();
app.use(bodyParser.json())


let driver: Driver;

// connect here
(async () => {

    if (
        process.env.NEO4J_URI == undefined ||
        process.env.NEO4J_USERNAME == undefined ||
        process.env.NEO4J_PASSWORD == undefined ||
        process.env.PORT == undefined
    )
        throw "cannot start server with undefined variables"
    try {
        driver = await sess.connect(
            process.env.NEO4J_URI,
            process.env.NEO4J_USERNAME,
            process.env.NEO4J_PASSWORD,
        );
    } catch (e) {
        console.error("Unable to connect: ")
        console.error(e)
        process.exit(1)
    }

})();

app.get('/', (req, res) => {
    res.send('HELLO WORLD');
})

/*
{
    infoNode: {
        label: "nodeLabel", -> infoNode
        snippet: "info",
    },
    classificationNodes: [
        {
            label: "nodeLabel",
            outwards: true,
            inwards: true
        },
        {
            label: "nodeLabel",
            outwards: true,
            inwards: true
        },
        {
            label: "nodeLabel",
            outwards: true,
            inwards: true
        },
    ]
}
*/
/*

app.post('/createStack', async (req, res) => {

    const nodes = req.body.classificationNodes;
    const infoNode = req.body.infoNode;
    if (!nodes) {
        res.json({
            success: false,
            message: "nodes are null"
        });
        return;
    }
    if (nodes.length != 3) {
        res.json({
            success: false,
            message: "invalid number of classification nodes, must be 3"
        });
        return;
    }
    if (!infoNode) {
        res.json({
            success: false,
            message: 'info node is null'
        })
        return;
    }

    const body = req.body as RequestBody;
    try {
        await q.createStack(driver, body);
    } catch (e) {
        res.json({
            success: false,
            message: e as string
        })

        return ;
    }

    res.json({
        success: true,
    })
}) */

app.post('/createStack', async (req, res) => {

    try {
        if (driver == null)
            throw "driver is null";

        const body = req.body as RequestBody;
        console.log("CREATE STACK REQUEST")
        console.log(body);

        const result = await q.createStack(driver, body);
        res.status(200).send(result);
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e as string
        })
    }

})

app.get('/topicNodes', (req, res) => {
    //todo: create topic nodes
    q.createTopicNodes(driver).then(result => {
        console.log('After creating topic nodes');
        console.log(result);
    });

    //todo: send result

})

app.listen(process.env.PORT, () => {
    console.log(`Running on PORT ${process.env.PORT }`);
})
