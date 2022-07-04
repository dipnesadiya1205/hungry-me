import { Request } from 'express';

declare namespace Environment {
    interface CustomRequest extends Request {
        custom?: any;
        session?: any;        
    }
}

export = Environment;
