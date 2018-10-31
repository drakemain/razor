import * as express from 'express';
import * as bParse from 'body-parser';

const app = express();
const port = 3000;

app.use(bParse.json());
app.use(bParse.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello');
});

app.post('/slice', (req, res) => {
    console.log(req.body);
    res.send(req.body);
});

app.listen(port, () => { console.log(`Listening to port ${port}.`); });