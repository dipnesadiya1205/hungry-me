import { Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { Op } from 'sequelize';
import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import 'dotenv';
import redis from '../../../utils/redis';
import { RestaurantModel } from '../model';
import { logger } from '../../../utils/logger';
import { createResponse, generateOTP } from '../../../utils/helper';
import STATUS_CODE from 'http-status-codes';
import sequelize from '../../../utils/dbConfig';
import { RestaurantMaster } from '../schema';
import { CustomRequest } from '../../../environment';
import { aws_config } from '../../../utils/aws/s3';
import path from 'path';

const SENDGRID_API: any = process.env.SENDGRID_API;
sgMail.setApiKey(SENDGRID_API);

class RestaurantController {
    /**
     * @description Restaurant Sign Up
     * @param req
     * @param res
     */

    public async add(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let {
                name,
                email,
                contact_no,
                password,
                address,
                state,
                city,
                pincode,
                restaurant_image,
                restaurant_cover_image,
            } = req.body;
            let files: any = req.files;

            let attributes: string[] = ['restaurant_id'];
            let condition = {
                [Op.or]: [{ email: email }, { contact_no: contact_no }],
            };

            let isExistRestaurant = await RestaurantModel.getOne(attributes, condition);

            if (isExistRestaurant !== null) {
                res.render('pages/restaurantLogin.ejs', {
                    project: {
                        messages: {
                            error: res.__('RESTAURANT.RESTAURANT_EXIST'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('RESTAURANT.RESTAURANT_EXIST')
                ); */
                return;
            }

            let uploadObjPromise: any;
            const S3 = aws_config();

            // * Upload restaurant image

            let extentionName: string = path.extname(files.restaurant_image.name);
            let filename: string = 'restaurantImage-' + Date.now() + extentionName;

            let params: any = {
                Bucket: process.env.BUCKET_NAME,
                Key: filename,
                Body: Buffer.from(files.restaurant_image.data, 'binary'),
            };
            restaurant_image = filename;
            uploadObjPromise = S3.putObject(params).promise();
            await uploadObjPromise;

            // * Upload restaurant cover image

            if (Object.keys(files).includes('restaurant_cover_image')) {
                extentionName = path.extname(files.restaurant_cover_image.name);
                filename = 'restaurantCoverImage-' + Date.now() + extentionName;
                params = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: filename,
                    Body: Buffer.from(files.restaurant_cover_image.data, 'binary'),
                };
                restaurant_cover_image = filename;
                uploadObjPromise = S3.putObject(params).promise();
                await uploadObjPromise;
            } else {
                restaurant_cover_image = null;
            }

            let salt: string = process.env.BCRYPT_SALT || '';
            let hashPassword: string = bcrypt.hashSync(password, salt);
            transaction = await sequelize.transaction();

            const restaurantData = await RestaurantModel.addOne(
                {
                    name,
                    contact_no,
                    email,
                    password: hashPassword,
                    address,
                    state,
                    city,
                    pincode,
                    restaurant_image,
                    restaurant_cover_image,
                },
                transaction
            );
            await transaction.commit();

            let verification_token: string = uuid();

            const msg = {
                to: email,
                from: process.env.FROM_EMAIL,
                subject: 'Email Verification',
                text: `Thank you for registering on our site.
                Your username is email and contact no and token number : ${verification_token}`,
                html: `<p>Click on the link to verify your account</p>
                <a href="http://${req.get(
                    'host'
                )}/restaurant/verify?token=${verification_token}&uuid=${
                    restaurantData.uuid
                }">Verify your account</a>`,
            };

            await sgMail.send(msg as any);

            const redisClient: any = await redis.redis_config();

            await redisClient.setEx(
                `restaurant/verifyEmail/${restaurantData.uuid}`,
                300,
                verification_token
            );

            /* res.render('pages/restaurantRegister.ejs', {
                project: {
                    messages: {
                        success: res.__('RESTAURANT.SIGNUP'),
                    },
                },
            }); */
            return res.redirect('./home');
            // createResponse(res, STATUS_CODE.OK, res.__('RESTAURANT.SIGNUP'));
        } catch (error: any) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'addRestaurant',
                req.custom.uuid,
                'Error during signup of restaurant : ',
                error
            );
            res.render('pages/restaurantRegister.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            });
            /* createResponse(
                res,
                STATUS_CODE.INTERNAL_SERVER_ERROR,
                res.__('SERVER_ERROR_MESSAGE')
            ); */
        }
    }

    /**
     * @description Verify restaurant email address
     * @param req
     * @param res
     */

    public async verify_token(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let getToken: any = req.query.token ? req.query.token : null;
            let uuid: any = req.query.uuid ? req.query.uuid : null;

            const redisClient: any = await redis.redis_config();
            let token = (await redisClient.get(`restaurant/verifyEmail/${uuid}`)) || null;

            if (token === null) {
                res.render('pages/restaurantRegister.ejs', {
                    project: {
                        messages: {
                            error: res.__('EMAIL.EMAIL_SESSION_TIMEOUT'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.REQUEST_TIMEOUT,
                    res.__('EMAIL.EMAIL_SESSION_TIMEOUT')
                ); */
                return;
            }

            if (token !== getToken) {
                createResponse(res, STATUS_CODE.OK, res.__('EMAIL.INVALID_TOKEN'));
                return;
            }
            await redisClient.del(`verifyEmail/${uuid}`);

            let condition: {
                uuid: string;
            } = {
                uuid: uuid,
            };

            transaction = await sequelize.transaction();
            await RestaurantModel.updateOne({ is_email_verified: 1 }, condition, transaction);
            await transaction.commit();

            /* res.render('pages/restaurantDashboard.ejs', {
                project: {
                    messages: {
                        error: res.__('EMAIL.EMAIL_VERIFIED'),
                    },
                },
            }); */
            res.render('pages/restaurantLogin.ejs', {
                project: {
                    success:
                        'Thank you. Your request has been sent. Wait for confirmation from Admin.',
                },
            });
            // createResponse(res, STATUS_CODE.OK, res.__('EMAIL.EMAIL_VERIFIED'));
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'verifyRestaurantEmail',
                req.custom.uuid,
                'Error during verify email of restaurant : ',
                error
            );
            res.render('pages/restaurantRegister.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            });
            /*   createResponse(
                res,
                STATUS_CODE.INTERNAL_SERVER_ERROR,
                res.__('SERVER_ERROR_MESSAGE')
            ); */
        }
    }

    /**
     * @description get restaurant Detail
     * @param req
     * @param res
     */

    public async get_detail(req: CustomRequest, res: Response) {
        try {
            let { uuid } = req.params;

            let attributes: string[] = [
                'restaurant_id',
                'name',
                'contact_no',
                'email',
                'address',
                'city',
                'state',
                'pincode',
                'restaurant_image',
                'restaurant_cover_image',
            ];
            let condition: any = {
                uuid,
            };
            let fetchedData = await RestaurantModel.getOne(attributes, condition);

            if (fetchedData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, res.__('RESTAURANT.NOT_FOUND'));
                return;
            }

            createResponse(
                res,
                STATUS_CODE.OK,
                res.__('RESTAURANT.DETAIL'),
                fetchedData as RestaurantMaster
            );
        } catch (error) {
            logger.error(
                __filename,
                'getRestaurantDetail',
                req.custom.uuid,
                'Error during fetching restaurant detail',
                error
            );
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Restaurant Login Detail
     * @param req
     * @param res
     */

    public async login_restaurant(req: CustomRequest, res: Response) {
        try {
            let { password, ...credential } = req.body;

            const redisObj = await redis.redis_config();
            const JWT_SECRET_KEY: any = process.env.JWT_SECRET_KEY;

            let attributes = [
                'restaurant_id',
                'uuid',
                'password',
                'is_email_verified',
                'reject_reason',
                'rejected_date',
                'active',
            ];
            let condition = {
                [Op.or]: [
                    { email: credential.email ? credential.email : null },
                    {
                        contact_no: credential.contact_no ? credential.contact_no : null,
                    },
                ],
            };

            let restaurantData: RestaurantMaster = await RestaurantModel.getOne(
                attributes,
                condition
            );

            if (restaurantData === null) {
                res.render('pages/restaurantLogin.ejs', {
                    project: {
                        messages: {
                            error: res.__('RESTAURANT.NOT_FOUND'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('RESTAURANT.NOT_FOUND')
                ); */
                return;
            }

            if (restaurantData.active === 0) {
                if (restaurantData.reject_reason !== null) {
                    res.render('pages/restaurantLogin.ejs', {
                        project: {
                            messages: {
                                error: `Your account is rejected by admin due to '${
                                    restaurantData.reject_reason
                                }' on ${restaurantData.rejected_date.toLocaleString()}`,
                            },
                        },
                    });
                    /* createResponse(
                        res,
                        STATUS_CODE.UNAUTHORIZED,
                        `Your account is rejected by admin due to '${restaurantData.reject_reason}' on ${(restaurantData.rejected_date).toLocaleString()}`
                    ); */
                    return;
                }
                res.render('pages/restaurantLogin.ejs', {
                    project: {
                        messages: {
                            error: 'Your account is not approved by admin',
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    'Your account is not approved by admin'
                ); */
                return;
            }

            if (restaurantData.is_email_verified === 0) {
                res.render('pages/restaurantLogin.ejs', {
                    project: {
                        messages: {
                            error: res.__('EMAIL.EMAIL_NOT_VERIFIED'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('EMAIL.EMAIL_NOT_VERIFIED')
                ); */
                return;
            }

            let alreadyLogin =
                (await redisObj.get(`restaurant/logintoken/uuid=${restaurantData.uuid}`)) || '';

            if (alreadyLogin) {
                res.render('pages/login.ejs', {
                    project: {
                        messages: {
                            error: 'You are already login in another browser',
                        },
                    },
                });
                return;
            }

            let is_login = await bcrypt.compare(password, restaurantData.password);

            if (!is_login) {
                res.render('pages/restaurantLogin.ejs', {
                    project: {
                        messages: {
                            error: res.__('LOGIN.INVALID_CREDENTIAL'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('LOGIN.INVALID_CREDENTIAL')
                ); */
                return;
            }

            const token: any = jwt.sign({ uuid: restaurantData.uuid, role: 3 }, JWT_SECRET_KEY);

            await redisObj.setEx(`restaurant/logintoken/uuid=${restaurantData.uuid}`, 7200, token);

            req.session.authorization = token;

            return res.redirect('./home');
            // createResponse(res, STATUS_CODE.OK, res.__('LOGIN.LOGIN_SUCCESS'));
        } catch (error) {
            logger.error(
                __filename,
                'loginRestaurant',
                req.custom.uuid,
                'Error during login of restaurant : ',
                error
            );
            res.render('pages/restaurantLogin.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            });
            /*  createResponse(
                res,
                STATUS_CODE.INTERNAL_SERVER_ERROR,
                res.__('SERVER_ERROR_MESSAGE')
            ); */
        }
    }

    /**
     * @description Restaurant Logout
     * @param req
     * @param res
     */

    public async logout_restaurant(req: CustomRequest, res: Response) {
        try {
            let uuid: string = req.custom.restaurant_uuid || '';

            const redisConfig = await redis.redis_config();

            if (uuid) {
                await redisConfig.del(`restaurant/logintoken/uuid=${uuid}`);
                if (req.session.authorization) {
                    req.session.destroy();
                }
                /* createResponse(
                    res,
                    STATUS_CODE.OK,
                    res.__('LOGIN.LOGOUT_SUCCESS')
                ); */
                return res.redirect('./login');
            }
        } catch (error) {
            logger.error(
                __filename,
                'logoutRestaurant',
                req.custom.uuid,
                'Error during logout of restaurant : ',
                error
            );
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Restaurant forgot password
     * @param req
     * @param res
     */

    public async forgot_password(req: CustomRequest, res: Response) {
        try {
            let { email, contact_no } = req.body;

            let attributes: string[] = [
                'is_email_verified',
                'email',
                'contact_no',
                'active',
                'reject_reason',
                'rejected_date',
                'uuid',
            ];
            let condition = {
                [Op.or]: [
                    { email: email ? email : null },
                    { contact_no: contact_no ? contact_no : null },
                ],
            };

            let restaurantData: any = await RestaurantModel.getOne(attributes, condition);

            if (restaurantData === null) {
                res.render('pages/restaurantForgotPassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('RESTAURANT.NOT_FOUND'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('RESTAURANT.NOT_FOUND')
                ); */
                return;
            }

            if (restaurantData.is_email_verified === 0) {
                res.render('pages/restaurantForgotPassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('EMAIL.EMAIL_NOT_VERIFIED'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.UNAUTHORIZED,
                    res.__('EMAIL.EMAIL_NOT_VERIFIED')
                ); */
                return;
            }

            if (restaurantData.active === 0) {
                if (restaurantData.reject_reason !== null) {
                    /* createResponse(
                        res,
                        STATUS_CODE.UNAUTHORIZED,
                        `Your account is rejected by admin due to '${restaurantData.reject_reason}' on ${(restaurantData.rejected_date).toLocaleString()}`
                    ); */
                    res.render('pages/restaurantLogin.ejs', {
                        project: {
                            messages: {
                                error: `Your account is rejected by admin due to '${
                                    restaurantData.reject_reason
                                }' on ${restaurantData.rejected_date.toLocaleString()}`,
                            },
                        },
                    });
                    return;
                }
                res.render('pages/restaurantLogin.ejs', {
                    project: {
                        messages: {
                            error: 'Your account is not approved by admin',
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    'Your account is not approved by admin'
                ); */
                return;
            }

            let generatedOtp: number = generateOTP();

            const msg = {
                to: restaurantData.email,
                from: process.env.FROM_EMAIL,
                subject: `One Time Password - ${generatedOtp}`,
                text: `Your registered email address is ${restaurantData.email}`,
                html: `<p>Dear Sir/Madam,</p>
                       <p>Your One Time Password (OTP) is ${generatedOtp} to reset your Password.</p>`,
            };

            const redisClient: any = await redis.redis_config();

            await sgMail.send(msg as any);

            await redisClient.setEx(
                `restaurant/otp/uuid=${restaurantData.uuid}`,
                120,
                generatedOtp
            );

            res.render('pages/restaurantVerifyOtp.ejs', {
                project: {
                    messages: {
                        success: res.__('OTP.OTP_GENERATED'),
                    },
                    data: {
                        uuid: restaurantData.uuid,
                    },
                },
            });
            // createResponse(res, STATUS_CODE.OK, res.__('OTP.OTP_GENERATED'));
        } catch (error: any) {
            logger.error(
                __filename,
                'forgotpasswordRestaurant',
                req.custom.uuid,
                'Error during forgot password of restaurant : ',
                error
            );
            res.render('pages/restaurantForgotPassword.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                },
            });
            /*  createResponse(
                res,
                STATUS_CODE.INTERNAL_SERVER_ERROR,
                res.__('SERVER_ERROR_MESSAGE')
            ); */
        }
    }

    /**
     * @description verify otp of forgot password
     * @param req,
     * @param res
     */

    public async verify_otp(req: CustomRequest, res: Response) {
        let { otp, uuid } = req.body;
        try {
            const redisClient: any = await redis.redis_config();

            let getOTP: any = await redisClient.get(`restaurant/otp/uuid=${uuid}`);

            if (getOTP === null) {
                res.render('pages/restaurantVerifyOtp.ejs', {
                    project: {
                        messages: {
                            error: res.__('OTP.OTP_EXPIRED'),
                        },
                        data: {
                            uuid: uuid,
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('OTP.OTP_EXPIRED')
                ); */
                return;
            }

            if (Number(getOTP) !== Number(otp)) {
                res.render('pages/restaurantVerifyOtp.ejs', {
                    project: {
                        messages: {
                            error: res.__('OTP.OTP_EXPIRED'),
                        },
                        data: {
                            uuid: uuid,
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_ACCEPTABLE,
                    res.__('OTP.OTP_INVALID')
                ); */
                return;
            }

            await redisClient.del(`restaurant/otp/uuid=${uuid}`);

            res.render('pages/restaurantResetPassword.ejs', {
                project: {
                    messages: {
                        success: res.__('OTP.OTP_VERIFIED'),
                    },
                    data: {
                        uuid: uuid,
                    },
                },
            });
            // createResponse(res, STATUS_CODE.OK, res.__('OTP.OTP_VERIFIED'));
        } catch (error: any) {
            logger.error(
                __filename,
                'verifyOtpRestaurant',
                req.custom.uuid,
                'Error during verify of restaurant : ',
                error
            );
            res.render('pages/restaurantVerifyOtp.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                    data: {
                        uuid: uuid,
                    },
                },
            });
            /* createResponse(
                res,
                STATUS_CODE.INTERNAL_SERVER_ERROR,
                res.__('SERVER_ERROR_MESSAGE')
            ); */
        }
    }

    /**
     * @description resend otp of forgot password
     * @param req,
     * @param res
     */

    public async resend_otp(req: CustomRequest, res: Response) {
        try {
            let { uuid } = req.body;

            let attributes: string[] = ['email'];
            let condition: {
                uuid: string;
            } = {
                uuid: uuid,
            };

            let restaurantData: any = await RestaurantModel.getOne(attributes, condition);

            if (restaurantData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, res.__('RESTAURANT.NOT_FOUND'));
                return;
            }

            let generatedOtp: number = generateOTP();

            const msg = {
                to: restaurantData.email,
                from: process.env.FROM_EMAIL,
                subject: `Resend One Time Password - ${generatedOtp}`,
                html: `<p>Dear Sir/Madam,</p>
                       <p>Your Resend One Time Password (OTP) is ${generatedOtp} to reset your Password.</p>`,
            };

            await sgMail.send(msg as any);

            const redisClient: any = await redis.redis_config();

            await redisClient.setEx(`restaurant/otp/uuid=${uuid}`, 120, generatedOtp);

            createResponse(res, STATUS_CODE.OK, res.__('OTP.OTP_GENERATED'));
        } catch (error: any) {
            logger.error(
                __filename,
                'resendOtpRestaurant',
                req.custom.uuid,
                'Error during resend otp of restaurant : ',
                error
            );
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description reset password
     * @param req,
     * @param res
     */

    public async reset_password(req: CustomRequest, res: Response) {
        let transaction;
        let { uuid, password } = req.body;
        try {
            let attributes: string[] = ['restaurant_id', 'password'];
            let condition = { uuid };
            console.log(uuid);
            let restaurantData = await RestaurantModel.getOne(attributes, condition);

            if (restaurantData === null) {
                res.render('pages/restaurantResetPassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('RESTAURANT.NOT_FOUND'),
                        },
                        data: {
                            uuid: uuid,
                        },
                    },
                });
                /*  createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('RESTAURANT.NOT_FOUND')
                ); */
                return;
            }

            let isPasswordSame: any = await bcrypt.compare(password, restaurantData.password);

            if (isPasswordSame) {
                res.render('pages/restaurantResetPassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('PASSWORD_SAME'),
                        },
                        data: {
                            uuid: uuid,
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_ACCEPTABLE,
                    res.__('PASSWORD_SAME')
                ); */
                return;
            }

            let newPassword: string | undefined = bcrypt.hashSync(
                password,
                process.env.BCRYPT_SALT as string
            );
            transaction = await sequelize.transaction();
            await RestaurantModel.updateOne({ password: newPassword }, condition, transaction);
            transaction.commit();

            res.render('pages/restaurantLogin.ejs', {
                project: {
                    messages: {
                        success: res.__('PASSWORD_RESET_SUCCESS'),
                    },
                },
            });
            /*  createResponse(
                res,
                STATUS_CODE.OK,
                res.__('PASSWORD_RESET_SUCCESS')
            ); */
        } catch (error: any) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'resetPasswordRestaurant',
                req.custom.uuid,
                'Error during reset password of restaurant : ',
                error
            );
            res.render('pages/restaurantResetPassword.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                    data: {
                        uuid: uuid,
                    },
                },
            });
            /*  createResponse(
                res,
                STATUS_CODE.INTERNAL_SERVER_ERROR,
                res.__('SERVER_ERROR_MESSAGE')
            ); */
        }
    }

    /**
     * @description Change password
     * @param req,
     * @param res
     */

    public async change_password(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let uuid = req.custom.restaurant_uuid ? req.custom.restaurant_uuid : null;

            if (uuid === null) {
                res.redirect(STATUS_CODE.UNPROCESSABLE_ENTITY, 'localhost:8000/restaurant/login');
                /*  createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('LOGIN.LOGIN_REQUIRE')
                ); */
                return;
            }

            let { current_password, new_password } = req.body;

            let attributes = ['restaurant_id', 'password'];
            let condition = { uuid };

            let restaurantData = await RestaurantModel.getOne(attributes, condition);

            if (restaurantData === null) {
                res.render('pages/restaurantRegister.ejs', {
                    project: {
                        messages: {
                            error: res.__('RESTAURANT.NOT_FOUND'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('RESTAURANT.NOT_FOUND')
                ); */
                return;
            }

            let salt: string = process.env.BCRYPT_SALT || '';

            let currentHashPassword: string = bcrypt.hashSync(current_password, salt);

            if (currentHashPassword !== restaurantData.password) {
                res.render('pages/restaurantchangepassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('PASSWORD_NOT_MATCH'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.UNAUTHORIZED,
                    res.__('PASSWORD_NOT_MATCH')
                ); */
                return;
            }

            let newHashPassword: string = bcrypt.hashSync(new_password, salt);

            if (newHashPassword === currentHashPassword) {
                res.render('pages/restaurantchangepassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('PASSWORD_SAME'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.UNAUTHORIZED,
                    res.__('PASSWORD_SAME')
                ); */
                return;
            }

            transaction = await sequelize.transaction();
            await RestaurantModel.updateOne({ password: newHashPassword }, { uuid }, transaction);
            await transaction.commit();

            return res.redirect('./home');
            // createResponse(res, STATUS_CODE.OK, res.__('PASSWORD_UPDATE'));
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'changePasswordRestaurant',
                req.custom.uuid,
                'Error during change password of restaurant : ',
                error
            );
            /* res.render('pages/resetPassword.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                    data: {
                        uuid: uuid,
                    },
                },
            }); */
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description update restaurant
     * @param req,
     * @param res
     */

    public async update(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { name, contact_no, email, address, state, city, pincode } = req.body;
            let files: any = req.files;

            let uuid = req.custom.restaurant_uuid ? req.custom.restaurant_uuid : null;

            if (uuid === null) {
                res.render('pages/restaurantLogin.ejs', {
                    project: {
                        messages: {
                            errors: res.__('LOGIN.LOGIN_REQUIRE'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('LOGIN.LOGIN_REQUIRE')
                ); */
                return;
            }

            let attributes: string[] = [
                'restaurant_id',
                'name',
                'address',
                'email',
                'contact_no',
                'state',
                'city',
                'restaurant_image',
                'restaurant_cover_image',
                'pincode',
            ];
            let condition: any = { uuid };

            let restaurantData = await RestaurantModel.getOne(attributes, condition);

            if (restaurantData === null) {
                res.render('pages/restaurantProfile.ejs', {
                    project: {
                        messages: {
                            errors: res.__('RESTAURANT.NOT_FOUND'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('RESTAURANT.NOT_FOUND')
                ); */
                return;
            }

            let updatedValues: any = {};
            const S3 = aws_config();
            let params: any;

            if (name) {
                updatedValues.name = name;
            }

            if (contact_no) {
                updatedValues.contact_no = contact_no;
            }

            if (email) {
                updatedValues.email = email;
            }

            if (address) {
                updatedValues.address = address;
            }

            if (state) {
                updatedValues.state = state;
            }

            if (city) {
                updatedValues.city = city;
            }

            if (pincode) {
                updatedValues.pincode = pincode;
            }

            if (files) {
                if (files.restaurant_image) {
                    let extentionName: string = path.extname(files.restaurant_image.name);
                    let filename: string = 'restaurantImage-' + Date.now() + extentionName;

                    params = {
                        Bucket: process.env.BUCKET_NAME,
                        Key: filename,
                        Body: Buffer.from(files.restaurant_image.data, 'binary'),
                    };
                    updatedValues.restaurant_image = filename;
                    let uploadObjPromise = S3.putObject(params).promise();
                    await uploadObjPromise;
                }

                if (Object.keys(files).includes('restaurant_cover_image')) {
                    let extentionName = path.extname(files.restaurant_cover_image.name);
                    let filename = 'restaurantCoverImage-' + Date.now() + extentionName;
                    params = {
                        Bucket: process.env.BUCKET_NAME,
                        Key: filename,
                        Body: Buffer.from(files.restaurant_cover_image.data, 'binary'),
                    };
                    updatedValues.restaurant_cover_image = filename;
                    let uploadObjPromise = S3.putObject(params).promise();
                    await uploadObjPromise;
                }
            }

            if (Object.keys(updatedValues).length === 0) {
                res.render('pages/restaurantProfile.ejs', {
                    project: {
                        messages: {
                            errors: res.__('NO_UPDATE'),
                        },
                    },
                });
                // createResponse(res, STATUS_CODE.OK, res.__('NO_UPDATE'));
                return;
            }

            transaction = await sequelize.transaction();
            await RestaurantModel.updateOne(updatedValues, condition, transaction);
            await transaction.commit();

            restaurantData = await RestaurantModel.getOne(attributes, condition);
            res.render('pages/restaurantProfile.ejs', {
                project: {
                    messages: {
                        success: res.__('RESTAURANT.UPDATE_SUCCESS'),
                    },
                    data: {
                        name: restaurantData.name,
                        contact_no: restaurantData.contact_no,
                        email: restaurantData.email,
                        address: restaurantData.address,
                        state: restaurantData.state,
                        city: restaurantData.city,
                        pincode: restaurantData.pincode,
                    },
                },
            });
            /* createResponse(
                res,
                STATUS_CODE.OK,
                res.__('RESTAURANT.UPDATE_SUCCESS')
            ); */
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'updateRestaurant',
                req.custom.uuid,
                'Error during update restaurant detail : ',
                error
            );
            /* res.render('pages/restaurantResetPassword.ejs', {
                project: {
                    messages: {
                        error: res.__('SERVER_ERROR_MESSAGE'),
                    },
                    data: {
                        uuid: uuid,
                    },
                },
            }); */
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }
}

export default new RestaurantController();
