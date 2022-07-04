import { Request, Response, Router } from 'express';
import { CustomRequest } from '../../../environment';
import authorization from '../../../middleware/authorization';
import { CuisineModel } from '../../Cuisine/model';
import CuisineController from '../../Cuisine/v1/CuisineController';
import CuisineValidation from '../../Cuisine/v1/CuisineValidation';
import { CustomerModel } from '../../Customer/model';
import CustomerOrderItemsModel from '../../Customer_Order_Items/model/CustomerOrderItemsModel';
import { OrderModel } from '../../Order/model';
import { RestaurantMenuModel } from '../../Restaurant_Menu/model';
import { RestaurantMenuItemModel } from '../../Restaurant_Menu_Item/model';
import { RestaurantModel } from '../model';
import RestaurantController from './RestaurantController';
import Validations from './RestaurantValidation';

const router: Router = Router();

router.get('/list/:uuid', RestaurantController.get_detail);
router.get('/verify', RestaurantController.verify_token);

// * Logout

router.post('/logout', [authorization.is_authorized], RestaurantController.logout_restaurant);

// * Sign up

router.get('/signup', (req: Request, res: Response) => {
    res.render('pages/restaurantRegister.ejs', {
        project: {},
    });
});
router.post('/signup', [Validations.add], RestaurantController.add);

// * Login

router.get('/login', (req: Request, res: Response) => {    
    res.render('pages/restaurantLogin.ejs', {
        project: {},
    });
});
router.post('/login', [Validations.login], RestaurantController.login_restaurant);

// * Forgot Password

router.get('/forgot_password', (req: Request, res: Response) => {
    res.render('pages/restaurantForgotPassword.ejs', {
        project: {},
    });
});
router.post(
    '/forgot_password',
    [Validations.forgot_password],
    RestaurantController.forgot_password
);

// * Verify OTP

router.get('/verify_otp', (req: Request, res: Response) => {
    res.render('pages/restaurantVerifyOtp.ejs', {
        project: {
            data: req.body.uuid,
        },
    });
});
router.post('/verify_otp', [Validations.verify_otp], RestaurantController.verify_otp);

// * Resend OTP

router.post('/resend_otp', [Validations.resend_otp], RestaurantController.resend_otp);

// * Reset Password

router.get('/reset_password', (req: Request, res: Response) => {
    res.render('pages/restaurantResetPassword.ejs', {
        project: {
            data: req.body.uuid,
        },
    });
});
router.post('/reset_password', [Validations.reset_password], RestaurantController.reset_password);

// * Update

router.get('/update', [authorization.is_authorized], async (req: CustomRequest, res: Response) => {
    let restaurantData = await RestaurantModel.getOne(
        [
            'name',
            'restaurant_image',
            'restaurant_cover_image',
            'contact_no',
            'email',
            'address',
            'state',
            'city',
            'pincode',
        ],
        { uuid: req.custom.restaurant_uuid }
    );

    res.render('pages/restaurantProfile.ejs', {
        project: {
            data: {
                name: restaurantData.name,
                contact_no: restaurantData.contact_no,
                email: restaurantData.email,
                address: restaurantData.address,
                state: restaurantData.state,
                city: restaurantData.city,
                pincode: restaurantData.pincode,
                restaurant_image: restaurantData.restaurant_image,
                restaurant_cover_image: restaurantData.restaurant_cover_image,
            },
        },
    });
});
router.post(
    '/update',
    [authorization.is_authorized, Validations.update],
    RestaurantController.update
);

// * Change Password

router.get('/change_password', [authorization.is_authorized], (req: Request, res: Response) => {
    res.render('pages/restaurantchangepassword.ejs', {
        project: {},
    });
});
router.post(
    '/change_password',
    [authorization.is_authorized, Validations.change_password],
    RestaurantController.change_password
);

// * Get Cuisine List

router.get(
    '/cuisine/list',
    [authorization.is_authorized],
    async (req: CustomRequest, res: Response) => {
        let attributes = [
            'uuid',
            'name',
            'description',
            'status',
            'added_by',
            'added_by_user_id',
            'created_at',
        ];

        let cuisineData: any = await CuisineModel.getMany(attributes, {
            added_by_user_id: req.custom.restaurant_id,
            added_by: 'restaurant',
        });

        res.render('pages/restaurantcuisines.ejs', {
            project: {
                data: cuisineData,
            },
        });
    }
);

// * Add Cuisine by Restaurant

router.get('/cuisine/add', [authorization.is_authorized], (req: CustomRequest, res: Response) => {
    res.render('pages/restaurantaddcuisine.ejs', {
        project: {},
    });
});
router.post(
    '/cuisine/add',
    [authorization.is_authorized, CuisineValidation.add],
    CuisineController.add_by_restaurant
);

router.get(
    '/order/list',
    [authorization.is_authorized],
    async (req: CustomRequest, res: Response) => {
        let { menu_id } = await RestaurantMenuModel.getOne(['menu_id'], {
            restaurant_id: req.custom.restaurant_id,
        });

        let { item_id } = await RestaurantMenuItemModel.getOne(['item_id'], {
            menu_id,
        });

        let orderItemData = await CustomerOrderItemsModel.getOne(['order_id'], { item_id });

        let orderData = await OrderModel.getOne(
            ['order_id', 'uuid', 'status', 'customer_id', 'order_date', 'total_pay'],
            { order_id: orderItemData.order_id }
        );

        let customerData = await CustomerModel.getMany(['firstname', 'address'], {
            customer_id: orderData.customer_id,
        });

        console.log(orderData);
        console.log(customerData);
    }
);

//  * Frontend APIs --------------

router.get('/home', [authorization.is_authorized], (req: CustomRequest, res: Response) => {
    res.render('pages/restaurantDashboard.ejs', {});
});

export default router;
