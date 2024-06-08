import express from 'express';
import 'dotenv/config';
import sess from './session'
const app = express();


//connect here
(async () => {

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

app.post('/createStack', (req, res) => {

})