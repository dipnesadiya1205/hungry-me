import { Request, Response, Router } from 'express';
import { CustomRequest } from '../../../environment';
import authorization from '../../../middleware/authorization';
import { CuisineMaster } from '../../Cuisine/schema';
import { ItemMaster } from '../../Item/schema';
import { RestaurantModel } from '../../Restaurant/model';
import { RestaurantMenuModel } from '../../Restaurant_Menu/model';
import { RestaurantMenuMaster } from '../../Restaurant_Menu/schema';
import { RestaurantMenuItemModel } from '../../Restaurant_Menu_Item/model';
import { CustomerModel } from '../model';
import CustomerController from './CustomerController';
import Validations from './CustomerValidation';

const router: Router = Router();

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/list/:uuid', CustomerController.get_detail);
router.get('/verify', CustomerController.verify_token);

// * Logout

router.post('/logout', [authorization.is_authorized], CustomerController.logout_customer);

// * Sign up

router.get('/signup', (req: Request, res: Response) => {
    res.render('pages/customerRegister.ejs', {
        project: {},
    });
});
router.post('/signup', [Validations.add], CustomerController.add);

// * Login

router.get('/login', (req: Request, res: Response) => {
    res.render('pages/customerLogin.ejs', {
        project: {},
    });
});
router.post('/login', [Validations.login], CustomerController.login_customer);

// * Forgot Password

router.get('/forgot_password', (req: Request, res: Response) => {
    res.render('pages/customerForgotPassword.ejs', {
        project: {},
    });
});
router.post('/forgot_password', [Validations.forgot_password], CustomerController.forgot_password);

// * Verify OTP
router.get('/verify_otp', (req: Request, res: Response) => {
    res.render('pages/customerVerifyOtp.ejs', {
        project: {
            data: req.body.uuid,
        },
    });
});
router.post('/verify_otp', [Validations.verify_otp], CustomerController.verify_otp);

// * Resend OTP

router.post('/resend_otp', [Validations.resend_otp], CustomerController.resend_otp);

// * Reset password

router.get('/reset_password', (req: Request, res: Response) => {
    res.render('pages/customerResetPassword.ejs', {
        project: {
            data: req.body.uuid,
        },
    });
});
router.post('/reset_password', [Validations.reset_password], CustomerController.reset_password);

// * Update data

router.get('/update', authorization.is_authorized, async (req: CustomRequest, res: Response) => {
    let customerData = await CustomerModel.getOne(
        ['firstname', 'lastname', 'contact_no', 'email', 'address', 'state', 'city', 'pincode'],
        { uuid: req.custom.customer_uuid }
    );

    res.render('pages/customerProfile.ejs', {
        project: {
            data: {
                firstname: customerData.firstname,
                lastname: customerData.lastname,
                contact_no: customerData.contact_no,
                email: customerData.email,
                address: customerData.address,
                state: customerData.state,
                city: customerData.city,
                pincode: customerData.pincode,
            },
        },
    });
});
router.post(
    '/update',
    [authorization.is_authorized, Validations.update],
    CustomerController.update
);

// * Change Password

router.get('/change_password', [authorization.is_authorized], (req: Request, res: Response) => {
    res.render('pages/customerchangepassword.ejs', {
        project: {},
    });
});
router.post(
    '/change_password',
    [authorization.is_authorized, Validations.change_password],
    CustomerController.change_password
);

//  * Frontend APIs --------------

router.get('/home', [authorization.is_authorized], async (req: CustomRequest, res: Response) => {
    let customerPincode = await CustomerModel.getOne(['pincode'], {
        uuid: req.custom.customer_uuid,
    });

    let restaurantData = await RestaurantModel.getMany(
        ['restaurant_id', 'name', 'address', 'city', 'state', 'restaurant_image'],
        { pincode: customerPincode.pincode, active: 1 }
    );

    res.render('pages/customerDashboard.ejs', {
        project: {
            data: restaurantData,
        },
    });
});

// * Particular Restaurant Detail

router.get(
    '/restaurant/:id',
    [authorization.is_authorized],
    async (req: CustomRequest, res: Response) => {
        let { id } = req.params;

        let menuID = await RestaurantMenuModel.getOne(['menu_id'], { restaurant_id: id });

        if (menuID === null) {
            res.redirect('../home');
            return;
        }

        let itemData = await RestaurantMenuItemModel.getMany(
            ['price', 'item_type', 'item_image'],
            { menu_id: menuID.menu_id },
            [
                {
                    model: ItemMaster,
                    attributes: ['item_id', 'name', 'description'],
                },
                {
                    model: CuisineMaster,
                    attributes: ['name'],
                },
                {
                    model: RestaurantMenuMaster,
                    attributes: ['menu_id'],
                },
            ]
        );

        let restaurantData = await RestaurantModel.getOne(['name'], { restaurant_id: id });
        let data: any[] = [];

        for (let i = 0; i < itemData.length; i++) {
            data.push({
                price: itemData[i].price,
                item_id: itemData[i].ItemMaster.item_id,
                item_type: itemData[i].item_type,
                item_image: itemData[i].item_image,
                name: itemData[i].ItemMaster.name,
                description: itemData[i].ItemMaster.description,
                cuisine_name: itemData[i].CuisineMaster.name,
                created_at: itemData[i].ItemMaster.created_at,
            });
        }

        res.render('pages/customerItemList.ejs', {
            project: {
                data: data,
                restaurant_name: restaurantData.name,
            },
        });
    }
);

export default router;
