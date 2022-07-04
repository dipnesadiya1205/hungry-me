import STATUS_CODES from 'http-status-codes';
import { Response } from 'express';

/**
 * @description Create Response
 * @param {Object} res
 * @param {Number} status
 * @param {String} message
 * @param {Object} payload
 * @param {Object} pager
 */

export const createResponse = (
    res: Response,
    status: number,
    message: string,
    payload: object | null = {},
    pager: object | null = {}
) => {
    return res.status(status).json({
        status,
        message,
        payload,
        pager: typeof pager !== 'undefined' ? pager : {},
    });
};

/**
 * @description Send Validation Response
 * @param {Object} res
 * @param {errors} errors - Errors Object
 */

export const createValidationResponse = (res: Response, errors: any) => {
    return createResponse(
        res,
        STATUS_CODES.UNPROCESSABLE_ENTITY,
        errors[Object.keys(errors)[0]],
        { error: errors[Object.keys(errors)[0]] }
    );
};

/**
 * @description Generate OTP
 * @returns OTP in number
 */

export function generateOTP(): number {
    let str = '0123456789';

    let otp = '';

    for (let i = 0; i < 6; i++) {
        otp += str[Math.floor(Math.random() * 10)];
    }
    return Number(otp);
}
