import { Response, NextFunction } from 'express';
import isLength from 'validator/lib/isLength';
import { CustomRequest } from '../../../environment';
import { createValidationResponse } from '../../../utils/helper';

class CouponCodeValidation {
    /**
     * @description add validation
     * @param req
     * @param res
     * @param next
     */

    public add(req: CustomRequest, res: Response, next: NextFunction) {
        let {
            coupon_code,
            name,
            description,
            discount_percentage,
            no_of_coupons,
            min_pay_amt,
            max_discount_amt,
            available_date,
            expiry_date,
        } = req.body;
        let errors: any = {};

        if (!coupon_code) {
            errors.coupon_code = res.__('COUPON_CODE.VALIDATIONS.coupon_code.required');
        } else if (!isLength(coupon_code, { min: 1, max: 255 })) {
            errors.coupon_code = res.__('COUPON_CODE.VALIDATIONS.coupon_code.valid');
        } else if (typeof coupon_code !== 'string') {
            errors.coupon_code = res.__('COUPON_CODE.VALIDATIONS.coupon_code.type');
        }

        if (!name) {
            errors.name = res.__('COUPON_CODE.VALIDATIONS.name.required');
        } else if (!isLength(name, { min: 1, max: 255 })) {
            errors.name = res.__('COUPON_CODE.VALIDATIONS.name.valid');
        } else if (typeof name !== 'string') {
            errors.name = res.__('COUPON_CODE.VALIDATIONS.name.type');
        }

        if (!description) {
            errors.description = res.__('COUPON_CODE.VALIDATIONS.description.required');
        } else if (!isLength(description, { min: 1, max: 1000 })) {
            errors.description = res.__('COUPON_CODE.VALIDATIONS.description.valid');
        } else if (typeof description !== 'string') {
            errors.description = res.__('COUPON_CODE.VALIDATIONS.description.type');
        }

        if (!discount_percentage) {
            errors.discount_percentage = res.__(
                'COUPON_CODE.VALIDATIONS.discount_percentage.required'
            );
        } else if (
            !isLength(discount_percentage, { min: 1, max: 5 }) ||
            (Number(discount_percentage) < 0 && Number(discount_percentage) > 100)
        ) {
            errors.discount_percentage = res.__(
                'COUPON_CODE.VALIDATIONS.discount_percentage.valid'
            );
        } else if (!Number(discount_percentage)) {
            if (Number(discount_percentage) !== 0) {
                errors.discount_percentage = res.__(
                    'COUPON_CODE.VALIDATIONS.discount_percentage.type'
                );
            }
        }

        if (!no_of_coupons) {
            errors.no_of_coupons = res.__('COUPON_CODE.VALIDATIONS.no_of_coupons.required');
        } else if (!isLength(no_of_coupons, { min: 1, max: 5 }) || Number(no_of_coupons) <= 0) {
            errors.no_of_coupons = res.__('COUPON_CODE.VALIDATIONS.no_of_coupons.valid');
        } else if (Number(no_of_coupons) % 1 !== 0) {
            errors.no_of_coupons = res.__('COUPON_CODE.VALIDATIONS.no_of_coupons.type');
        }

        if (!min_pay_amt) {
            errors.min_pay_amt = res.__('COUPON_CODE.VALIDATIONS.min_pay_amt.required');
        } else if (!isLength(min_pay_amt, { min: 1, max: 10 }) || Number(min_pay_amt) <= 0) {
            errors.min_pay_amt = res.__('COUPON_CODE.VALIDATIONS.min_pay_amt.valid');
        } else if (!Number(min_pay_amt)) {
            if (Number(min_pay_amt) !== 0) {
                errors.min_pay_amt = res.__('COUPON_CODE.VALIDATIONS.min_pay_amt.type');
            }
        }

        if (!max_discount_amt) {
            errors.max_discount_amt = res.__('COUPON_CODE.VALIDATIONS.max_discount_amt.required');
        } else if (
            !isLength(max_discount_amt, { min: 1, max: 10 }) ||
            Number(max_discount_amt) <= 0
        ) {
            errors.max_discount_amt = res.__('COUPON_CODE.VALIDATIONS.max_discount_amt.valid');
        } else if (!Number(max_discount_amt)) {
            if (Number(max_discount_amt) !== 0) {
                errors.max_discount_amt = res.__('COUPON_CODE.VALIDATIONS.max_discount_amt.type');
            }
        }

        if (!available_date) {
            errors.available_date = res.__('COUPON_CODE.VALIDATIONS.available_date.required');
        } else if (new Date(available_date).getTime() < Date.now()) {
            errors.available_date = res.__('COUPON_CODE.VALIDATIONS.available_date.valid');
        } else if (typeof new Date(available_date).getTime() !== 'number') {
            errors.available_date = res.__('COUPON_CODE.VALIDATIONS.available_date.type');
        }

        if (!expiry_date) {
            errors.expiry_date = res.__('COUPON_CODE.VALIDATIONS.expiry_date.required');
        } else if (new Date(expiry_date).getTime() < Date.now()) {
            errors.expiry_date = res.__('COUPON_CODE.VALIDATIONS.expiry_date.valid');
        } else if (new Date(expiry_date).getTime() < new Date(available_date).getTime()) {
            errors.expiry_date = res.__('COUPON_CODE.VALIDATIONS.expiry_date.compare');
        } else if (typeof new Date(expiry_date).getTime() !== 'number') {
            errors.expiry_date = res.__('COUPON_CODE.VALIDATIONS.expiry_date.type');
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }

    /**
     * @description update validation
     * @param req
     * @param res
     * @param next
     */

    public update(req: CustomRequest, res: Response, next: NextFunction) {
        let {
            coupon_code,
            name,
            description,
            discount_percentage,
            no_of_coupons,
            min_pay_amt,
            max_discount_amt,
            available_date,
            expiry_date,
        } = req.body;
        let errors: any = {};

        if (coupon_code) {
            if (!isLength(coupon_code, { min: 1, max: 255 })) {
                errors.coupon_code = res.__('COUPON_CODE.VALIDATIONS.coupon_code.valid');
            } else if (typeof coupon_code !== 'string') {
                errors.coupon_code = res.__('COUPON_CODE.VALIDATIONS.coupon_code.type');
            }
        }

        if (name) {
            if (!isLength(name, { min: 1, max: 255 })) {
                errors.name = res.__('COUPON_CODE.VALIDATIONS.name.valid');
            } else if (typeof name !== 'string') {
                errors.name = res.__('COUPON_CODE.VALIDATIONS.name.type');
            }
        }

        if (description) {
            if (!isLength(description, { min: 1, max: 1000 })) {
                errors.description = res.__('COUPON_CODE.VALIDATIONS.description.valid');
            } else if (typeof description !== 'string') {
                errors.description = res.__('COUPON_CODE.VALIDATIONS.description.type');
            }
        }

        if (discount_percentage) {
            if (
                !isLength(discount_percentage, { min: 1, max: 5 }) ||
                (Number(discount_percentage) < 0 && Number(discount_percentage) > 100)
            ) {
                errors.discount_percentage = res.__(
                    'COUPON_CODE.VALIDATIONS.discount_percentage.valid'
                );
            } else if (!Number(discount_percentage)) {
                if (Number(discount_percentage) !== 0) {
                    errors.discount_percentage = res.__(
                        'COUPON_CODE.VALIDATIONS.discount_percentage.type'
                    );
                }
            }
        }

        if (no_of_coupons) {
            if (!isLength(no_of_coupons, { min: 1, max: 5 }) || Number(no_of_coupons) <= 0) {
                errors.no_of_coupons = res.__('COUPON_CODE.VALIDATIONS.no_of_coupons.valid');
            } else if (Number(no_of_coupons) % 1 !== 0) {
                errors.no_of_coupons = res.__('COUPON_CODE.VALIDATIONS.no_of_coupons.type');
            }
        }

        if (min_pay_amt) {
            if (!isLength(min_pay_amt, { min: 1, max: 10 }) || Number(min_pay_amt) <= 0) {
                errors.min_pay_amt = res.__('COUPON_CODE.VALIDATIONS.min_pay_amt.valid');
            } else if (!Number(min_pay_amt)) {
                if (Number(min_pay_amt) !== 0) {
                    errors.min_pay_amt = res.__('COUPON_CODE.VALIDATIONS.min_pay_amt.type');
                }
            }
        }

        if (max_discount_amt) {
            if (!isLength(max_discount_amt, { min: 1, max: 10 }) || Number(max_discount_amt) <= 0) {
                errors.max_discount_amt = res.__('COUPON_CODE.VALIDATIONS.max_discount_amt.valid');
            } else if (!Number(max_discount_amt)) {
                if (Number(max_discount_amt) !== 0) {
                    errors.max_discount_amt = res.__(
                        'COUPON_CODE.VALIDATIONS.max_discount_amt.type'
                    );
                }
            }
        }

        if (available_date) {
            if (new Date(available_date).getTime() < Date.now()) {
                errors.available_date = res.__('COUPON_CODE.VALIDATIONS.available_date.valid');
            } else if (typeof new Date(available_date).getTime() !== 'number') {
                errors.available_date = res.__('COUPON_CODE.VALIDATIONS.available_date.type');
            }
        }

        if (expiry_date) {
            if (new Date(expiry_date).getTime() < Date.now()) {
                errors.expiry_date = res.__('COUPON_CODE.VALIDATIONS.expiry_date.valid');
            } else if (new Date(expiry_date).getTime() < new Date(available_date).getTime()) {
                errors.expiry_date = res.__('COUPON_CODE.VALIDATIONS.expiry_date.compare');
            } else if (typeof new Date(expiry_date).getTime() !== 'number') {
                errors.expiry_date = res.__('COUPON_CODE.VALIDATIONS.expiry_date.type');
            }
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }
}

export default new CouponCodeValidation();
