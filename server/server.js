import express from 'express';
import 'dotenv/config';
import sess from './session.js'
import q from './queries.js'

const app = express();

const URI = process.env.NEO4J_URI
const USER = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD

//connect here
(async () => {

})();

app.get('/', (req, res) => {
    res.send('GeeksforGeeks');
})
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Running on PORT ${process.env.SERVER_PORT}`);
})