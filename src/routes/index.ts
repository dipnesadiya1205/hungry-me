import { Application } from 'express';
import AdminRoutes from '../components/Admin/v1/AdminRoutes';
import CustomerRoutes from '../components/Customer/v1/CustomerRoutes';
import RestaurantRoutes from '../components/Restaurant/v1/RestaurantRoutes';
import CouponCodeRoutes from '../components/Coupon_Code/v1/CouponCodeRoutes';
import ItemRoutes from '../components/Item/v1/ItemRoutes';
import OrderRoutes from '../components/Order/v1/OrderRoutes';

/**
 * Init All routes here
 */

export default (app: Application) => {
    // * Routes
    app.use('/admin', [AdminRoutes]);
    app.use('/restaurant', [RestaurantRoutes, CouponCodeRoutes, ItemRoutes]);
    app.use('/', [CustomerRoutes, OrderRoutes]);
};
