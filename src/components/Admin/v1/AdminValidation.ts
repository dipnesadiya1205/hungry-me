import { NextFunction, Response } from 'express';
import { createValidationResponse } from '../../../utils/helper';
import { isEmail } from '../../../utils/validator';
import isLength from 'validator/lib/isLength';
import { CustomRequest } from '../../../environment';

class AdminValidation {
    /**
     * @description add validation
     * @param req
     * @param res
     * @param next
     */

    public add(req: CustomRequest, res: Response, next: NextFunction) {
        let { name, contact_no, email, username, password, address, pincode } = req.body;
        let errors: any = {};

        if (!name) {
            errors.name = res.__('ADMIN.VALIDATIONS.name.required');
        } else if (!isLength(name, { min: 1, max: 255 })) {
            errors.name = res.__('ADMIN.VALIDATIONS.name.valid');
        } else if (typeof name !== 'string') {
            errors.name = res.__('ADMIN.VALIDATIONS.name.type');
        }

        if (!contact_no) {
            errors.contact_no = res.__('ADMIN.VALIDATIONS.contact_no.required');
        } else if (!isLength(contact_no, { min: 10, max: 10 })) {
            errors.contact_no = res.__('ADMIN.VALIDATIONS.contact_no.valid');
        } else if (!Number(contact_no)) {
            errors.contact_no = res.__('ADMIN.VALIDATIONS.contact_no.type');
        }

        if (!email) {
            errors.email = res.__('ADMIN.VALIDATIONS.email.required');
        } else if (typeof email !== 'string') {
            errors.email = res.__('ADMIN.VALIDATIONS.email.type');
        } else if (!(isEmail(email) && isLength(email, { min: 1, max: 255 }))) {
            errors.email = res.__('ADMIN.VALIDATIONS.email.valid');
        }

        if (!username) {
            errors.username = res.__('ADMIN.VALIDATIONS.username.required');
        } else if (!isLength(username, { min: 1, max: 20 })) {
            errors.username = res.__('ADMIN.VALIDATIONS.username.valid');
        } else if (typeof username !== 'string') {
            errors.username = res.__('ADMIN.VALIDATIONS.username.type');
        }

        if (!password) {
            errors.password = res.__('ADMIN.VALIDATIONS.password.required');
        } else if (!isLength(password.trim(), { min: 8, max: 16 })) {
            errors.password = res.__('ADMIN.VALIDATIONS.password.valid');
        } else if (typeof password !== 'string') {
            errors.password = res.__('ADMIN.VALIDATIONS.password.type');
        }

        if (!address) {
            errors.address = res.__('ADMIN.VALIDATIONS.address.required');
        } else if (!isLength(address, { min: 1, max: 255 })) {
            errors.address = res.__('ADMIN.VALIDATIONS.address.valid');
        } else if (typeof address !== 'string') {
            errors.address = res.__('ADMIN.VALIDATIONS.address.type');
        }

        if (!pincode) {
            errors.pincode = res.__('ADMIN.VALIDATIONS.pincode.required');
        } else if (!Number(pincode)) {
            errors.pincode = res.__('ADMIN.VALIDATIONS.pincode.type');
        } else if (!isLength(pincode, { min: 6, max: 6 })) {
            errors.pincode = res.__('ADMIN.VALIDATIONS.pincode.valid');
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
        let { username, email, contact_no, password } = req.body;
        let errors: any = {};

        if (!(username || email || contact_no)) {
            errors.username = res.__('LOGIN.USERNAME_REQUIRED');
        } else {
            if (email) {
                if (!(isEmail(email) || isLength(email, { min: 1, max: 255 }))) {
                    errors.email = res.__('ADMIN.VALIDATIONS.email.valid');
                }
            } else if (username) {
                if (!isLength(username, { min: 1, max: 20 })) {
                    errors.username = res.__('ADMIN.VALIDATIONS.username.valid');
                }
            } else if (contact_no) {
                if (!isLength(contact_no, { min: 10, max: 10 })) {
                    errors.contact_no = res.__('ADMIN.VALIDATIONS.contact_no.valid');
                } else if (!Number(contact_no)) {
                    errors.contact_no = res.__('ADMIN.VALIDATIONS.contact_no.type');
                }
            }
        }

        if (!password) {
            errors.password = res.__('ADMIN.VALIDATIONS.password.required');
        } else {
            if (!isLength(password.trim(), { min: 8, max: 16 })) {
                errors.password = res.__('ADMIN.VALIDATIONS.password.valid');
            } else if (typeof password !== 'string') {
                errors.password = res.__('ADMIN.VALIDATIONS.password.type');
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

    public forgot_password(req: CustomRequest, res: Response, next: NextFunction) {
        let { email, username, contact_no } = req.body;
        let errors: any = {};

        if (!(email || username || contact_no)) {
            errors.username = res.__('LOGIN.ADMIN.USERNAME_REQUIRE');
        } else {
            if (email) {
                if (!(isEmail(email) && isLength(email, { min: 1, max: 255 }))) {
                    errors.email = res.__('ADMIN.VALIDATIONS.email.valid');
                }
            } else if (username) {
                if (!isLength(username, { min: 1, max: 20 })) {
                    errors.username = res.__('ADMIN.VALIDATIONS.username.valid');
                }
            } else if (contact_no) {
                if (!isLength(contact_no, { min: 10, max: 10 })) {
                    errors.contact_no = res.__('ADMIN.VALIDATIONS.contact_no.valid');
                } else if (!Number(contact_no)) {
                    errors.contact_no = res.__('ADMIN.VALIDATIONS.contact_no.type');
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
        console.log(req.body);
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

    public reset_password(req: CustomRequest, res: Response, next: NextFunction) {
        let { uuid, password } = req.body;
        let errors: any = {};

        if (!uuid) {
            errors.uuid = res.__('UUID_REQUIRE');
        }

        if (!password) {
            errors.password = res.__('ADMIN.VALIDATIONS.password.required');
        } else {
            if (!isLength(password.trim(), { min: 8, max: 16 })) {
                errors.password = res.__('ADMIN.VALIDATIONS.password.valid');
            } else if (typeof password !== 'string') {
                errors.password = res.__('ADMIN.VALIDATIONS.password.type');
            }
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
        let { name, contact_no, email, username, address, pincode } = req.body;
        let errors: any = {};

        if (name) {
            if (!isLength(name, { min: 1, max: 255 })) {
                errors.name = res.__('ADMIN.VALIDATIONS.name.valid');
            } else if (typeof name !== 'string') {
                errors.name = res.__('ADMIN.VALIDATIONS.name.type');
            }
        }

        if (contact_no) {
            if (!isLength(contact_no, { min: 10, max: 10 })) {
                errors.contact_no = res.__('ADMIN.VALIDATIONS.contact_no.valid');
            } else if (!Number(contact_no)) {
                errors.contact_no = res.__('ADMIN.VALIDATIONS.contact_no.type');
            }
        }

        if (email) {
            if (typeof email !== 'string') {
                errors.email = res.__('ADMIN.VALIDATIONS.email.type');
            } else if (!(isEmail(email) && isLength(email, { min: 1, max: 255 }))) {
                errors.email = res.__('ADMIN.VALIDATIONS.email.valid');
            }
        }

        if (username) {
            if (!isLength(username, { min: 1, max: 20 })) {
                errors.username = res.__('ADMIN.VALIDATIONS.username.valid');
            } else if (typeof username !== 'string') {
                errors.username = res.__('ADMIN.VALIDATIONS.username.type');
            }
        }

        if (address) {
            if (!isLength(address, { min: 1, max: 255 })) {
                errors.address = res.__('ADMIN.VALIDATIONS.address.valid');
            } else if (typeof address !== 'string') {
                errors.address = res.__('ADMIN.VALIDATIONS.address.type');
            }
        }

        if (pincode) {
            if (!Number(pincode)) {
                errors.pincode = res.__('ADMIN.VALIDATIONS.pincode.type');
            } else if (!isLength(pincode, { min: 6, max: 6 })) {
                errors.pincode = res.__('ADMIN.VALIDATIONS.pincode.valid');
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

    public change_password(req: CustomRequest, res: Response, next: NextFunction) {
        let { current_password, new_password } = req.body;
        let errors: any = {};

        if (current_password) {
            if (!isLength(current_password.trim(), { min: 8, max: 16 })) {
                errors.cur_password = res.__('ADMIN.VALIDATIONS.cur_password.valid');
            } else if (typeof current_password !== 'string') {
                errors.cur_password = res.__('ADMIN.VALIDATIONS.cur_password.type');
            }
        } else {
            errors.cur_password = res.__('ADMIN.VALIDATIONS.cur_password.required');
        }

        if (new_password) {
            if (!isLength(new_password.trim(), { min: 8, max: 16 })) {
                errors.new_password = res.__('ADMIN.VALIDATIONS.new_password.valid');
            } else if (typeof new_password !== 'string') {
                errors.new_password = res.__('ADMIN.VALIDATIONS.new_password.type');
            }
        } else {
            errors.new_password = res.__('ADMIN.VALIDATIONS.new_password.required');
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }
}

export default new AdminValidation();
