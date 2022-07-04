import { Response } from 'express';
import moment from 'moment';
import { CustomRequest } from '../../../environment';
import sequelize from '../../../utils/dbConfig';
import { logger } from '../../../utils/logger';
import { CustomerOrderItemsMaster } from '../../Customer_Order_Items/schema';
import { OrderModel } from '../model';

class OrderController {
    public async place_order(req: CustomRequest, res: Response) {
        let transaction: any;
        try {
            let itemData = req.session.cart;
            let restaurantKey = Object.keys(req.session.cart.items)[0];
            let restName = req.session.cart.items[restaurantKey].item.restaurant_name;
            let listOfItemKeys = Object.keys(req.session.cart.items);

            let orderDate = moment().utc();
            let shippingCharges: number = 40;
            let totalPay = Number(req.session.cart.totalPrice) + shippingCharges;

            transaction = await sequelize.transaction();
            let orderData = await OrderModel.addOne(
                {
                    customer_id: req.custom.customer_id,
                    order_date: orderDate,
                    shipping_charges: shippingCharges,
                    total_pay: totalPay,
                },
                transaction
            );
            let data: any[] = [];
            listOfItemKeys.forEach(async (el) => {
                data.push({
                    order_id: orderData.order_id,
                    item_id: itemData.items[el].item.item_id,
                    quantity: itemData.items[el].qty,
                    total_price:
                        Number(itemData.items[el].item.price) * Number(itemData.items[el].qty),
                });
            });
            await CustomerOrderItemsMaster.bulkCreate(data, { transaction });
            await transaction.commit();

            let session = req.session;
            delete session.cart;

            return res.redirect('./order');
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'placeorder',
                req.custom.uuid,
                'Error during place order : ',
                error
            );
            res.render('pages/customerCart.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            });
            /* createResponse(
                res,
                STATUS_CODE.INTERNAL_SERVER_ERROR,
                res.__('SERVER_ERROR_MESSAGE')
            ); */
        }
    }
}

export default new OrderController();
