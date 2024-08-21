import express from 'express';
import 'dotenv/config';
import {Driver} from "neo4j-driver";
import bodyParser from "body-parser";
import sess from './session'
import {ConnectionPath, CreateRelRequestBody, RequestBody, UpvoteResult} from "../../shared/interfaces";
import q from "./queries/queries"
import cors from 'cors'
import * as fs from "node:fs";

const app = express();
app.use(bodyParser.json())
app.use(cors())

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

app.post('/createStack', async (req, res) => {
    try {
        const body = req.body as RequestBody;
        console.log("serve.ts /createStack CREATE STACK REQUEST")
        console.log(body);

        const result = await q.createStack(driver, body);
        res.status(200).send(result);
    } catch (e) {
        console.error(e);
        res.status(400).send(e as string)
    }
})

app.post('/createRel', async (req, res) => {
    try {

        const body = req.body as CreateRelRequestBody;
        console.log("connection")
        console.log(body.direction)
        console.log("casted")


        await q.findOrCreateRelationship(driver, body.fromId, body.toId, body.name, body.direction).then(result => {
            res.status(200).json(result);
        })
    } catch (e) {
        console.log("SERVER ERROR")
        console.log(e)
        res.status(500).json(e as string)
    }
})

app.get('/initialData', async (req, res) => {
    console.log("CALLED INITIAL DATA")
    try {
        await q.createTopicNodes(driver).then(nodes => {
            res.status(200).json({
                topicNodes: nodes
            })
        })
    } catch (e) {
        console.error(e)
        res.status(400).json(e as string);
    }
})

app.get('/allData', async (req, res) => {
    console.log("CALLED ALL DATA")
    try {
        const topicNodes = await q.createTopicNodes(driver);

        //return all data
        await q.getAllData(driver).then(allData => {
            console.log("DATA")
            console.dir(allData, {depth: null})

            res.status(200).json({
                topicNodes: topicNodes,
                nodes: allData.nodes,
                relationships: allData.relationships
            });
        })

    } catch (e) {
        console.error(e)
        res.status(400).json(e as string);
    }
})

async function upOrDownVote(req: any, res: any, mustUpvote: boolean) {
    try {
        const relString: string = req.body.relId;
        let rel = relString.substring(relString.indexOf("]-[") + 3, relString.length);
        rel = rel.substring(0, relString.indexOf("]-[") - 1);

        await q.upVoteRelationship(driver, rel, mustUpvote).then(upvoted => {
            const result: UpvoteResult = {
                relId: upvoted.relId,
                votes: upvoted.votes,
                newRelId: upvoted.newRelId
            }
            res.status(200).json(result)
        })
    } catch (e) {
        console.error(e)
        res.status(400).json(e as string)
    }
}

app.post('/upvoteRel', async (req, res) => {
    await upOrDownVote(req, res, true);
})

app.post('/downvoteRel', async (req, res) => {
    await upOrDownVote(req, res, false);
})

app.post('/tasks', async (req, res) => {

    const FILE_PATH = './tasks.json'

    const taskData = req.body;

    // Read existing data, handle potential errors
    let existingData = '[]'; // Default to empty array if file doesn't exist
    try {
        existingData = fs.readFileSync(FILE_PATH, 'utf8');
    } catch (err) {
        console.error('Error reading file:', err);
    }

    const parsedData = JSON.parse(existingData);
    parsedData.push(taskData); // Add new task to the array

    const updatedData = JSON.stringify(parsedData, null, 4); // Stringify with indentation

    fs.writeFile(FILE_PATH, updatedData, {encoding: 'utf8'}, (err) => {
        if (err) {
            console.error(err)
            res.status(400).json({
                success: false,
                error: err
            })
        } else {
            console.log("Task written successfully");
            res.status(200).json({
                success: true
            })
        }
    })
})

app.get('/neighborhood/:id/:depth', async (req, res) => {
    try {
        if (req.params.id == null || typeof req.params.id != "string")
            throw "node id is null or not a string"
        if (req.params.depth == null || typeof req.params.depth != "string")
            throw "depth is null or not a number"

        const depth = Number(req.params.depth);
        console.log("ID")
        console.log(req.params.id);
        const neighborhood = await q.getNeighborhood(driver, req.params.id, depth);
        res.status(200).send(neighborhood);

    } catch (e) {
        console.error(e)
        res.status(400).json(e as string);
    }
})

app.get('/nodeName/:id', async (req, res) => {
    try {
        if (req.params.id == null)
            return res.status(400).json("cannot find node because id is null");

        const result = await q.getNodeById(driver, req.params.id);

        res.status(200).json(result);
    } catch (e) {
        console.error(e)
        res.status(400).json(e as string);
    }
})

app.get('/suggest/:query', async (req, res) => {
    try {
        if (req.params.query == null)
            return res.status(400).json("query is null");

        const result = await q.fuzzySearchLabel(driver, req.params.query);
        console.log("RESULT")
        console.log(result)
        res.status(200).json(result);

    } catch (e) {
        console.error(e)
        res.status(400).json(e as string);
    }
})

app.post('/connectionPath', async (req, res) => {
    try {
        const body = req.body as ConnectionPath;
        const result = await q.createConnectionPath(driver, body);
        res.status(200).json(result)

    } catch (e) {
        console.error(e)
        res.status(400).json(e as string);
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Running on PORT ${process.env.PORT}`);
})
