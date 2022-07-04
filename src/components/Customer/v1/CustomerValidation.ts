import { NextFunction, Response } from 'express';
import { createValidationResponse } from '../../../utils/helper';
import { isEmail } from '../../../utils/validator';
import isLength from 'validator/lib/isLength';
import { CustomRequest } from '../../../environment';

class CustomerValidation {
    /**
     * @description add validation
     * @param req
     * @param res
     * @param next
     */

    public add(req: CustomRequest, res: Response, next: NextFunction) {
        let {
            firstname,
            lastname,
            contact_no,
            email,
            password,
            address,
            state,
            city,
            pincode,
        } = req.body;
        let errors: any = {};

        if (!firstname) {
            errors.firstname = res.__(
                'CUSTOMER.VALIDATIONS.firstname.required'
            );
        } else if (!isLength(firstname, { min: 1, max: 255 })) {
            errors.firstname = res.__('CUSTOMER.VALIDATIONS.firstname.valid');
        } else if (typeof firstname !== 'string') {
            errors.firstname = res.__('CUSTOMER.VALIDATIONS.firstname.type');
        }

        if (!lastname) {
            errors.lastname = res.__('CUSTOMER.VALIDATIONS.lastname.required');
        } else if (!isLength(lastname, { min: 1, max: 255 })) {
            errors.lastname = res.__('CUSTOMER.VALIDATIONS.lastname.valid');
        } else if (typeof lastname !== 'string') {
            errors.lastname = res.__('CUSTOMER.VALIDATIONS.lastname.type');
        }

        if (!contact_no) {
            errors.contact_no = res.__(
                'CUSTOMER.VALIDATIONS.contact_no.required'
            );
        } else if (!isLength(contact_no, { min: 10, max: 10 })) {
            errors.contact_no = res.__('CUSTOMER.VALIDATIONS.contact_no.valid');
        } else if (!Number(contact_no)) {
            errors.contact_no = res.__('CUSTOMER.VALIDATIONS.contact_no.type');
        }

        if (!email) {
            errors.email = res.__('CUSTOMER.VALIDATIONS.email.required');
        } else if (typeof email !== 'string') {
            errors.email = res.__('CUSTOMER.VALIDATIONS.email.type');
        } else if (!(isEmail(email) && isLength(email, { min: 1, max: 255 }))) {
            errors.email = res.__('CUSTOMER.VALIDATIONS.email.valid');
        }

        if (!password) {
            errors.password = res.__('CUSTOMER.VALIDATIONS.password.required');
        } else if (!isLength(password.trim(), { min: 8, max: 16 })) {
            errors.password = res.__('CUSTOMER.VALIDATIONS.password.valid');
        } else if (typeof password !== 'string') {
            errors.password = res.__('CUSTOMER.VALIDATIONS.password.type');
        }

        if (!address) {
            errors.address = res.__('CUSTOMER.VALIDATIONS.address.required');
        } else if (!isLength(address, { min: 1, max: 255 })) {
            errors.address = res.__('CUSTOMER.VALIDATIONS.address.valid');
        } else if (typeof address !== 'string') {
            errors.address = res.__('CUSTOMER.VALIDATIONS.address.type');
        }

        if (!state) {
            errors.state = res.__('CUSTOMER.VALIDATIONS.state.required');
        } else if (!isLength(state, { min: 1, max: 20 })) {
            errors.state = res.__('CUSTOMER.VALIDATIONS.state.valid');
        } else if (typeof state !== 'string') {
            errors.state = res.__('CUSTOMER.VALIDATIONS.state.type');
        }

        if (!city) {
            errors.city = res.__('CUSTOMER.VALIDATIONS.city.required');
        } else if (!isLength(city, { min: 1, max: 20 })) {
            errors.city = res.__('CUSTOMER.VALIDATIONS.city.valid');
        } else if (typeof city !== 'string') {
            errors.city = res.__('CUSTOMER.VALIDATIONS.city.type');
        }

        if (!pincode) {
            errors.pincode = res.__('CUSTOMER.VALIDATIONS.pincode.required');
        } else if (!Number(pincode)) {
            errors.pincode = res.__('CUSTOMER.VALIDATIONS.pincode.type');
        } else if (!isLength(pincode, { min: 6, max: 6 })) {
            errors.pincode = res.__('CUSTOMER.VALIDATIONS.pincode.valid');
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }

    /**
     * @description login validation
     * @param req
     * @param res
     * @param next
     */

    public login(req: CustomRequest, res: Response, next: NextFunction) {
        let { email, contact_no, password } = req.body;
        let errors: any = {};

        if (!(email || contact_no)) {
            errors.username = res.__('CUSTOMER.LOGIN.USERNAME_REQUIRED');
        } else {
            if (email) {
                if (
                    !(isEmail(email) || isLength(email, { min: 1, max: 255 }))
                ) {
                    errors.email = res.__('CUSTOMER.VALIDATIONS.email.valid');
                }
            } else if (contact_no) {
                if (!isLength(contact_no, { min: 10, max: 10 })) {
                    errors.contact_no = res.__(
                        'CUSTOMER.VALIDATIONS.contact_no.valid'
                    );
                } else if (!Number(contact_no)) {
                    errors.contact_no = res.__(
                        'CUSTOMER.VALIDATIONS.contact_no.type'
                    );
                }
            }
        }

        if (!password) {
            errors.password = res.__('CUSTOMER.VALIDATIONS.password.required');
        } else {
            if (!isLength(password.trim(), { min: 8, max: 16 })) {
                errors.password = res.__('CUSTOMER.VALIDATIONS.password.valid');
            } else if (typeof password !== 'string') {
                errors.password = res.__('CUSTOMER.VALIDATIONS.password.type');
            }
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }

    /**
     * @description forgot password validation
     * @param req
     * @param res
     * @param next
     */

    public forgot_password(
        req: CustomRequest,
        res: Response,
        next: NextFunction
    ) {
        let { email, contact_no } = req.body;
        let errors: any = {};

        if (!(email || contact_no)) {
            errors.username = res.__(
                'LOGIN.RESTAURANT_CUSTOMER.USERNAME_REQUIRE'
            );
        } else {
            if (email) {
                if (
                    !(isEmail(email) && isLength(email, { min: 1, max: 255 }))
                ) {
                    errors.email = res.__('CUSTOMER.VALIDATIONS.email.valid');
                }
            } else if (contact_no) {
                if (!isLength(contact_no, { min: 10, max: 10 })) {
                    errors.contact_no = res.__(
                        'CUSTOMER.VALIDATIONS.contact_no.valid'
                    );
                } else if (!Number(contact_no)) {
                    errors.contact_no = res.__(
                        'CUSTOMER.VALIDATIONS.contact_no.type'
                    );
                }
            }
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }

    /**
     * @description verify otp validation
     * @param req
     * @param res
     * @param next
     */

    public verify_otp(req: CustomRequest, res: Response, next: NextFunction) {
        let { otp, uuid } = req.body;
        let errors: any = {};

        if (!otp) {
            errors.otp = res.__('OTP.OTP_REQUIRE');
        } else if (!Number(otp)) {
            errors.otp = res.__('OTP.OTP_TYPE');
        } else if (!isLength(otp, { min: 6, max: 6 })) {
            errors.otp = res.__('OTP.OTP_LENGTH');
        }

        if (!uuid) {
            errors.uuid = res.__('UUID_REQUIRE');
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }

    /**
     * @description resend otp validation
     * @param req
     * @param res
     * @param next
     */

    public resend_otp(req: CustomRequest, res: Response, next: NextFunction) {
        let { uuid } = req.body;
        let errors: any = {};

        if (!uuid) {
            errors.uuid = res.__('UUID_REQUIRE');
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }

    /**
     * @description reset password validation
     * @param req
     * @param res
     * @param next
     */

    public reset_password(
        req: CustomRequest,
        res: Response,
        next: NextFunction
    ) {
        let { uuid, password } = req.body;
        let errors: any = {};

        if (!uuid) {
            errors.uuid = res.__('UUID_REQUIRE');
        }

        if (!password) {
            errors.password = res.__('CUSTOMER.VALIDATIONS.password.required');
        } else {
            if (!isLength(password.trim(), { min: 8, max: 16 })) {
                errors.password = res.__('CUSTOMER.VALIDATIONS.password.valid');
            } else if (typeof password !== 'string') {
                errors.password = res.__('CUSTOMER.VALIDATIONS.password.type');
            }
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }

    /**
     * @description change password
     * @param req
     * @param res
     * @param next
     */

     public change_password(
        req: CustomRequest,
        res: Response,
        next: NextFunction
    ) {
        let { current_password, new_password } = req.body;
        let errors: any = {};

        if (current_password) {
            if (!isLength(current_password.trim(), { min: 8, max: 16 })) {
                errors.cur_password = res.__(
                    'CUSTOMER.VALIDATIONS.cur_password.valid'
                );
            } else if (typeof current_password !== 'string') {
                errors.cur_password = res.__('CUSTOMER.VALIDATIONS.cur_password.type');
            }
        } else {
            errors.cur_password = res.__('CUSTOMER.VALIDATIONS.cur_password.required');
        }

        if (new_password) {
            if (!isLength(new_password.trim(), { min: 8, max: 16 })) {
                errors.new_password = res.__(
                    'CUSTOMER.VALIDATIONS.new_password.valid'
                );
            } else if (typeof new_password !== 'string') {
                errors.new_password = res.__('CUSTOMER.VALIDATIONS.new_password.type');
            }
        } else {
            errors.new_password = res.__('CUSTOMER.VALIDATIONS.new_password.required');
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
            firstname,
            lastname,
            contact_no,
            email,
            address,
            state,
            city,
            pincode,
        } = req.body;
        let errors: any = {};

        if (firstname) {
            if (!isLength(firstname, { min: 1, max: 255 })) {
                errors.firstname = res.__(
                    'CUSTOMER.VALIDATIONS.firstname.valid'
                );
            } else if (typeof firstname !== 'string') {
                errors.firstname = res.__(
                    'CUSTOMER.VALIDATIONS.firstname.type'
                );
            }
        }

        if (lastname) {
            if (!isLength(lastname, { min: 1, max: 255 })) {
                errors.lastname = res.__('CUSTOMER.VALIDATIONS.lastname.valid');
            } else if (typeof lastname !== 'string') {
                errors.lastname = res.__('CUSTOMER.VALIDATIONS.lastname.type');
            }
        }

        if (email) {
            if (typeof email !== 'string') {
                errors.email = res.__('CUSTOMER.VALIDATIONS.email.type');
            } else if (
                !(isEmail(email) && isLength(email, { min: 1, max: 255 }))
            ) {
                errors.email = res.__('CUSTOMER.VALIDATIONS.email.valid');
            }
        }

        if (contact_no) {
            if (!isLength(contact_no, { min: 10, max: 10 })) {
                errors.contact_no = res.__(
                    'CUSTOMER.VALIDATIONS.contact_no.valid'
                );
            } else if (!Number(contact_no)) {
                errors.contact_no = res.__(
                    'CUSTOMER.VALIDATIONS.contact_no.type'
                );
            }
        }

        if (address) {
            if (!isLength(address, { min: 1, max: 255 })) {
                errors.address = res.__('CUSTOMER.VALIDATIONS.address.valid');
            } else if (typeof address !== 'string') {
                errors.address = res.__('CUSTOMER.VALIDATIONS.address.type');
            }
        }

        if (state) {
            if (!isLength(state, { min: 1, max: 20 })) {
                errors.state = res.__('CUSTOMER.VALIDATIONS.state.valid');
            } else if (typeof state !== 'string') {
                errors.state = res.__('CUSTOMER.VALIDATIONS.state.type');
            }
        }

        if (city) {
            if (!isLength(city, { min: 1, max: 20 })) {
                errors.city = res.__('CUSTOMER.VALIDATIONS.city.valid');
            } else if (typeof city !== 'string') {
                errors.city = res.__('CUSTOMER.VALIDATIONS.city.type');
            }
        }

        if (pincode) {
            if (!Number(pincode)) {
                errors.pincode = res.__('CUSTOMER.VALIDATIONS.pincode.type');
            } else if (!isLength(pincode, { min: 6, max: 6 })) {
                errors.pincode = res.__('CUSTOMER.VALIDATIONS.pincode.valid');
            }
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }
}

export default new CustomerValidation();
