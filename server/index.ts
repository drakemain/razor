import * as path from 'path';

import * as express from 'express';
import * as bParse from 'body-parser';
import * as expressHB from 'express-handlebars';
import * as validurl from 'valid-url';

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
    let url: string;
    (async () => {
        try {
            url = await resHash(hash);

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
        } catch (e) {
            console.error(e);
            res.status(500).send('There was a problem with the server.');
        }

    })();
});

app.get('/b/:hash', (req, res) => {
    let url: string;

    (async () => {
        try {
            url = await resHash(req.params.hash);

            console.log(`Someone visited ${url}`);

            if (url) {
                res.redirect(url);
            } else {
                res.status(400).send('bad hash');
            }
        } catch (e) {
            console.error(e);
            res.status(500).send('There was a problem with the server.');
        }
    })();
});

app.post('/sharpen', (req, res) => {
    const url: string = req.body.url;
    let hashedUrl: string;

    if (validurl.isHttpUri(url) || validurl.isHttpsUri(url)) {
        (async () => {
            try {
                hashedUrl = await hash(url);

                res.redirect('/blade/' + hashedUrl);
            } catch (e) {
                console.error(e);
                res.status(500).send('There was a problem with the server.');
            }
        })();
    } else {
        res.send('invalid url');
    }
});

const errorHandler = (e: Error, res: express.Response) => {
    console.error(e);

    res.send('ERROR');
};

const hashToLink = (hash: string, host: string) => {
    return 'http://' + host + '/b/' + hash;
};


const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`Listening to port ${port}.`); });