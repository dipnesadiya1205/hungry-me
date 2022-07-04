import { ItemMaster } from '../schema';
import { Includeable, Transaction } from 'sequelize';
class ItemModel {
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
            return await ItemMaster.create(adminObj, { transaction });
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
            return await ItemMaster.count({ where: condition });
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
            return await ItemMaster.findAll({
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
            return await ItemMaster.findOne({
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
     * @description Update admin detail
     * @param adminValues
     * @param condition
     * @param transaction
     */

    public async updateOne(
        adminObj: any,
        condition: any = {},
        transaction: Transaction | undefined = undefined
    ) {
        try {
            return await ItemMaster.update(adminObj, {
                where: condition,
                transaction,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description delete item detail
     * @param condition
     */

     public async deleteOne(condition: any = {}, transaction: Transaction | undefined = undefined) {
        try {
            return await ItemMaster.destroy({ where: condition ,transaction});
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

export default new ItemModel();
