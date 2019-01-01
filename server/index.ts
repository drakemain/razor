import * as path from 'path';

import * as express from 'express';
import * as bParse from 'body-parser';
import * as expressHB from 'express-handlebars';
import * as validurl from 'valid-url';

import { hash, getUrl as resHash } from './hash';
import { clickThrough, hashRequest } from './analytics';

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
    genericRender(res, 'index');
});

app.get('/blade/:hash', (req, res) => {
    const hash: string = req.params.hash;
    let url: string;
    (async () => {
        try {
            url = await resHash(hash);

            if (!url) {
                throw new Error('The requested hash does not exist!');
            } else {
                const b: string = hashToLink(hash, req.headers.host);
                const options = {url, b};
                genericRender(res, 'blade', options);
                hashRequest(hash);
            }

        } catch (e) {
            errorHandler(e, res);
        }
    })();
});

app.get('/b/:hash', (req, res) => {
    let url: string;

    (async () => {
        try {
            url = await resHash(req.params.hash);

            if (url) {
                res.redirect(url);
                clickThrough(req.params.hash);
            } else {
                throw new Error('Bad hash.');
            }
        } catch (e) {
            errorHandler(e, res);
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
                errorHandler(e, res);
            }
        })();
    } else {
        const e = new Error('An invalid url was submitted!');
        errorHandler(e, res);
    }
});

const errorHandler = (e: Error, res: express.Response) => {
    console.error(e);

    res.render('error', {errorMessage: e.message, subtitle: 'Error'},
    (renderError, html) => {
        if (renderError) {
            res.status(500).send('Server error!');
        } else {
            res.status(400).send(html);
        }
    });
};

const hashToLink = (hash: string, host: string) => {
    return 'http://' + host + '/b/' + hash;
};

const genericRender = (res: express.Response, template: string, options: object = {}) => {
    res.render(template, options,
    (renderError, html) => {
        if (renderError) {
            errorHandler(renderError, res);
        } else {
            res.send(html);
        }
    });
};


const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`Listening to port ${port}.`); });