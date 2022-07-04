import { config } from 'dotenv';
import redis from './utils/redis';
import { logger } from './utils/logger';
import sequelize from './utils/dbConfig';
import { resolve } from 'path';
// import cluster from 'cluster';
// import os from 'os';

/*
 * Load Env
 */
config({ path: resolve(__dirname, '../.env') });

/*
 * Load App
 */
import app from './app';

const PORT: number = Number(process.env.PORT) || 8000;

/* 
const noOfCPUs = os.cpus().length;

if (cluster.isPrimary) {
    for (let i = 0; i < noOfCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });
} else {
    (async () => {
        try {
            await sequelize.authenticate();

            logger.info(__filename, '', '', `DB Connection has been established successfully`, ``);
            await redis.redis_config();
                        
            app.listen(PORT, () => {
                logger.info(__filename, '', '', ` is running on ${PORT}`, ``);
            });
        } catch (error: any) {
            logger.error(__filename, '', '', `Unable to connect to the server`, error);

            process.exit(1);
        }
    })();
} */

(async () => {
    try {
        await sequelize.authenticate();

        logger.info(__filename, '', '', `DB Connection has been established successfully`, ``);
        await redis.redis_config();

        app.listen(PORT, () => {
            logger.info(__filename, '', '', ` is running on ${PORT}`, ``);
        });
    } catch (error: any) {
        logger.error(__filename, '', '', `Unable to connect to the server`, error);

        process.exit(1);
    }
})();
