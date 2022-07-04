import { NextFunction, Response } from 'express';
import os from 'os';
import STATUS_CODE from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { AdminModel } from '../components/Admin/model';
import { CustomerModel } from '../components/Customer/model';
import { RestaurantModel } from '../components/Restaurant/model';
import { CustomRequest } from '../environment';
import { createResponse } from '../utils/helper';
import redis from '../utils/redis';

class Authorization {
    public async is_authorized(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            // let { authorization } = req.headers;
            let { authorization } = req.session;

            req.custom = {};

            let url = req.url.split('/');

            if (!authorization) {
                if (url.includes('coupon_code') || url.includes('item')) {
                    res.redirect('../login');
                } else if (url.includes('request-list')) {
                    res.redirect('../login');
                } else if (
                    url.includes('list') &&
                    (url.includes('restaurant') || url.includes('customer'))
                ) {
                    res.redirect('../login');
                } else if (url.includes('cuisine')) {
                    res.redirect('../login');
                } else if (Number(url[url.length-1])) {
                    res.redirect('.././login');
                } else {
                    res.redirect('./login');
                }

                /* createResponse(
                    res,
                    STATUS_CODE.UNPROCESSABLE_ENTITY,
                    'Authorization Token is required.'
                ); */
                return;
            }

            const redisConfig = await redis.redis_config();

            const JWT_SECRET_KEY: string = process.env.JWT_SECRET_KEY || '';

            let isJWTValid: any = jwt.verify(authorization, JWT_SECRET_KEY);           

            let attributes, condition, loginToken;
            if (isJWTValid.role === 1) {
                attributes = ['admin_id', 'uuid'];
                condition = {
                    uuid: isJWTValid.uuid,
                };

                let adminData = await AdminModel.getOne(attributes, condition);

                req.custom.admin_uuid = isJWTValid.uuid;
                req.custom.admin_id = adminData.admin_id;

                loginToken = await redisConfig.get(`admin/logintoken/uuid=${isJWTValid.uuid}`);
            }
            if (isJWTValid.role === 2) {
                attributes = ['customer_id', 'uuid'];
                condition = {
                    uuid: isJWTValid.uuid,
                };

                let customerData = await CustomerModel.getOne(attributes, condition);

                req.custom.customer_id = customerData.customer_id;
                req.custom.customer_uuid = isJWTValid.uuid;

                loginToken = await redisConfig.get(`customer/logintoken/uuid=${isJWTValid.uuid}`);
            }
            if (isJWTValid.role === 3) {
                attributes = ['restaurant_id', 'uuid'];
                condition = {
                    uuid: isJWTValid.uuid,
                };

                let restaurantData = await RestaurantModel.getOne(attributes, condition);

                req.custom.restaurant_id = restaurantData.restaurant_id;
                req.custom.restaurant_uuid = isJWTValid.uuid;

                loginToken = await redisConfig.get(`restaurant/logintoken/uuid=${isJWTValid.uuid}`);
            }

            if (loginToken === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, res.__('LOGIN.LOGIN_REQUIRE'));
                return;
            } else if (loginToken !== authorization) {
                createResponse(res, STATUS_CODE.UNAUTHORIZED, res.__('LOGIN.INVALID_TOKEN'));
                return;
            }

            next();
        } catch (error) {
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }
}

export default new Authorization();
