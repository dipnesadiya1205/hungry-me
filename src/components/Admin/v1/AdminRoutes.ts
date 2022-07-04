import { Router, Request, Response } from 'express';
import { CustomRequest } from '../../../environment';
import authorization from '../../../middleware/authorization';
import { CuisineModel } from '../../Cuisine/model';
import { CuisineMaster } from '../../Cuisine/schema';
import CuisineController from '../../Cuisine/v1/CuisineController';
import CuisineValidation from '../../Cuisine/v1/CuisineValidation';
import { CustomerModel } from '../../Customer/model';
import { ItemMaster } from '../../Item/schema';
import { RestaurantModel } from '../../Restaurant/model';
import { RestaurantMenuModel } from '../../Restaurant_Menu/model';
import { RestaurantMenuMaster } from '../../Restaurant_Menu/schema';
import { RestaurantMenuItemModel } from '../../Restaurant_Menu_Item/model';
import { AdminModel } from '../model';
import AdminController from './AdminController';
import Validations from './AdminValidation';

const router: Router = Router();

router.get('/list/:uuid', AdminController.get_admin_detail);

// * Customer List

router.get(
    '/customer/list',
    authorization.is_authorized,
    async (req: CustomRequest, res: Response) => {
        let attributes = [
            'firstname',
            'lastname',
            'email',
            'contact_no',
            'address',
            'state',
            'city',
            'pincode',
            'is_email_verified',
            'created_at',
        ];

        let customerData = await CustomerModel.getMany(attributes);

        res.render('pages/customerList.ejs', {
            project: {
                data: customerData,
            },
        });
    }
);

// * Restaurant List

router.get(
    '/restaurant/list',
    authorization.is_authorized,
    async (req: CustomRequest, res: Response) => {
        let attributes = [
            'name',
            'email',
            'contact_no',
            'address',
            'state',
            'city',
            'pincode',
            'restaurant_image',
            'restaurant_cover_image',
            'is_email_verified',
            'active',
            'reject_reason',
            'rejected_date',
            'created_at',
        ];

        let restaurantData = await RestaurantModel.getMany(attributes);

        res.render('pages/restaurantList.ejs', {
            project: {
                data: restaurantData,
            },
        });
    }
);

// * Restaurant Request List

router.get(
    '/restaurant/request-list',
    authorization.is_authorized,
    async (req: CustomRequest, res: Response) => {
        let attributes = [
            'uuid',
            'name',
            'email',
            'contact_no',
            'address',
            'state',
            'city',
            'pincode',
            'restaurant_image',
            'restaurant_cover_image',
            'is_email_verified',
            'active',
            'created_at',
        ];
        let condition = {
            active: 0,
            reject_reason: null,
        };

        let restaurantData = await RestaurantModel.getMany(attributes, condition);

        res.render('pages/restaurantRequest.ejs', {
            project: {
                data: restaurantData,
            },
        });
    }
);
router.post(
    '/restaurant/request-list',
    authorization.is_authorized,
    AdminController.requested_restaurant
);

// * Login

router.get('/login', (req: Request, res: Response) => {
    res.render('pages/login.ejs', {
        project: {},
    });
});
router.post('/login', [Validations.login], AdminController.login_admin);

// * Logout
router.post('/logout', [authorization.is_authorized], AdminController.logout_admin);

// * Forgot password
router.get('/forgot_password', (req: Request, res: Response) => {
    res.render('pages/forgotPassword.ejs', { project: {} });
});
router.post('/forgot_password', [Validations.forgot_password], AdminController.forgot_password);

// * Verify OTP

router.get('/verify_otp', (req: Request, res: Response) => {
    res.render('pages/verifyOtp.ejs', {
        project: {
            data: {
                uuid: req.body.uuid,
            },
        },
    });
});
router.post('/verify_otp', [Validations.verify_otp], AdminController.verify_otp);

// * Resend OTP

router.post('/resend_otp', [Validations.resend_otp], AdminController.resend_otp);

// * Reset Password

router.get('/reset_password', (req: Request, res: Response) => {
    res.render('pages/resetPassword.ejs', {
        project: {
            data: {
                uuid: req.body.uuid,
            },
        },
    });
});
router.post('/reset_password', [Validations.reset_password], AdminController.reset_password);

