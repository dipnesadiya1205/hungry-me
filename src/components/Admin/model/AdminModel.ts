import { AdminMaster } from '../schema';
import { Includeable, Transaction } from 'sequelize';
class AdminModel {
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
            return await AdminMaster.create(adminObj, {
                transaction,
            });
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
            return await AdminMaster.count({ where: condition });
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
            return await AdminMaster.findAll({
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
            return await AdminMaster.findOne({
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
            return await AdminMaster.update(adminObj, {
                where: condition,
                transaction,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

export default new AdminModel();
