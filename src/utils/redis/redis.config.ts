import { createClient } from 'redis';
import logger from '../logger/logger';

/*
    * Redis Configuration
    ? Return redisClient
*/

class Redis {
    public async redis_config() {
        try {
            let redisClient = createClient();
            redisClient.on('error', (error) => {
                logger.error(__filename, '', '', `Redis Client Error`, error);
            });
            await redisClient.connect();
            return redisClient;
        } catch (error: any) {
            logger.error(__filename, '', '', `Unable to connect to the redis`, error);

            return error;
        }
    }
}
const redis = new Redis();
export default redis;
