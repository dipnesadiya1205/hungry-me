import { Response, Router } from 'express';
import { Op } from 'sequelize';
import { CustomRequest } from '../../../environment';
import authorization from '../../../middleware/authorization';
import { CouponCodeModel } from '../../Coupon_Code/model';
import { RestaurantModel } from '../../Restaurant/model';
import { OrderModel } from '../model';
import OrderController from './OrderController';

const router: Router = Router();

router.get('/cart', [authorization.is_authorized], async (req: CustomRequest, res: Response) => {
    if (req.session.cart) {
        let restaurantKey = Object.keys(req.session.cart.items)[0];
        let restName = req.session.cart.items[restaurantKey].item.restaurant_name;

        let { restaurant_id } = await RestaurantModel.getOne(['restaurant_id'], { name: restName });

        let couponData = await CouponCodeModel.getMany(
            ['coupon_code', 'description', 'name', 'available_date'],
            {
                restaurant_id,
                min_pay_amt: {
                    [Op.lte]: req.session.cart.totalPrice,
                },
            }
        );

        res.render('pages/customerCart.ejs', {
            project: {
                data: couponData,
            },
        });
    } else {
        res.render('pages/customerCart.ejs');
    }
});

router.post(
    '/apply-coupon',
    [authorization.is_authorized],
    async (req: CustomRequest, res: Response) => {
        return res.json(req.body[0].name);
        // return;
    }
);

router.post('/update-cart', [authorization.is_authorized], (req: CustomRequest, res: Response) => {
    if (!req.session.cart) {
        req.session.cart = {
            items: {},
            totalQty: 0,
            totalPrice: 0,
        };
    }
    let cart = req.session.cart;

    if (!cart.items[req.body.item_id]) {
        cart.items[req.body.item_id] = {
            item: req.body,
            qty: 1,
        };

        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
    } else {
        cart.items[req.body.item_id].qty = cart.items[req.body.item_id].qty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
        cart.totalQty = cart.totalQty + 1;
    }

    return res.json({ totalQty: req.session.cart.totalQty });
});

router.get('/order', [authorization.is_authorized], async (req: CustomRequest, res: Response) => {
    let orderData = await OrderModel.getMany(
        ['order_id', 'uuid', 'order_date', 'status', 'total_pay'],
        {
            customer_id: req.custom.customer_id,
        }
    );

    res.render('pages/customerOrder.ejs', {
        project: {
            data: orderData,
        },
    });
});

router.post('/place-order', [authorization.is_authorized], OrderController.place_order);

export default router;
