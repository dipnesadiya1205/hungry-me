import express, { Application } from 'express';
import fileUpload from 'express-fileupload';
import i18n from './i18n';
import uuid from './uuid';
import methodOverride from 'method-override';

export default (app: Application) => {
    app.use(express.json());
    app.use(fileUpload());
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
        res.locals.session = req.session;
        next();
    });
    app.use(i18n.init); // support internationalization
    uuid(app); // add uuid in req if not available
    app.use(
        methodOverride(function (req, res) {
            if (req.body && typeof req.body === 'object' && '_method' in req.body) {
                // look in urlencoded POST bodies and delete it
                var method = req.body._method;
                delete req.body._method;
                return method;
            }
        })
    );
};
