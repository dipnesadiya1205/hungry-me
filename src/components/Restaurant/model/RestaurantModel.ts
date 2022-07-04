import { RestaurantMaster } from '../schema';
import { Includeable, Transaction } from 'sequelize';

class RestaurantModel {
    /**
     * @description Add new admin details
     * @param adminObj
     * @param transaction
     */

    public async addOne(
        adminObj: any,
        transaction: Transaction | undefined = undefined
    ) {
        try {
            return await RestaurantMaster.create(adminObj, { transaction });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get Total admin
     * @param condition
     */

    public async getTotal(condition: any = {}) {
        try {
            return await RestaurantMaster.count({ where: condition });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get admin details
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
            return await RestaurantMaster.findAll({
                where: condition,
                attributes: attributes.length>0 ? attributes : undefined,
                include,
                ...other,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get admin detail
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
            return await RestaurantMaster.findOne({
                where: condition,
                attributes: attributes.length>0 ? attributes : undefined,
                include,
                ...other,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Update admin detail
     * @param adminObj
     * @param condition
     * @param transaction
     */

    public async updateOne(
        adminObj: any,
        condition: any = {},
        transaction: Transaction | undefined = undefined
    ) {
        try {
            return await RestaurantMaster.update(adminObj, {
                where: condition,
                transaction,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

export default new RestaurantModel();
