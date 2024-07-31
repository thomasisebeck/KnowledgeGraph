import express from 'express';
import 'dotenv/config';
import {Driver} from "neo4j-driver";
import bodyParser from "body-parser";
import sess from './session'
import {createRelRequestBody, RequestBody} from "../../shared/interfaces";
import q from "./queries/queries"
import cors from 'cors'

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
        if (driver == null)
            throw "driver is null";

        const body = req.body as RequestBody;
        console.log("CREATE STACK REQUEST")
        console.log(body);

        const result = await q.createStack(driver, body);
        res.status(200).send(result);
    } catch (e) {
        res.status(400).send(e as string)
    }
})

app.post('/createRel', async (req, res) => {
    try {
        if (driver == null)
            throw "driver is null"
        const body = req.body as createRelRequestBody;
        await q.getOrCreateRelationship(driver, body.fromId, body.toId, body.name, body.doubleSided).then(result => {
            res.status(200).json(result);
        })
    } catch (e) {
        console.log("SERVER ERROR")
        console.log(e)
        res.status(500).json(e as string)
    }
})

app.get('/initialData', async (req, res) => {
    console.log("CALLED INIT DATA")
    try {
        await q.createTopicNodes(driver);

        //return all data
        await q.getAllData(driver).then(allData => {
            console.log("DATA")
            console.dir(allData, {depth: null})

            res.status(200).json({
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

        await q.upVoteRelationship(driver, rel, mustUpvote).then(result => {
            res.status(200).json({
                rel: result
            })
        })

        console.log("SENT")
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

app.listen(process.env.PORT, () => {
    console.log(`Running on PORT ${process.env.PORT}`);
})
