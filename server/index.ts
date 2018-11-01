import * as querystring from 'querystring';

import * as express from 'express';
import * as bParse from 'body-parser';

import { hash } from './hash';

const app = express();
const port = 3000;

app.use(bParse.json());

app.get('/', (req, res) => {
    res.send('Hello');
});

app.post('/sharpen', (req, res) => {
    const endpoint: string = 'http://localhost:3000/blade';
    const url: string = req.body.url;

    (async () => {
        const hashedUrl = await hash(url);
        const blade = endpoint + '?' + querystring.stringify({url, hash: hashedUrl});

        console.log(blade);

        res.redirect(302, blade);
    })();
});

app.post('/blade', (req, res) => {
    const url: string = 'localhost:3000/b/' + req.query.hash;
    res.send(url);
});

app.get('/blade', (req, res) => {
    console.log(req.query);
    res.send('success');
});

app.get('/b/:hash', (req, res) => {
    console.log(req.params.hash);
    res.send('success');
});

app.listen(port, () => { console.log(`Listening to port ${port}.`); });