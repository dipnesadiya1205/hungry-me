import { RestaurantMenuItemMaster } from '../schema';
import { Includeable, Transaction } from 'sequelize';
class RestaurantMenuItemModel {
    /**
     * @description Add new details
     * @param obj
     * @param transaction
     */

    public async addOne(obj: any, transaction: Transaction | undefined = undefined) {
        try {
            return await RestaurantMenuItemMaster.create(obj, { transaction });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get Total
     * @param condition
     */

    public async getTotal(condition: any = {}) {
        try {
            return await RestaurantMenuItemMaster.count({ where: condition });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get details
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
            return await RestaurantMenuItemMaster.findAll({
                where: condition,
                attributes,
                include,
                ...other,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get detail
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
            return await RestaurantMenuItemMaster.findOne({
                where: condition,
                attributes,
                include,
                ...other,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Update detail
     * @param obj
     * @param condition
     * @param transaction
     */

    public async updateOne(
        obj: any,
        condition: any = {},
        transaction: Transaction | undefined = undefined
    ) {
        try {
            return await RestaurantMenuItemMaster.update(obj, {
                where: condition,
                transaction,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description delete detail
     * @param condition
     */

    public async deleteOne(condition: any = {}, transaction: Transaction | undefined = undefined) {
        try {
            return await RestaurantMenuItemMaster.destroy({ where: condition, transaction });
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

export default new RestaurantMenuItemModel();
