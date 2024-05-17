import express from 'express';
import 'dotenv/config';
import sess from './session'
const app = express();


//connect here
(async () => {

})();

app.get('/', (req, res) => {
    res.send('GeeksforGeeks');
})
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Running on PORT ${process.env.SERVER_PORT}`);
})