import { CustomerOrderItemsMaster } from '../schema';
import { Includeable, Transaction } from 'sequelize';

class CustomerOrderItemsModel {
    /**
     * @description Add new details
     * @param obj
     * @param transaction
     */

    public async addOne(obj: any, transaction: Transaction | undefined = undefined) {
        try {
            return await CustomerOrderItemsMaster.create(obj, {
                transaction,
            });
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
            return await CustomerOrderItemsMaster.count({ where: condition });
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
            return await CustomerOrderItemsMaster.findAll({
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
            return await CustomerOrderItemsMaster.findOne({
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
     * @param values
     * @param condition
     * @param transaction
     */

    public async updateOne(
        values: any,
        condition: any = {},
        transaction: Transaction | undefined = undefined
    ) {
        try {
            return await CustomerOrderItemsMaster.update(values, {
                where: condition,
                transaction,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

export default new CustomerOrderItemsModel();
