import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { CustomRequest } from '../../environment';

export default (app: express.Application) => {
    app.use((req: CustomRequest, res: Response, next: NextFunction) => {
        if (req.custom && req.custom.uuid) {
            return next();
        }
        let uuidObj = {
            uuid: uuid(),
        };
        req.custom = uuidObj;
        next();
    });
};
