import { Model, DataTypes } from 'sequelize';
import sequelize from '../../../utils/dbConfig';
import { CustomerOrderItemsMaster } from '../../Customer_Order_Items/schema';
import { RestaurantMaster } from '../../Restaurant/schema';

class CouponCodeMaster extends Model {
    public coupon_id!: number;
    public uuid!: string;
    public coupon_code!: string;
    public name!: string;
    public description!: string;
    public discount_percentage!: number;
    public no_of_coupons!: number;
    public min_pay_amt!: number;
    public max_discount_amt!: number;
    public restaurant_id!: number;
    public available_date!: Date;
    public expiry_date!: Date;
    public created_at!: Date;
    public updated_at!: Date;
    public deleted_at!: Date;
}

CouponCodeMaster.init(
    {
        coupon_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        coupon_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        discount_percentage: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        no_of_coupons: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        min_pay_amt: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        max_discount_amt: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        available_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        restaurant_id: {
            type: DataTypes.BIGINT,
        },
        expiry_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
        },
        updated_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        paranoid: true,
        underscored: true,
        tableName: 'restaurant_coupon_code_master',
    }
);

CouponCodeMaster.hasMany(CustomerOrderItemsMaster, {
    foreignKey: 'coupon_id',
    sourceKey: 'coupon_id',
});
CustomerOrderItemsMaster.belongsTo(CouponCodeMaster, {
    foreignKey: 'coupon_id',
});

export default CouponCodeMaster;
