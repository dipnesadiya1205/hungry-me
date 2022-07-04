import { Response } from 'express';
import { logger } from '../../../utils/logger';
import { createResponse } from '../../../utils/helper';
import STATUS_CODE from 'http-status-codes';
import sequelize from '../../../utils/dbConfig';
import { aws_config } from '../../../utils/aws/s3';
import path from 'path';
import { CustomRequest } from '../../../environment';
import { ItemModel } from '../model';
import { RestaurantMenuModel } from '../../Restaurant_Menu/model';
import { RestaurantMenuItemModel } from '../../Restaurant_Menu_Item/model';
import { CuisineModel } from '../../Cuisine/model';
import { RestaurantMenuItemMaster } from '../../Restaurant_Menu_Item/schema';
import { ItemMaster } from '../schema';
import { CuisineMaster } from '../../Cuisine/schema';

class ItemController {
    /**
     * @description Item add
     * @param req
     * @param res
     */

    public async add(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { name, description, cuisine_id, price, item_type, item_image } = req.body;
            let files: any = req.files;

            let uploadObjPromise: any;
            const S3 = aws_config();

            // * Upload item image

            let extentionName: string = path.extname(files.item_image.name);
            let filename: string = 'itemImage-' + Date.now() + extentionName;

            let params: any = {
                Bucket: process.env.BUCKET_NAME,
                Key: filename,
                Body: Buffer.from(files.item_image.data, 'binary'),
            };
            item_image = filename;
            uploadObjPromise = S3.putObject(params).promise();
            await uploadObjPromise;

            // * Start Transaction

            transaction = await sequelize.transaction();
            let item = await ItemModel.addOne(
                { name, description, cuisine_id, item_image },
                transaction
            );

            let restaurantMenuData = await RestaurantMenuModel.getOne(['menu_id'], {
                restaurant_id: req.custom.restaurant_id,
            });

            if (restaurantMenuData === null) {
                let restaurantMenu = await RestaurantMenuModel.addOne(
                    { restaurant_id: req.custom.restaurant_id },
                    transaction
                );

                await RestaurantMenuItemModel.addOne(
                    {
                        menu_id: restaurantMenu.menu_id,
                        item_id: item.item_id,
                        cuisine_id,
                        price,
                        item_image,
                        item_type,
                    },
                    transaction
                );
            } else {
                await RestaurantMenuItemModel.addOne(
                    {
                        menu_id: restaurantMenuData.menu_id,
                        item_id: item.item_id,
                        cuisine_id,
                        price,
                        item_image,
                        item_type,
                    },
                    transaction
                );
            }
            await transaction.commit();

            let cuisineList = await CuisineModel.getMany(['cuisine_id', 'name'], { status: 1 });
            let itemType = RestaurantMenuItemMaster.rawAttributes.item_type.values;

            res.render('pages/addItem.ejs', {
                project: {
                    messages: {
                        success: res.__('ITEM.ADDED_SUCCESS'),
                    },
                    data: cuisineList,
                    data1: itemType,
                },
            });
            // createResponse(res, STATUS_CODE.OK, 'Item added successfully');
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(__filename, 'addItem', req.custom.uuid, 'Error during item add : ', error);
            res.render('pages/addItem.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            });
            //createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Item Get
     * @param req
     * @param res
     */

    public async get(req: CustomRequest, res: Response) {
        try {
            let restaurant_id = req.custom.restaurant_id;

            let menuID = await RestaurantMenuModel.getOne(['menu_id'], { restaurant_id });

            if (menuID === null) {
                res.render('pages/restaurantItem.ejs', {
                    project: {
                        data: [],
                    },
                });
                return;
            }

            let menuList = await RestaurantMenuItemModel.getMany(
                ['price', 'item_type', 'item_image'],
                { menu_id: menuID.menu_id },
                [
                    {
                        model: ItemMaster,
                        attributes: ['item_id', 'name', 'description', 'created_at'],
                    },
                    {
                        model: CuisineMaster,
                        attributes: ['name'],
                    },
                ]
            );

            let data: any[] = [];

            for (let i = 0; i < menuList.length; i++) {
                data.push({
                    price: menuList[i].price,
                    item_id: menuList[i].ItemMaster.item_id,
                    item_type: menuList[i].item_type,
                    item_image: menuList[i].item_image,
                    name: menuList[i].ItemMaster.name,
                    description: menuList[i].ItemMaster.description,
                    cuisine_name: menuList[i].CuisineMaster.name,
                    created_at: menuList[i].ItemMaster.created_at,
                });
            }

            res.render('pages/restaurantItem.ejs', {
                project: {
                    data: data,
                },
            });
            return;
        } catch (error) {
            logger.error(
                __filename,
                'getItem',
                req.custom.uuid,
                'Error during item fetch : ',
                error
            );
            res.render('pages/restaurantItem.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            });
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Item Update
     * @param req
     * @param res
     */

    public async update(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { item_id } = req.body;

            let { name, description, cuisine_id, price, item_type, item_image } = req.body;

            let files: any = req.files;
            let updatedItem: any = {},
                updateMenu: any = {};

            if (name) {
                updatedItem.name = name;
            }

            if (description) {
                updatedItem.description = description;
            }

            if (cuisine_id) {
                updatedItem.cuisine_id = cuisine_id;
                updateMenu.cuisine_id = cuisine_id;
            }

            if (price) {
                updateMenu.price = price;
            }

            if (item_type) {
                updateMenu.item_type = item_type;
            }

            if (files !== null) {
                const S3 = aws_config();
                let params: any;
                if (files.item_image) {
                    let extentionName: string = path.extname(files.item_image.name);
                    let filename: string = 'itemImage-' + Date.now() + extentionName;

                    params = {
                        Bucket: process.env.BUCKET_NAME,
                        Key: filename,
                        Body: Buffer.from(files.item_image.data, 'binary'),
                    };
                    updateMenu.item_image = filename;
                    let uploadObjPromise = S3.putObject(params).promise();
                    await uploadObjPromise;
                }
            }

            transaction = await sequelize.transaction();
            if (Object.keys(updatedItem).length > 0) {
                await ItemModel.updateOne(updatedItem, { item_id });
            }
            if (Object.keys(updateMenu).length > 0) {
                await RestaurantMenuItemModel.updateOne(updateMenu, { item_id });
            }
            await transaction.commit();
            return res.redirect('./list');            
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'updateItem',
                req.custom.uuid,
                'Error during item update : ',
                error
            );
            res.render('pages/addItem.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            });
            //createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Item Delete
     * @param req
     * @param res
     */

    public async delete(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let {item_id} = req.body;
          
            transaction = await sequelize.transaction();
            await ItemModel.deleteOne({ item_id }, transaction);
            await RestaurantMenuItemModel.deleteOne({ item_id }, transaction);
            await transaction.commit();

            res.redirect('./list');
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'deleteItem',
                req.custom.uuid,
                'Error during item delete : ',
                error
            );
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }
}

export default new ItemController();
