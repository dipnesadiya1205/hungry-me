import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import router from './routes/index';
import middleware from './middleware';
import { logger } from './utils/logger';
import path from 'path';
import ejs from 'ejs';
import expressLayouts from 'express-ejs-layouts';

const app: Application = express();

const BASE_PATH: string = __dirname;

app.locals.baseURL = 'http://localhost:8000';

app.use(express.static('./'));

app.use(express.static('./public'));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use(expressLayouts);
app.set('layout', 'layout.ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({       
        secret: 'secret$%^134',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 15 },
    })
);

middleware(app); // bind middlewares
router(app); // All main routes

app.get('/health', (req: Request, res: Response) => {
    res.render('pages/register.ejs', {
        locals: {
            list: {},
            messages: '',
            class: 'green',
        },
    });
});

app.all('/*', (req: Request, res: Response) => {
    logger.error(
        __filename,
        'Invalid Route Handler',
        'No UUID',
        'Invalid Route Fired : ' + req.path,
        {}
    );
    return res.status(400).json({
        status: 400,
        message: 'Bad Request',
    });
});

export default app;
