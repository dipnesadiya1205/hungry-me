import { Response } from 'express';
import { Op } from 'sequelize';
import { CouponCodeModel } from '../model';
import { logger } from '../../../utils/logger';
import { createResponse } from '../../../utils/helper';
import STATUS_CODE from 'http-status-codes';
import sequelize from '../../../utils/dbConfig';
import { CustomRequest } from '../../../environment';
import moment from 'moment';

class CouponCodeController {
    /**
     * @description Coupon Code add
     * @param req
     * @param res
     */

    public async add(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let {
                coupon_code,
                name,
                description,
                discount_percentage,
                no_of_coupons,
                min_pay_amt,
                max_discount_amt,
                available_date,
                expiry_date,
            } = req.body;

            let attributes = ['coupon_id', 'name', 'coupon_code'];
            let condition = {
                [Op.or]: [{ name }, { coupon_code }],
            };
            let isCouponExist = await CouponCodeModel.getOne(attributes, condition);

            if (isCouponExist !== null) {
                res.render('pages/addcoupon.ejs', {
                    project: {
                        messages: {
                            error: res.__('COUPON_CODE.COUPON_CODE_EXIST'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.OK,
                    res.__('COUPON_CODE.COUPON_CODE_EXIST')
                ); */
                return;
            }

            transaction = await sequelize.transaction();
            await CouponCodeModel.addOne(
                {
                    coupon_code,
                    name,
                    description,
                    discount_percentage,
                    no_of_coupons,
                    min_pay_amt,
                    max_discount_amt,
                    available_date: moment().utc().format(available_date),
                    expiry_date: moment().utc().format(expiry_date),
                    restaurant_id: req.custom.restaurant_id,
                },
                transaction
            );

            await transaction.commit();

            res.render('pages/addcoupon.ejs', {
                project: {
                    messages: {
                        success: res.__('COUPON_CODE.ADDED_SUCCESS'),
                    },
                },
            });

            /* createResponse(
                res,
                STATUS_CODE.OK,
                res.__('COUPON_CODE.ADDED_SUCCESS')
            ); */
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'addCoupon',
                req.custom.uuid,
                'Error during coupon add : ',
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
     * @description Get Coupon Detail
     * @param req
     * @param res
     */

    public async get_detail(req: CustomRequest, res: Response) {
        try {
            let { uuid } = req.params;

            let attributes = [
                'coupon_id',
                'uuid',
                'coupon_code',
                'name',
                'description',
                'discount_percentage',
                'no_of_coupons',
                'min_pay_amt',
                'max_discount_amt',
                'available_date',
                'expiry_date',
            ];
            let condition = {
                uuid,
                restaurant_id: req.custom.restaurant_id,
            };

            let couponData = await CouponCodeModel.getOne(attributes, condition);

            if (couponData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, res.__('COUPON_CODE.NOT_FOUND'));
                return;
            }

            createResponse(res, STATUS_CODE.OK, res.__('COUPON_CODE.DETAIL'), couponData);
        } catch (error) {
            logger.error(
                __filename,
                'getCoupon',
                req.custom.uuid,
                'Error during get coupon detail : ',
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
     * @description Get Coupon Details
     * @param req
     * @param res
     */

    public async get_details(req: CustomRequest, res: Response) {
        try {
            let attributes = [
                'coupon_id',
                'uuid',
                'coupon_code',
                'name',
                'description',
                'discount_percentage',
                'no_of_coupons',
                'min_pay_amt',
                'max_discount_amt',
                'available_date',
                'expiry_date',
            ];
            let condition = {
                restaurant_id: req.custom.restaurant_id,
            };

            let couponData = await CouponCodeModel.getMany(attributes, condition);

            if (couponData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, res.__('COUPON_CODE.NOT_FOUND'));
                return;
            }

            createResponse(res, STATUS_CODE.OK, res.__('COUPON_CODE.DETAIL'), couponData);
        } catch (error) {
            logger.error(
                __filename,
                'getCoupons',
                req.custom.uuid,
                'Error during get coupons details : ',
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
     * @description Update Coupon Detail
     * @param req
     * @param res
     */

    public async update(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let {
                coupon_code,
                name,
                description,
                discount_percentage,
                no_of_coupons,
                min_pay_amt,
                max_discount_amt,
                available_date,
                expiry_date,
            } = req.body;

            let condition = { coupon_code };

            let updatedValues: any = {};

            if (name) {
                updatedValues.name = name;
            }

            if (description) {
                updatedValues.description = description;
            }

            if (discount_percentage) {
                updatedValues.discount_percentage = discount_percentage;
            }

            if (no_of_coupons) {
                updatedValues.no_of_coupons = no_of_coupons;
            }

            if (min_pay_amt) {
                updatedValues.min_pay_amt = min_pay_amt;
            }

            if (max_discount_amt) {
                updatedValues.max_discount_amt = max_discount_amt;
            }

            if (available_date) {
                updatedValues.available_date = moment().utc().format(available_date);
            }

            if (expiry_date) {
                updatedValues.expiry_date = moment().utc().format(expiry_date);
            }

            transaction = await sequelize.transaction();
            await CouponCodeModel.updateOne(updatedValues, condition, transaction);
            await transaction.commit();

            res.render('pages/updatecoupon.ejs', {
                project: {
                    messages: {
                        success: res.__('COUPON_CODE.UPDATE_SUCCESS'),
                    },
                },
            });
            return;
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'updateCoupons',
                req.custom.uuid,
                'Error during update coupons detail : ',
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
     * @description Delete Coupon Detail
     * @param req
     * @param res
     */

    public async delete(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { uuid } = req.body;

            transaction = await sequelize.transaction();
            await CouponCodeModel.deleteOne({ uuid }, transaction);
            await transaction.commit();

            return res.redirect('./list');
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'deleteCoupons',
                req.custom.uuid,
                'Error during delete coupons detail : ',
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

export default new CouponCodeController();
