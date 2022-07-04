import { NextFunction, Response } from 'express';
import isLength from 'validator/lib/isLength';
import { CustomRequest } from '../../../environment';
import { createValidationResponse } from '../../../utils/helper';

class CuisineValidation {
    /**
     * @description add
     * @param req
     * @param res
     * @param next
     */

    public add(req: CustomRequest, res: Response, next: NextFunction) {
        let { name, description } = req.body;
        let errors: any = {};

        if (!name) {
            errors.name = res.__('CUISINE.VALIDATIONS.name.required');
        } else if (!isLength(name, { min: 1, max: 255 })) {
            errors.name = res.__('CUISINE.VALIDATIONS.name.valid');
        } else if (typeof name !== 'string') {
            errors.name = res.__('CUISINE.VALIDATIONS.name.type');
        }

        if (!description) {
            errors.description = res.__('CUISINE.VALIDATIONS.description.required');
        } else if (!isLength(description, { min: 1, max: 1000 })) {
            errors.description = res.__('CUISINE.VALIDATIONS.description.valid');
        } else if (typeof description !== 'string') {
            errors.description = res.__('CUISINE.VALIDATIONS.description.type');
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }

    /**
     * @description add
     * @param req
     * @param res
     * @param next
     */

    public async update(req: CustomRequest, res: Response, next: NextFunction) {
        let { name, description } = req.body;
        let errors: any = {};

        if (name) {
            if (!isLength(name, { min: 1, max: 255 })) {
                errors.name = res.__('CUISINE.VALIDATIONS.name.valid');
            } else if (typeof name !== 'string') {
                errors.name = res.__('CUISINE.VALIDATIONS.name.type');
            }
        }

        if (description) {
            if (!isLength(description, { min: 1, max: 1000 })) {
                errors.description = res.__('CUISINE.VALIDATIONS.description.valid');
            } else if (typeof description !== 'string') {
                errors.description = res.__('CUISINE.VALIDATIONS.description.type');
            }
        }

        if (Object.keys(errors).length > 0) {
            createValidationResponse(res, errors);
        } else {
            next();
        }
    }
}

export default new CuisineValidation();
