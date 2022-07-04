import { Response } from 'express';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import redis from '../../../utils/redis';
import sgMail from '@sendgrid/mail';
import { AdminModel } from '../model';
import { logger } from '../../../utils/logger';
import { createResponse, generateOTP } from '../../../utils/helper';
import STATUS_CODE from 'http-status-codes';
import sequelize from '../../../utils/dbConfig';
import { AdminMaster } from '../schema';
import { CustomRequest } from '../../../environment';
import { RestaurantModel } from '../../Restaurant/model';
import moment from 'moment';

const SENDGRID_API: any = process.env.SENDGRID_API;
sgMail.setApiKey(SENDGRID_API);
class AdminController {
    /**
     * @description Admin Sign Up
     * @param req
     * @param res
     */

    public async add(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { name, contact_no, email, username, password, address, pincode } = req.body;

            let attributes: string[] = ['admin_id'];
            let condition = {
                [Op.or]: [
                    {
                        email: email,
                    },
                    { username: username },
                    { contact_no: contact_no },
                ],
            };

            let isExistAdmin = await AdminModel.getOne(attributes, condition);

            if (isExistAdmin !== null) {
                res.render('pages/login.ejs', {
                    project: {
                        messages: {
                            error: res.__('ADMIN.ADMIN_EXIST'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('ADMIN.ADMIN_EXIST')
                );
                return; */
                return;
            }

            let salt: string = process.env.BCRYPT_SALT || '';
            let hashPassword: string = bcrypt.hashSync(password, salt);
            transaction = await sequelize.transaction();

            await AdminModel.addOne(
                {
                    name,
                    contact_no,
                    email,
                    username,
                    password: hashPassword,
                    address,
                    pincode,
                },
                transaction
            );

            await transaction.commit();

            return res.redirect('./home');
            // createResponse(res, STATUS_CODES.OK, res.__('ADMIN.SIGNUP'));
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'addAdmin',
                req.custom.uuid,
                'Error during signup of admin : ',
                error
            );
            res.render('pages/register.ejs', {
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
     * @description get Admin Detail
     * @param req
     * @param res
     */

    public async get_admin_detail(req: CustomRequest, res: Response) {
        try {
            let { uuid } = req.params;

            let attributes: string[] = [
                'admin_id',
                'name',
                'contact_no',
                'email',
                'username',
                'address',
                'pincode',
            ];
            let condition: any = {
                uuid,
            };
            let fetchedData = await AdminModel.getOne(attributes, condition);

            if (fetchedData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, res.__('ADMIN.NOT_FOUND'));
                return;
            }

            createResponse(res, STATUS_CODE.OK, res.__('ADMIN.DETAIL'), fetchedData as AdminMaster);
        } catch (error) {
            logger.error(
                __filename,
                'getAdminDetail',
                req.custom.uuid,
                'Error during fetching admin detail',
                error
            );
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Admin Login Detail
     * @param req
     * @param res
     */

    public async login_admin(req: CustomRequest, res: Response) {
        try {
            let { password, ...credential } = req.body;

            let attributes = ['admin_id', 'uuid', 'password'];
            let condition = {
                [Op.or]: [
                    {
                        email: credential.email ? credential.email : null,
                    },
                    {
                        username: credential.username ? credential.username : null,
                    },
                    {
                        contact_no: credential.contact_no ? credential.contact_no : null,
                    },
                ],
            };

            const redisObj = await redis.redis_config();

            const JWT_SECRET_KEY: string = process.env.JWT_SECRET_KEY || '';

            let adminData = await AdminModel.getOne(attributes, condition);

            if (adminData === null) {
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('ADMIN.NOT_FOUND')
                ); */
                res.render('pages/login.ejs', {
                    project: {
                        messages: {
                            error: res.__('ADMIN.NOT_FOUND'),
                        },
                    },
                });
                return;
            }

            let alreadyLogin =
                (await redisObj.get(`admin/logintoken/uuid=${adminData.uuid}`)) || '';

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

            let is_login = await bcrypt.compare(password, adminData.password);

            if (!is_login) {
                res.render('pages/login.ejs', {
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

            const token: any = jwt.sign({ uuid: adminData.uuid, role: 1 }, JWT_SECRET_KEY);

            await redisObj.setEx(`admin/logintoken/uuid=${adminData.uuid}`, 7200, token);

            req.session.authorization = token;

            return res.redirect('./home');

            // createResponse(res, STATUS_CODE.OK, res.__('LOGIN.LOGIN_SUCCESS'));
        } catch (error: any) {
            logger.error(
                __filename,
                'loginAdmin',
                req.custom.uuid,
                'Error during login of admin : ',
                error
            );
            console.log(error.stack);
            res.render('pages/login.ejs', {
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
     * @description Admin Logout
     * @param req
     * @param res
     */

    public async logout_admin(req: CustomRequest, res: Response) {
        try {
            let uuid: string = req.custom.admin_uuid || '';

            const redisConfig = await redis.redis_config();

            if (uuid) {
                await redisConfig.del(`admin/logintoken/uuid=${uuid}`);
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
                'logoutAdmin',
                req.custom.uuid,
                'Error during logout of admin : ',
                error
            );
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Admin forgot password
     * @param req
     * @param res
     */

    public async forgot_password(req: CustomRequest, res: Response) {
        try {
            let { email, username, contact_no } = req.body;

            let attributes: string[] = ['username', 'email', 'contact_no', 'uuid'];
            let condition = {
                [Op.or]: [
                    { username: username ? username : null },
                    { email: email ? email : null },
                    { contact_no: contact_no ? contact_no : null },
                ],
            };

            let adminData: any = await AdminModel.getOne(attributes, condition);

            if (adminData === null) {
                res.render('pages/forgotPassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('ADMIN.NOT_FOUND'),
                        },
                        data: {
                            uuid: adminData.uuid,
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('ADMIN.NOT_FOUND')
                ); */
                return;
            }

            let generatedOtp: number = generateOTP();

            const msg = {
                to: adminData.email,
                from: process.env.FROM_EMAIL,
                subject: `One Time Password - ${generatedOtp}`,
                text: `Your registered email address is ${adminData.email}`,
                html: `<p>Dear Sir/Madam,</p>
                       <p>Your One Time Password (OTP) is ${generatedOtp} to reset your Password.</p>`,
            };

            const redisClient: any = await redis.redis_config();

            await sgMail.send(msg as any);

            await redisClient.setEx(`admin/otp/uuid=${adminData.uuid}`, 120, generatedOtp);

            res.render('pages/verifyOtp.ejs', {
                project: {
                    messages: {
                        success: res.__('OTP.OTP_GENERATED'),
                    },
                    data: {
                        uuid: adminData.uuid,
                    },
                },
            });
            // createResponse(res, STATUS_CODE.OK, res.__('OTP.OTP_GENERATED'));
        } catch (error: any) {
            logger.error(
                __filename,
                'forgotpasswordAdmin',
                req.custom.uuid,
                'Error during forgot password of admin : ',
                error
            );
            res.render('pages/forgotPassword.ejs', {
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
     * @description verify otp of forgot password
     * @param req,
     * @param res
     */

    public async verify_otp(req: CustomRequest, res: Response) {
        let { otp, uuid } = req.body;
        try {
            const redisClient: any = await redis.redis_config();

            let getOTP: any = await redisClient.get(`admin/otp/uuid=${uuid}`);

            if (getOTP === null) {
                res.render('pages/verifyOtp.ejs', {
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
                res.render('pages/verifyOtp.ejs', {
                    project: {
                        messages: {
                            error: res.__('OTP.OTP_EXPIRED'),
                        },
                        data: {
                            uuid: uuid,
                        },
                    },
                });
                /*  createResponse(
                    res,
                    STATUS_CODE.NOT_ACCEPTABLE,
                    res.__('OTP.OTP_INVALID')
                ); */
                return;
            }

            await redisClient.del(`admin/otp/uuid=${uuid}`);
            res.render('pages/resetPassword.ejs', {
                project: {
                    messages: {
                        success: res.__('OTP.OTP_VERIFIED'),
                    },
                    data: {
                        uuid: uuid,
                    },
                },
            });
            /* createResponse(res, STATUS_CODE.OK, res.__('OTP.OTP_VERIFIED')); */
        } catch (error: any) {
            logger.error(
                __filename,
                'verifyOtpAdmin',
                req.custom.uuid,
                'Error during verify otp of admin : ',
                error
            );
            res.render('pages/verifyOtp.ejs', {
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

            let adminData: any = await AdminModel.getOne(attributes, condition);

            if (adminData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, res.__('ADMIN.NOT_FOUND'));
                return;
            }

            let generatedOtp: number = generateOTP();

            const msg = {
                to: adminData.email,
                from: process.env.FROM_EMAIL,
                subject: `Resend One Time Password - ${generatedOtp}`,
                html: `<p>Dear Sir/Madam,</p>
                       <p>Your Resend One Time Password (OTP) is ${generatedOtp} to reset your Password.</p>`,
            };

            await sgMail.send(msg as any);

            const redisClient: any = await redis.redis_config();

            await redisClient.setEx(`admin/otp/uuid=${uuid}`, 120, generatedOtp);

            createResponse(res, STATUS_CODE.OK, res.__('OTP.OTP_GENERATED'));
        } catch (error: any) {
            logger.error(
                __filename,
                'resendOtpAdmin',
                req.custom.uuid,
                'Error during resend otp of admin : ',
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
            let attributes: string[] = ['admin_id', 'password'];
            let condition = { uuid };

            let adminData = await AdminModel.getOne(attributes, condition);

            if (adminData === null) {
                res.render('pages/resetPassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('ADMIN.NOT_FOUND'),
                        },
                        data: {
                            uuid: uuid,
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('ADMIN.NOT_FOUND')
                ); */
                return;
            }

            let isPasswordSame: any = await bcrypt.compare(password, adminData.password);

            if (isPasswordSame) {
                res.render('pages/resetPassword.ejs', {
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
            await AdminModel.updateOne({ password: newPassword }, condition, transaction);
            await transaction.commit();

            res.redirect('./login');
            /* createResponse(
                res,
                STATUS_CODE.OK,
                res.__('PASSWORD_RESET_SUCCESS')
            ); */
        } catch (error: any) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'resetPasswordAdmin',
                req.custom.uuid,
                'Error during reset password of admin : ',
                error
            );
            res.render('pages/resetPassword.ejs', {
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
     * @description Change password
     * @param req,
     * @param res
     */

    public async change_password(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let uuid = req.custom.admin_uuid ? req.custom.admin_uuid : null;

            if (uuid === null) {
                res.redirect(STATUS_CODE.UNPROCESSABLE_ENTITY, 'localhost:8000/admin/login');
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('LOGIN.LOGIN_REQUIRE')
                ); */
                return;
            }

            let { current_password, new_password } = req.body;

            let attributes = ['admin_id', 'password'];
            let condition = { uuid };

            let adminData = await AdminModel.getOne(attributes, condition);

            if (adminData === null) {
                res.render('pages/register.ejs', {
                    project: {
                        messages: {
                            error: res.__('ADMIN.NOT_FOUND'),
                        },
                    },
                });
                /*  createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('ADMIN.NOT_FOUND')
                ); */
                return;
            }

            let salt: string = process.env.BCRYPT_SALT || '';

            let currentHashPassword: string = bcrypt.hashSync(current_password, salt);

            if (currentHashPassword !== adminData.password) {
                res.render('pages/changepassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('PASSWORD_NOT_MATCH'),
                        },
                    },
                });
                /*  createResponse(
                    res,
                    STATUS_CODE.UNAUTHORIZED,
                    res.__('PASSWORD_NOT_MATCH')
                ); */
                return;
            }

            let newHashPassword: string = bcrypt.hashSync(new_password, salt);

            if (newHashPassword === currentHashPassword) {
                res.render('pages/changepassword.ejs', {
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
            await AdminModel.updateOne({ password: newHashPassword }, { uuid }, transaction);
            await transaction.commit();

            res.render('pages/dashboard.ejs', {
                project: {
                    messages: {
                        success: res.__('PASSWORD_UPDATE'),
                    },
                },
            });

            // createResponse(res, STATUS_CODE.OK, res.__('PASSWORD_UPDATE'));
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'changePasswordAdmin',
                req.custom.uuid,
                'Error during change password of admin : ',
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
     * @description update admin
     * @param req,
     * @param res
     */

    public async update(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { name, contact_no, email, username, address, pincode } = req.body;
            let uuid = req.custom.admin_uuid ? req.custom.admin_uuid : null;

            if (uuid === null) {
                res.render('pages/login.ejs', {
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
                'admin_id',
                'name',
                'contact_no',
                'email',
                'username',
                'address',
                'pincode',
            ];
            let condition: any = {
                uuid,
            };

            let adminData = await AdminModel.getOne(attributes, condition);

            if (adminData === null) {
                res.render('pages/profile.ejs', {
                    project: {
                        messages: {
                            errors: res.__('ADMIN.NOT_FOUND'),
                        },
                    },
                });
                /*  createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('ADMIN.NOT_FOUND')
                ); */
                return;
            }

            let updatedValues: any = {};

            if (name) {
                updatedValues.name = name;
            }

            if (contact_no) {
                updatedValues.contact_no = contact_no;
            }

            if (email) {
                updatedValues.email = email;
            }

            if (username) {
                updatedValues.username = username;
            }

            if (address) {
                updatedValues.address = address;
            }

            if (pincode) {
                updatedValues.pincode = pincode;
            }

            if (Object.keys(updatedValues).length === 0) {
                res.render('pages/profile.ejs', {
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

            await AdminModel.updateOne(updatedValues, condition, transaction);

            await transaction.commit();

            adminData = await AdminModel.getOne(attributes, condition);
            res.render('pages/profile.ejs', {
                project: {
                    messages: {
                        success: res.__('ADMIN.UPDATE_SUCCESS'),
                    },
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
            // createResponse(res, STATUS_CODE.OK, res.__('ADMIN.UPDATE_SUCCESS'));
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'updateAdmin',
                req.custom.uuid,
                'Error during update admin : ',
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
     * @description get restaurant request details
     * @param req,
     * @param res
     */

    public async get_restaurant_list(req: CustomRequest, res: Response) {
        try {
            let restaurantData = await RestaurantModel.getMany([], { active: 0 }, [], {
                attributes: { exclude: ['password'] },
            });

            if (restaurantData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, res.__('RESTAURANT.NOT_FOUND'));
                return;
            }

            createResponse(res, STATUS_CODE.OK, res.__('RESTAURANT.DETAIL'), restaurantData);
        } catch (error) {
            logger.error(
                __filename,
                'getRequestedRestaurant',
                req.custom.uuid,
                'Error during fetching requests of restaurants : ',
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
     * @description approve or decline restaurant request
     * @param req,
     * @param res
     */

    public async requested_restaurant(req: CustomRequest, res: Response) {
        let transaction;
        try {
            //let attribute: any = { exclude: ['password'] };
            /* let restaurantData = await RestaurantModel.getMany(
                [],
                { active: 0 },
                [],
                { attributes: attribute }
            ); */

            let { uuid, reject_reason } = req.body;

            transaction = await sequelize.transaction();

            if (reject_reason) {
                await RestaurantModel.updateOne(
                    {
                        active: 0,
                        reject_reason,
                        rejected_date: moment().utc(),
                    },
                    { uuid },
                    transaction
                );
                await transaction.commit();
                res.redirect('/admin/restaurant/request-list');
                // createResponse(res, STATUS_CODE.OK, `${uuid} restaurant request is rejected`);
                return;
            }

            await RestaurantModel.updateOne({ active: 1 }, { uuid }, transaction);
            await transaction.commit();

            res.redirect('/admin/restaurant/request-list');
            //createResponse(res, STATUS_CODE.OK, `${uuid} restaurant request is approved`);
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'requestedRestaurant',
                req.custom.uuid,
                'Error during fetching approval requests of restaurants : ',
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
}

export default new AdminController();