// * Update
router.get('/update', authorization.is_authorized, async (req: CustomRequest, res: Response) => {
    let adminData = await AdminModel.getOne(
        ['name', 'contact_no', 'email', 'address', 'username', 'pincode'],
        { uuid: req.custom.admin_uuid }
    );

    res.render('pages/profile.ejs', {
        project: {
            data: {
                name: adminData.name,
                username: adminData.username,
                contact_no: adminData.contact_no,
                email: adminData.email,
                address: adminData.address,
                pincode: adminData.pincode,
            },
        },
    });
});
router.post('/update', [authorization.is_authorized, Validations.update], AdminController.update);

// * Change Password

router.get('/change_password', authorization.is_authorized, (req: Request, res: Response) => {
    res.render('pages/changepassword.ejs', { project: {} });
});
router.post(
    '/change_password',
    [authorization.is_authorized, Validations.change_password],
    AdminController.change_password
);

// * Add Cuisine by Admin

router.get('/cuisine/add', [authorization.is_authorized], (req: CustomRequest, res: Response) => {
    res.render('pages/addcuisine.ejs', {
        project: {},
    });
});
router.post(
    '/cuisine/add',
    [authorization.is_authorized, CuisineValidation.add],
    CuisineController.add_by_admin
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

        let cuisineData: any = await CuisineModel.getMany(attributes);

        for (const el of cuisineData) {
            if (el.added_by === 'admin') {
                let adminData = await AdminModel.getOne(['name'], {
                    admin_id: el.added_by_user_id,
                });
                el.added_by_user_id = adminData.name;
            } else if (el.added_by === 'restaurant') {
                let restaurantData = await RestaurantModel.getOne(['name'], {
                    restaurant_id: el.added_by_user_id,
                });
                el.added_by_user_id = restaurantData.name;
            }
        }

        res.render('pages/cuisines.ejs', {
            project: {
                data: cuisineData,
            },
        });
    }
);

// * Approve cuisine request

router.get(
    '/cuisine/approve',
    [authorization.is_authorized],
    (req: CustomRequest, res: Response) => {
        res.redirect('./list');
    }
);
router.post(
    '/cuisine/approve',
    [authorization.is_authorized],
    CuisineController.cuisine_request_approve
);

// * Reject cuisine request

router.get(
    '/cuisine/reject',
    [authorization.is_authorized],
    (req: CustomRequest, res: Response) => {
        res.redirect('./list');
    }
);
router.post(
    '/cuisine/reject',
    [authorization.is_authorized],
    CuisineController.cuisine_request_reject
);

// * Cuisine Update

router.get(
    '/cuisine/:uuid',
    [authorization.is_authorized],
    async (req: CustomRequest, res: Response) => {
        let { uuid } = req.params;
        let cuisineData = await CuisineModel.getOne(['uuid', 'name', 'description'], { uuid });

        res.render('pages/updatecuisine.ejs', {
            project: {
                data: cuisineData,
            },
        });
    }
);
router.post('/cuisine/update', [authorization.is_authorized], CuisineController.update);

// * Display Items

router.get(
    '/item/list',
    [authorization.is_authorized],
    async (req: CustomRequest, res: Response) => {
        let menuList = await RestaurantMenuItemModel.getMany(
            ['price', 'item_type', 'item_image'],
            {},
            [
                {
                    model: ItemMaster,
                    attributes: ['item_id', 'name', 'description', 'created_at'],
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

        let data: any[] = [];

        for (let i = 0; i < menuList.length; i++) {
            let resData = await RestaurantMenuModel.getOne(['restaurant_id'], {
                menu_id: menuList[i].RestaurantMenuMaster.menu_id,
            });

            let restaurantData = await RestaurantModel.getOne(['name'], {
                restaurant_id: resData.restaurant_id,
            });

            data.push({
                restaurant_name: restaurantData.name,
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

        res.render('pages/itemList.ejs', {
            project: {
                data: data,
            },
        });
    }
);

// * Front End Dashboard

router.get('/home', authorization.is_authorized, (req: Request, res: Response) => {
    res.render('pages/adminDashboard.ejs');
});
export default router;
