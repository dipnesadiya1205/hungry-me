import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import moment from 'moment';

const { combine, printf } = format;

const date = `${new Date().getFullYear()}-${
    new Date().getMonth() + 1
}-${new Date().getDate()}`;

class Logging {
    public logger: any;

    public transport = new transports.DailyRotateFile({
        filename: `logs/${date}/%DATE%.log`,
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '16m',
        maxFiles: '7d',
    });

    public myFormat = printf(({ level, message }) => {
        return `${moment.utc().format()} ${level}: ${message}`;
    });

    constructor() {
        this.logger = createLogger({
            format: combine(format.timestamp(), format.json()),
            transports: [
                this.transport,
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        this.myFormat
                    ),
                }),
            ],
        });
    }

    public getLabel(filename: string) {
        const parts = filename.split('/');
        return parts[parts.length - 2] + '/' + parts.pop();
    }

    public setLabel(filename: string, method: string) {
        let label = this.getLabel(filename);
        label += method ? ` ~ ${method}` : '';
        return label;
    }

    // * public methods for external use
    public error(
        fileName: string,
        method: string,
        uuid: string,
        msg: string,
        data: any = {}
    ) {
        this.logger.error(
            `[${this.setLabel(fileName, method)}] ${uuid} - ${msg}`,
            data ? data : '',
            ''
        );
    }

    public warn(
        fileName: string,
        method: string,
        uuid: string,
        msg: string,
        data: any = {}
    ) {
        this.logger.warn(
            `[${this.setLabel(fileName, method)}] ${uuid} - ${msg}`,
            data ? data : '',
            ''
        );
    }

    public info(
        fileName: string,
        method: string,
        uuid: string,
        msg: string,
        data: any = {}
    ) {
        this.logger.info(
            `[${this.setLabel(fileName, method)}] ${uuid} - ${msg}`,
            data ? data : '',
            ''
        );
    }

    public verbose(
        fileName: string,
        method: string,
        uuid: string,
        msg: string,
        data: any = {}
    ) {
        this.logger.verbose(
            `[${this.setLabel(fileName, method)}] ${uuid} - ${msg}`,
            data ? data : '',
            ''
        );
    }

    public debug(
        fileName: string,
        method: string,
        uuid: string,
        msg: string,
        data: any = {}
    ) {
        this.logger.debug(
            `[${this.setLabel(fileName, method)}] ${uuid} - ${msg}`,
            data ? data : '',
            ''
        );
    }

    public silly(
        fileName: string,
        method: string,
        uuid: string,
        msg: string,
        data: any = {}
    ) {
        this.logger.silly(
            `[${this.setLabel(fileName, method)}] ${uuid} - ${msg}`,
            data ? data : '',
            ''
        );
    }
}

const logger = new Logging();
export default logger;
