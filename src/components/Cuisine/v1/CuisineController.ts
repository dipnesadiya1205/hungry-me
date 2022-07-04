import { Response } from 'express';
import STATUS_CODE from 'http-status-codes';
import sequelize from '../../../utils/dbConfig';
import { CustomRequest } from '../../../environment';
import { createResponse } from '../../../utils/helper';
import { logger } from '../../../utils/logger';
import { CuisineModel } from '../model';

class CuisineController {
    /**
     * @description Cuisine add
     * @param req
     * @param res
     */

    public async add_by_admin(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { name, description } = req.body;

            name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

            let attributes = ['cuisine_id'];
            let condition = { name };

            let cuisineData = await CuisineModel.getOne(attributes, condition);

            if (cuisineData !== null) {
                res.render('pages/addcuisine.ejs', {
                    project: {
                        messages: {
                            error: res.__('CUISINE.CUISINE_EXIST'),
                        },
                    },
                });
                // createResponse(res, STATUS_CODE.OK, res.__('CUISINE.CUISINE_EXIST'));
                return;
            }

            // * Start Transaction

            transaction = await sequelize.transaction();
            await CuisineModel.addOne(
                {
                    name,
                    description,
                    status: 1,
                    added_by: 'admin',
                    added_by_user_id: req.custom.admin_id,
                },
                transaction
            );
            await transaction.commit();
            res.redirect('./list');
            // createResponse(res, STATUS_CODE.OK, res.__('CUISINE.ADDED_SUCCESS'));
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'addCuisineAdmin',
                req.custom.uuid,
                'Error during cuisine add by admin: ',
                error
            );
            /* res.render('pages/register.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            }); */
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Cuisine add by restaurant
     * @param req
     * @param res
     */

    public async add_by_restaurant(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { name, description } = req.body;

            name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

            let attributes = ['cuisine_id'];
            let condition = { name };

            let cuisineData = await CuisineModel.getOne(attributes, condition);

            if (cuisineData !== null) {
                res.render('pages/restaurantaddcuisine.ejs', {
                    project: {
                        messages: {
                            error: res.__('CUISINE.CUISINE_EXIST'),
                        },
                    },
                });
                // createResponse(res, STATUS_CODE.OK, res.__('CUISINE.CUISINE_EXIST'));
                return;
            }

            // * Start Transaction

            transaction = await sequelize.transaction();
            await CuisineModel.addOne(
                {
                    name,
                    description,
                    added_by: 'restaurant',
                    added_by_user_id: req.custom.restaurant_id,
                },
                transaction
            );
            await transaction.commit();

            res.render('pages/restaurantaddcuisine.ejs', {
                project: {
                    messages: {
                        success: 'Add cuisine request sends to Admin',
                    },
                },
            });
            // createResponse(res, STATUS_CODE.OK, 'Add cuisine request sends to Admin');
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'addCuisineRestaurant',
                req.custom.uuid,
                'Error during cuisine add by restaurant: ',
                error
            );
            /* res.render('pages/register.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            }); */
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Request approve
     * @param req
     * @param res
     */

    public async cuisine_request_approve(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { uuid } = req.body;

            let cuisineData = await CuisineModel.getOne(['status', 'added_by'], { uuid });

            if (cuisineData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, 'Cuisine Not Found');
                return;
            }

            if (cuisineData.status === 1) {
                createResponse(res, STATUS_CODE.NOT_ACCEPTABLE, 'Cuisine is already added in list');
                return;
            }

            transaction = await sequelize.transaction();
            await CuisineModel.updateOne({ status: 1 }, { uuid }, transaction);
            await transaction.commit();

            res.redirect('./list');
            //createResponse(res, STATUS_CODE.OK, 'Cuisine approved successfully');
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'cuisineApproved',
                req.custom.uuid,
                'Error during cuisine request approved : ',
                error
            );
            /* res.render('pages/register.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            }); */
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Request reject
     * @param req
     * @param res
     */

    public async cuisine_request_reject(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { uuid } = req.body;

            let cuisineData = await CuisineModel.getOne(['status', 'added_by'], {
                uuid,
            });

            if (cuisineData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, 'Cuisine Not Found');
                return;
            }

            transaction = await sequelize.transaction();
            await CuisineModel.updateOne({ status: 0 }, { uuid }, transaction);
            await transaction.commit();

            res.redirect('./list');
            //  createResponse(res, STATUS_CODE.OK, 'Cuisine request is rejected.');
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'cuisineApproved',
                req.custom.uuid,
                'Error during cuisine request approved : ',
                error
            );
            /* res.render('pages/register.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            }); */
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Update Cuisine
     * @param req
     * @param res
     */

    public async update(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { uuid, name, description } = req.body;

            name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

            let cuisineData = await CuisineModel.getOne(['uuid', 'name', 'description'], { uuid });

            if (cuisineData.name !== name) {
                cuisineData = await CuisineModel.getOne(['uuid'], { name });

                if (cuisineData !== null) {
                    res.render('pages/updatecuisine.ejs', {
                        project: {
                            messages: {
                                error: res.__('CUISINE.CUISINE_EXIST'),
                            },
                            data: {
                                uuid: cuisineData.uuid,
                                name,
                                description,
                            },
                        },
                    });
                }
                return;
            }

            transaction = await sequelize.transaction();
            await CuisineModel.updateOne({ name, description }, { uuid }, transaction);
            await transaction.commit();

            cuisineData = await CuisineModel.getOne(['name', 'description'], { uuid });

            res.render('pages/updatecuisine.ejs', {
                project: {
                    messages: {
                        success: res.__('CUISINE.UPDATE_SUCCESS'),
                    },
                    data: cuisineData,
                },
            });
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'cuisineApproved',
                req.custom.uuid,
                'Error during cuisine request approved : ',
                error
            );
            /* res.render('pages/register.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            }); */
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }    
}

export default new CuisineController();
