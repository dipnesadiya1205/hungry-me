import { CouponCodeMaster } from '../schema';
import { Includeable, Transaction } from 'sequelize';
class CouponCodeModel {
    /**
     * @description Add new Coupon details
     * @param couponObj
     * @param transaction
     */

    public async addOne(couponObj: any, transaction: Transaction | undefined = undefined) {
        try {
            return await CouponCodeMaster.create(couponObj, { transaction });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get Total coupon
     * @param condition
     */

    public async getTotal(condition: any = {}) {
        try {
            return await CouponCodeMaster.count({ where: condition });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get coupon details
     * @param attributes
     * @param condition
     * @param include
     * @param other
     */

    public async getMany(
        attributes: string[] = [],
        condition: any = {},
        include: Includeable[] = [],
        other: object = {}
    ) {
        try {
            return await CouponCodeMaster.findAll({
                where: condition,
                attributes: attributes.length > 0 ? attributes : undefined,
                include,
                ...other,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get coupon detail
     * @param attributes
     * @param condition
     * @param include
     * @param other
     */

    public async getOne(
        attributes: string[] = [],
        condition: any = {},
        include: Includeable[] = [],
        other: object = {}
    ) {
        try {
            return await CouponCodeMaster.findOne({
                where: condition,
                attributes: attributes.length > 0 ? attributes : undefined,
                include,
                ...other,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Update coupon detail
     * @param couponValues
     * @param condition
     * @param transaction
     */

    public async updateOne(
        couponObj: any,
        condition: any = {},
        transaction: Transaction | undefined = undefined
    ) {
        try {
            return await CouponCodeMaster.update(couponObj, {
                where: condition,
                transaction,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description delete coupon detail
     * @param condition
     */

    public async deleteOne(condition: any = {}, transaction: Transaction | undefined = undefined) {
        try {
            return await CouponCodeMaster.destroy({ where: condition ,transaction});
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

export default new CouponCodeModel();
