import { Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { Op } from 'sequelize';
import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import redis from '../../../utils/redis';
import { CustomerModel } from '../model';
import { logger } from '../../../utils/logger';
import { createResponse, generateOTP } from '../../../utils/helper';
import STATUS_CODE from 'http-status-codes';
import sequelize from '../../../utils/dbConfig';
import { CustomerMaster } from '../schema';
import { CustomRequest } from '../../../environment';

const SENDGRID_API: any = process.env.SENDGRID_API;
sgMail.setApiKey(SENDGRID_API);

class CustomerController {
    /**
     * @description Customer Sign Up
     * @param req
     * @param res
     */

    public async add(req: CustomRequest, res: Response) {
        let transaction;
        try {
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

            let attributes: string[] = ['customer_id'];
            let condition = {
                [Op.or]: [
                    {
                        email: email,
                    },
                    { contact_no: contact_no },
                ],
            };

            let isExistCustomer = await CustomerModel.getOne(attributes, condition);

            if (isExistCustomer !== null) {
                res.render('pages/customerLogin.ejs', {
                    project: {
                        messages: {
                            error: res.__('CUSTOMER.CUSTOMER_EXIST'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('CUSTOMER.CUSTOMER_EXIST')
                ); */
                return;
            }

            let salt: string = process.env.BCRYPT_SALT || '';
            let hashPassword: string = bcrypt.hashSync(password, salt);
            transaction = await sequelize.transaction();

            const customerData = await CustomerModel.addOne(
                {
                    firstname,
                    lastname,
                    contact_no,
                    email,
                    password: hashPassword,
                    address,
                    state,
                    city,
                    pincode,
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
                )}/customer/verify?token=${verification_token}&uuid=${
                    customerData.uuid
                }">Verify your account</a>`,
            };

            await sgMail.send(msg as any);

            const redisClient: any = await redis.redis_config();

            await redisClient.setEx(
                `customer/verifyEmail/${customerData.uuid}`,
                300,
                verification_token
            );

            /* res.render('pages/customerDashboard.ejs', {
                locals: {
                    messages: {
                        success: res.__('CUSTOMER.SIGNUP'),
                    },
                },
            }); */
            return res.redirect('./home');
            // createResponse(res, STATUS_CODE.OK, res.__('CUSTOMER.SIGNUP'));
        } catch (error: any) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'addCustomer',
                req.custom.uuid,
                'Error during signup of customer : ',
                error
            );
            res.render('pages/customerRegister.ejs', {
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
     * @description Verify customer email address
     * @param req
     * @param res
     */

    public async verify_token(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let getToken: any = req.query.token ? req.query.token : null;
            let uuid: any = req.query.uuid ? req.query.uuid : null;

            const redisClient: any = await redis.redis_config();
            let token = (await redisClient.get(`customer/verifyEmail/${uuid}`)) || null;

            if (token === null) {
                res.render('pages/customerRegister.ejs', {
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
            }

            if (token === getToken) {
                await redisClient.del(`verifyEmail/${uuid}`);

                let condition: {
                    uuid: string;
                } = {
                    uuid: uuid,
                };

                transaction = await sequelize.transaction();
                await CustomerModel.updateOne({ is_email_verified: 1 }, condition, transaction);
                transaction.commit();

                /* res.render('pages/customerDashboard.ejs', {
                    project: {
                        messages: {
                            error: res.__('EMAIL.EMAIL_VERIFIED'),
                        },
                    },
                }); */
                res.redirect('./home');
                // createResponse(res, STATUS_CODE.OK, res.__('EMAIL.EMAIL_VERIFIED'));
            }
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'verifyCustomerEmail',
                req.custom.uuid,
                'Error during verify email of customer : ',
                error
            );
            res.render('pages/customerRegister.ejs', {
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
     * @description get Customer Detail
     * @param req
     * @param res
     */

    public async get_detail(req: CustomRequest, res: Response) {
        try {
            let { uuid } = req.params;

            let attributes: string[] = [
                'firstname',
                'lastname',
                'contact_no',
                'email',
                'address',
                'state',
                'city',
                'pincode',
            ];
            let condition: any = {
                uuid,
            };
            let fetchedData = await CustomerModel.getOne(attributes, condition);

            if (fetchedData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, res.__('CUSTOMER.NOT_FOUND'));
                return;
            }

            createResponse(
                res,
                STATUS_CODE.OK,
                res.__('CUSTOMER.DETAIL'),
                fetchedData as CustomerMaster
            );
        } catch (error) {
            logger.error(
                __filename,
                'getCustomerDetail',
                req.custom.uuid,
                'Error during fetching customer detail',
                error
            );
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Customer Login Detail
     * @param req
     * @param res
     */

    public async login_customer(req: CustomRequest, res: Response) {
        try {
            let { password, ...credential } = req.body;

            const redisObj = await redis.redis_config();
            const JWT_SECRET_KEY: any = process.env.JWT_SECRET_KEY;

            let attributes = ['customer_id', 'uuid', 'password', 'is_email_verified'];
            let condition = {
                [Op.or]: [
                    { email: credential.email ? credential.email : null },
                    {
                        contact_no: credential.contact_no ? credential.contact_no : null,
                    },
                ],
            };

            let customerData = await CustomerModel.getOne(attributes, condition);

            if (customerData === null) {
                res.render('pages/customerLogin.ejs', {
                    project: {
                        messages: {
                            error: res.__('CUSTOMER.NOT_FOUND'),
                        },
                    },
                });
                /*  createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('CUSTOMER.NOT_FOUND')
                ); */
                return;
            }

            if (customerData.is_email_verified === 0) {
                res.render('pages/customerLogin.ejs', {
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
                (await redisObj.get(`customer/logintoken/uuid=${customerData.uuid}`)) || '';

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

            let is_login = await bcrypt.compare(password, customerData.password);

            if (!is_login) {
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('LOGIN.INVALID_CREDENTIAL')
                ); */
                res.render('pages/customerLogin.ejs', {
                    project: {
                        messages: {
                            error: res.__('LOGIN.INVALID_CREDENTIAL'),
                        },
                    },
                });
                return;
            }

            const token: any = await jwt.sign({ uuid: customerData.uuid, role: 2 }, JWT_SECRET_KEY);

            await redisObj.setEx(`customer/logintoken/uuid=${customerData.uuid}`, 7200, token);

            req.session.authorization = token;

            return res.redirect('./home');
            // createResponse(res, STATUS_CODE.OK, res.__('LOGIN.LOGIN_SUCCESS'));
        } catch (error) {
            logger.error(
                __filename,
                'logincustomer',
                req.custom.uuid,
                'Error during login of customer : ',
                error
            );
            res.render('pages/customerLogin.ejs', {
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
     * @description Customer Logout
     * @param req
     * @param res
     */

    public async logout_customer(req: CustomRequest, res: Response) {
        try {
            let uuid: string = req.custom.customer_uuid || '';

            const redisConfig = await redis.redis_config();

            if (uuid) {
                await redisConfig.del(`customer/logintoken/uuid=${uuid}`);
                if (req.session.authorization) {
                    req.session.destroy();
                }

                /* res.render('pages/customerLogin.ejs', {
                    project: {
                        messages: {
                            success: 'success',
                        },
                    },
                }); */
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
                'logoutCustomer',
                req.custom.uuid,
                'Error during logout of customer : ',
                error
            );
            createResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, res.__('SERVER_ERROR_MESSAGE'));
        }
    }

    /**
     * @description Customer forgot password
     * @param req
     * @param res
     */

    public async forgot_password(req: CustomRequest, res: Response) {
        try {
            let { email, contact_no } = req.body;

            let attributes: string[] = ['is_email_verified', 'email', 'contact_no', 'uuid'];
            let condition = {
                [Op.or]: [
                    { email: email ? email : null },
                    { contact_no: contact_no ? contact_no : null },
                ],
            };

            let customerData: any = await CustomerModel.getOne(attributes, condition);

            if (customerData === null) {
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('CUSTOMER.NOT_FOUND')
                ); */
                res.render('pages/customerForgotPassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('CUSTOMER.NOT_FOUND'),
                        },
                    },
                });
                return;
            }

            if (customerData.is_email_verified === 0) {
                res.render('pages/customerForgotPassword.ejs', {
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

            let generatedOtp: number = generateOTP();

            const msg = {
                to: customerData.email,
                from: process.env.FROM_EMAIL,
                subject: `One Time Password - ${generatedOtp}`,
                text: `Your registered email address is ${customerData.email}`,
                html: `<p>Dear Sir/Madam,</p>
                       <p>Your One Time Password (OTP) is ${generatedOtp} to reset your Password.</p>`,
            };

            const redisClient: any = await redis.redis_config();

            await sgMail.send(msg as any);

            await redisClient.setEx(`customer/otp/uuid=${customerData.uuid}`, 120, generatedOtp);

            res.render('pages/customerVerifyOtp.ejs', {
                project: {
                    messages: {
                        success: res.__('OTP.OTP_GENERATED'),
                    },
                    data: {
                        uuid: customerData.uuid,
                    },
                },
            });
            // createResponse(res, STATUS_CODE.OK, res.__('OTP.OTP_GENERATED'));
        } catch (error: any) {
            logger.error(
                __filename,
                'forgotpasswordCustomer',
                req.custom.uuid,
                'Error during forgot password of customer : ',
                error
            );
            res.render('pages/customerForgotPassword.ejs', {
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

            let getOTP: any = await redisClient.get(`customer/otp/uuid=${uuid}`);

            if (getOTP === null) {
                res.render('pages/customerVerifyOtp.ejs', {
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
                res.render('pages/customerVerifyOtp.ejs', {
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

            await redisClient.del(`customer/otp/uuid=${uuid}`);

            res.render('pages/customerResetPassword.ejs', {
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
                'verifyOtpCustomer',
                req.custom.uuid,
                'Error during verify otp of customer : ',
                error
            );
            res.render('pages/customerVerifyOtp.ejs', {
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

            let customerData: any = await CustomerModel.getOne(attributes, condition);

            if (customerData === null) {
                createResponse(res, STATUS_CODE.NOT_FOUND, res.__('CUSTOMER.NOT_FOUND'));
                return;
            }

            let generatedOtp: number = generateOTP();

            const msg = {
                to: customerData.email,
                from: process.env.FROM_EMAIL,
                subject: `Resend One Time Password - ${generatedOtp}`,
                html: `<p>Dear Sir/Madam,</p>
                       <p>Your Resend One Time Password (OTP) is ${generatedOtp} to reset your Password.</p>`,
            };

            await sgMail.send(msg as any);

            const redisClient: any = await redis.redis_config();

            await redisClient.setEx(`customer/otp/uuid=${uuid}`, 120, generatedOtp);

            createResponse(res, STATUS_CODE.OK, res.__('OTP.OTP_GENERATED'));
        } catch (error: any) {
            logger.error(
                __filename,
                'resendOtpCustomer',
                req.custom.uuid,
                'Error during resend otp of customer : ',
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
            let attributes: string[] = ['customer_id', 'password'];
            let condition = { uuid };

            let customerData = await CustomerModel.getOne(attributes, condition);

            if (customerData === null) {
                res.render('pages/customerResetPassword.ejs', {
                    project: {
                        messages: {
                            error: res.__('CUSTOMER.NOT_FOUND'),
                        },
                        data: {
                            uuid: uuid,
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('CUSTOMER.NOT_FOUND')
                ); */
                return;
            }

            let isPasswordSame: any = await bcrypt.compare(password, customerData.password);

            if (isPasswordSame) {
                res.render('pages/customerResetPassword.ejs', {
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
            await CustomerModel.updateOne({ password: newPassword }, condition, transaction);
            transaction.commit();

            res.render('pages/customerLogin.ejs', {
                project: {
                    messages: {
                        success: res.__('PASSWORD_RESET_SUCCESS'),
                    },
                },
            });
            /* createResponse(
                res,
                STATUS_CODE.OK,
                res.__('PASSWORD_RESET_SUCCESS')
            ); */
        } catch (error: any) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'resetPasswordCustomer',
                req.custom.uuid,
                'Error during reset password of customer : ',
                error
            );
            res.render('pages/customerResetPassword.ejs', {
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
            let uuid = req.custom.customer_uuid ? req.custom.customer_uuid : null;

            if (uuid === null) {
                res.redirect('./login');

                /* res.render('pages/customerLogin.ejs', {
                    project: {
                        messages: {
                            error: res.__('LOGIN.LOGIN_REQUIRE'),
                        },
                    },
                }); */
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('LOGIN.LOGIN_REQUIRE')
                ); */
                return;
            }

            let { current_password, new_password } = req.body;

            let attributes = ['customer_id', 'password'];
            let condition = { uuid };

            let customerData = await CustomerModel.getOne(attributes, condition);

            if (customerData === null) {
                res.render('pages/customerRegister.ejs', {
                    project: {
                        messages: {
                            error: res.__('CUSTOMER.NOT_FOUND'),
                        },
                    },
                });
                /* createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('CUSTOMER.NOT_FOUND')
                ); */
                return;
            }

            let salt: string = process.env.BCRYPT_SALT || '';

            let currentHashPassword: string = bcrypt.hashSync(current_password, salt);

            if (currentHashPassword !== customerData.password) {
                res.render('pages/customerchangepassword.ejs', {
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
                res.render('pages/customerchangepassword.ejs', {
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
            await CustomerModel.updateOne({ password: newHashPassword }, { uuid }, transaction);
            await transaction.commit();

            return res.redirect('./home');
            // createResponse(res, STATUS_CODE.OK, res.__('PASSWORD_UPDATE'));
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'changePasswordCustomer',
                req.custom.uuid,
                'Error during change password of customer : ',
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
     * @description update customer
     * @param req,
     * @param res
     */

    public async update(req: CustomRequest, res: Response) {
        let transaction;
        try {
            let { firstname, lastname, contact_no, email, address, state, city, pincode } =
                req.body;
            let uuid = req.custom.customer_uuid ? req.custom.customer_uuid : null;

            if (uuid === null) {
                res.render('pages/customerLogin.ejs', {
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

            let attributes = [
                'customer_id',
                'firstname',
                'lastname',
                'email',
                'contact_no',
                'address',
                'state',
                'city',
                'pincode',
            ];
            let condition = { uuid };

            let customerData = await CustomerModel.getOne(attributes, condition);

            if (customerData === null) {
                res.render('pages/customerProfile.ejs', {
                    project: {
                        messages: {
                            errors: res.__('CUSTOMER.NOT_FOUND'),
                        },
                    },
                });
                /*  createResponse(
                    res,
                    STATUS_CODE.NOT_FOUND,
                    res.__('CUSTOMER.NOT_FOUND')
                ); */
                return;
            }

            let updatedValues: any = {};

            if (firstname) {
                updatedValues.firstname = firstname;
            }

            if (lastname) {
                updatedValues.lastname = lastname;
            }

            if (contact_no) {
                updatedValues.email = email;
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

            if (Object.keys(updatedValues).length === 0) {
                res.render('pages/customerProfile.ejs', {
                    project: {
                        messages: {
                            errors: res.__('NO_UPDATE'),
                        },
                    },
                });
                // createResponse(res, STATUS_CODE.NOT_FOUND, res.__('NO_UPDATE'));
                return;
            }

            transaction = await sequelize.transaction();

            await CustomerModel.updateOne(updatedValues, condition, transaction);

            await transaction.commit();

            customerData = await CustomerModel.getOne(attributes, condition);
            res.render('pages/customerProfile.ejs', {
                project: {
                    messages: {
                        success: res.__('CUSTOMER.UPDATE_SUCCESS'),
                    },
                    data: {
                        firstname: customerData.firstname,
                        lastname: customerData.lastname,
                        contact_no: customerData.contact_no,
                        email: customerData.email,
                        address: customerData.address,
                        state: customerData.state,
                        city: customerData.city,
                        pincode: customerData.pincode,
                    },
                },
            });
            /* createResponse(
                res,
                STATUS_CODE.OK,
                res.__('CUSTOMER.UPDATE_SUCCESS')
            ); */
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(
                __filename,
                'updateCustomer',
                req.custom.uuid,
                'Error during update customer : ',
                error
            );
            /* res.render('pages/customerResetPassword.ejs', {
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

export default new CustomerController();
