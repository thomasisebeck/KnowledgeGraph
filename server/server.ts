import express from 'express';
import 'dotenv/config';
import sess from './session'

const app = express();
import q from "./queries";
import {Driver} from "neo4j-driver";


let driver: Driver;

//connect here
(async () => {

    if (
        process.env.NEO4J_URI == undefined ||
        process.env.NEO4J_USERNAME == undefined ||
        process.env.NEO4J_PASSWORD == undefined
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
    res.send('My app is running');
})
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Running on PORT ${process.env.SERVER_PORT}`);
})

/*
{
    infoNode: {
        label: "nodeLabel", -> infoNode
        info: "info",
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


app.get('/initialData', (req, res) => {

})

app.post('/createStack', (req, res) => {

    //3. connect nodes

})