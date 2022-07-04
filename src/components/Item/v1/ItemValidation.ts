import { NextFunction, Response } from 'express';
import isLength from 'validator/lib/isLength';
import { CustomRequest } from '../../../environment';
import { createValidationResponse } from '../../../utils/helper';

class ItemValidation {
    /**
     * @description add
     * @param req
     * @param res
     * @param next
     */

    public add(req: CustomRequest, res: Response, next: NextFunction) {
        let { name, description, price } = req.body;
        let errors: any = {};
        let files: any = req.files;

        if (!name) {
            errors.name = res.__('ITEM.VALIDATIONS.name.required');
        } else if (!isLength(name, { min: 1, max: 255 })) {
            errors.name = res.__('ITEM.VALIDATIONS.name.valid');
        } else if (typeof name !== 'string') {
            errors.name = res.__('ITEM.VALIDATIONS.name.type');
        }

        if (!description) {
            errors.description = res.__('ITEM.VALIDATIONS.description.required');
        } else if (!isLength(description, { min: 1, max: 1000 })) {
            errors.description = res.__('ITEM.VALIDATIONS.description.valid');
        } else if (typeof description !== 'string') {
            errors.description = res.__('ITEM.VALIDATIONS.description.type');
        }

        if (!price) {
            errors.price = res.__('ITEM.VALIDATIONS.price.required');
        } else if (!isLength(price, { min: 1, max: 10 }) || Number(price) <= 0) {
            errors.price = res.__('ITEM.VALIDATIONS.price.valid');
        } else if (!Number(price)) {
            if (Number(price) !== 0) {
                errors.price = res.__('ITEM.VALIDATIONS.price.type');
            }
        }

        if (files === null) {
            errors.item_image = res.__('Item Image is required');
        } else {
            if (files.item_image) {
                if (files.item_image.size / 1000000 > 5) {
                    errors.item_image = res.__('ITEM.VALIDATIONS.item_image.size');
                } else if (
                    files.item_image.mimetype !== 'image/jpeg' &&
                    files.item_image.mimetype !== 'image/png' &&
                    files.item_image.mimetype !== 'image/jpg'
                ) {
                    errors.item_image = res.__('ITEM.VALIDATIONS.item_image.type');
                }
            } else {
                errors.item_image = res.__('ITEM.VALIDATIONS.item_image.required');
            }
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }

    /**
     * @description update
     * @param req
     * @param res
     * @param next
     */

    public update(req: CustomRequest, res: Response, next: NextFunction) {
        let { name, description, price } = req.body;
        let errors: any = {};
        let files: any = req.files;

        if (name) {
            if (!isLength(name, { min: 1, max: 255 })) {
                errors.name = res.__('ITEM.VALIDATIONS.name.valid');
            } else if (typeof name !== 'string') {
                errors.name = res.__('ITEM.VALIDATIONS.name.type');
            }
        }

        if (description) {
            if (!isLength(description, { min: 1, max: 1000 })) {
                errors.description = res.__('ITEM.VALIDATIONS.description.valid');
            } else if (typeof description !== 'string') {
                errors.description = res.__('ITEM.VALIDATIONS.description.type');
            }
        }

        if (price) {
            if (!isLength(price, { min: 1, max: 10 }) || Number(price) <= 0) {
                errors.price = res.__('ITEM.VALIDATIONS.price.valid');
            } else if (!Number(price)) {
                if (Number(price) !== 0) {
                    errors.price = res.__('ITEM.VALIDATIONS.price.type');
                }
            }
        }

        if (files !== null) {
            if (files.item_image) {
                if (files.item_image.size / 1000000 > 5) {
                    errors.item_image = res.__('ITEM.VALIDATIONS.item_image.size');
                } else if (
                    files.item_image.mimetype !== 'image/jpeg' &&
                    files.item_image.mimetype !== 'image/png' &&
                    files.item_image.mimetype !== 'image/jpg'
                ) {
                    errors.item_image = res.__('ITEM.VALIDATIONS.item_image.type');
                }
            } else {
                errors.item_image = res.__('ITEM.VALIDATIONS.item_image.required');
            }
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }
}

export default new ItemValidation();
