import * as path from 'path';

import * as express from 'express';
import * as bParse from 'body-parser';
import * as expressHB from 'express-handlebars';

import { hash, getUrl as resHash } from './hash';

const app = express();

app.engine('handlebars', expressHB({
    defaultLayout: 'main',
    layoutsDir: path.resolve('server', 'views', 'layouts'),
    partialsDir: path.resolve('server', 'views', 'partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.resolve('server', 'views'));

app.use(bParse.json());
app.use(bParse.urlencoded({extended: true}));
app.use(express.static('client'));

app.get('/', (req, res) => {
    console.log(req.headers.host);

    app.render('index', (e, html) => {
        if (e) {
           errorHandler(e, res);
        } else {
            res.send(html);
        }
    });
});

app.get('/blade/:hash', (req, res) => {
    const hash: string = req.params.hash;

    (async () => {
        const url: string = await resHash(hash);

        if (!url) {
            res.status(400).render('dne', undefined, (e, html) => {
                if (e) {
                    errorHandler(e, res);
                } else {
                    res.send(html);
                }
            });
        } else {
            const b: string = hashToLink(hash, req.headers.host);

            res.render('blade', {url, b}, (e, html) => {
                if (e) {
                    errorHandler(e, res);
                } else {
                    res.send(html);
                }
            });
        }
    })();
});

app.get('/b/:hash', (req, res) => {
    (async () => {
        const url = await resHash(req.params.hash);

        console.log(`Someone visited ${url}`);

        if (url) {
            res.redirect(url);
        } else {
            res.status(400).send('bad hash');
        }
    })();
});

app.post('/sharpen', (req, res) => {
    let url: string = req.body.url;

    // TODO: allow for non-http protocols (regex?)
    if (url.slice(0, 7) !== 'http://' || url.slice(0, 8) !== 'https://') {
        url = 'http://' + url;
    }

    (async () => {
        const hashedUrl = await hash(url);
        res.redirect('/blade/' + hashedUrl);
    })();
});

const errorHandler = (e: Error, res: express.Response) => {
    console.error(e);

    res.send('ERROR');
};

const hashToLink = (hash: string, host: string) => {
    return 'http://' + host + '/b/' + hash;
};

app.listen(process.env.port, () => { console.log(`Listening to port ${process.env.port}.`); });