import { Router, Response } from 'express';
import Validations from './CouponCodeValidation';
import CouponCodeController from './CouponCodeController';
import authorization from '../../../middleware/authorization';
import { CustomRequest } from '../../../environment';
import { CouponCodeModel } from '../model';

const router: Router = Router();

router.get('/coupon_code/list/:uuid', authorization.is_authorized, CouponCodeController.get_detail);

router.get(
    '/coupon_code/list',
    authorization.is_authorized,
    async (req: CustomRequest, res: Response) => {
        let attributes = [
            'uuid',
            'coupon_code',
            'name',
            'description',
            'discount_percentage',
            'no_of_coupons',
            'min_pay_amt',
            'max_discount_amt',
            'available_date',
            'expiry_date',
            'created_at',
        ];
        let condition = {
            restaurant_id: req.custom.restaurant_id,
        };

        let couponData = await CouponCodeModel.getMany(attributes, condition);

        res.render('pages/couponcodes.ejs', {
            project: {
                data: couponData,
            },
        });
    }
);
/* router.get(
    '/coupon_code/list',
    authorization.is_authorized,
    CouponCodeController.get_details
); */

router.get('/coupon_code/add', authorization.is_authorized, (req: CustomRequest, res: Response) => {
    res.render('pages/addcoupon.ejs', {
        project: {},
    });
});
router.post(
    '/coupon_code/add',
    [authorization.is_authorized, Validations.add],
    CouponCodeController.add
);

router.get(
    '/coupon_code/:uuid',
    authorization.is_authorized,
    async (req: CustomRequest, res: Response) => {
        let { uuid } = req.params;
        let attributes = [
            'uuid',
            'coupon_code',
            'name',
            'description',
            'discount_percentage',
            'no_of_coupons',
            'min_pay_amt',
            'max_discount_amt',
            'available_date',
            'expiry_date',
        ];
        let condition = { uuid };

        let couponData = await CouponCodeModel.getOne(attributes, condition);

        res.render('pages/updatecoupon.ejs', {
            project: {
                data: {
                    coupon_code: couponData.coupon_code,
                    name: couponData.name,
                    description: couponData.description,
                    discount_percentage: couponData.discount_percentage,
                    no_of_coupons: couponData.no_of_coupons,
                    min_pay_amt: couponData.min_pay_amt,
                    max_discount_amt: couponData.max_discount_amt,
                    available_date: couponData.available_date,
                    expiry_date: couponData.expiry_date,
                },
            },
        });
    }
);
router.post(
    '/coupon_code/update',
    [authorization.is_authorized, Validations.update],
    CouponCodeController.update
);

router.delete(
    '/coupon_code/delete',
    [authorization.is_authorized],
    CouponCodeController.delete
);


export default router;
