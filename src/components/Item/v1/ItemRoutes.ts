import { Router, Response } from 'express';
import authorization from '../../../middleware/authorization';
import { CustomRequest } from '../../../environment';
import { CuisineModel } from '../../Cuisine/model';
import RestaurantMenuItemMaster from '../../Restaurant_Menu_Item/schema/RestaurantMenuItemSchema';
import ItemController from './ItemController';
import { ItemModel } from '../model';
import { CuisineMaster } from '../../Cuisine/schema';
import { RestaurantMenuItemModel } from '../../Restaurant_Menu_Item/model';
import ItemValidation from './ItemValidation';

const router: Router = Router();

// * Add Item

router.get(
    '/item/add',
    [authorization.is_authorized],
    async (req: CustomRequest, res: Response) => {
        let cuisineList = await CuisineModel.getMany(['cuisine_id', 'name'], { status: 1 });
        let itemType = RestaurantMenuItemMaster.rawAttributes.item_type.values;

        res.render('pages/addItem.ejs', {
            project: {
                data: cuisineList,
                data1: itemType,
            },
        });
    }
);
router.post('/item/add', [authorization.is_authorized, ItemValidation.add], ItemController.add);

// * Get Item

router.get('/item/list', [authorization.is_authorized], ItemController.get);

// * Update Item

router.get(
    '/item/:id',
    [authorization.is_authorized],
    async (req: CustomRequest, res: Response) => {
        let item_id = req.params.id;

        let itemData = await ItemModel.getOne(
            ['item_id', 'name', 'description', 'cuisine_id'],
            { item_id },
            [{ model: CuisineMaster, attributes: ['name'] }]
        );
        let menuData = await RestaurantMenuItemModel.getOne(['price', 'item_type', 'item_image'], {
            item_id,
        });
        let cuisineList = await CuisineModel.getMany(['cuisine_id', 'name'], { status: 1 });
        let itemType = RestaurantMenuItemMaster.rawAttributes.item_type.values;

        res.render('pages/updateItem.ejs', {
            project: {
                data: {
                    item_id,
                    name: itemData.name,
                    description: itemData.description,
                    cuisine_id: itemData.cuisine_id,
                    cuisine_name: itemData.CuisineMaster.name,
                    price: menuData.price,
                    item_type: menuData.item_type,
                    item_image: menuData.item_image,
                },
                cuisine: cuisineList,
                itemType: itemType,
            },
        });
    }
);
router.post(
    '/item/update',
    [authorization.is_authorized, ItemValidation.update],
    ItemController.update
);

// * Delete Item

router.delete('/item/delete', [authorization.is_authorized], ItemController.delete);

export default router;
