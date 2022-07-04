import { CuisineMaster } from '../schema';
import { Includeable, Transaction } from 'sequelize';
class CuisineModel {
    /**
     * @description Add new cuisine details
     * @param cuisineObj
     * @param transaction
     */

    public async addOne(
        cuisineObj: any,
        transaction: Transaction | undefined = undefined,
        include: Includeable[] = []
    ) {
        try {
            return await CuisineMaster.create(cuisineObj, { include, transaction });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get Total cuisine
     * @param condition
     */

    public async getTotal(condition: any = {}) {
        try {
            return await CuisineMaster.count({ where: condition });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @description Get cuisine details
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
            return await CuisineMaster.findAll({
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
     * @description Get cuisine detail
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
            return await CuisineMaster.findOne({
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
     * @description Update cuisine detail
     * @param cuisineObj
     * @param condition
     * @param transaction
     */

    public async updateOne(
        cuisineObj: any,
        condition: any = {},
        transaction: Transaction | undefined = undefined
    ) {
        try {
            return await CuisineMaster.update(cuisineObj, {
                where: condition,
                transaction,
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

export default new CuisineModel();
