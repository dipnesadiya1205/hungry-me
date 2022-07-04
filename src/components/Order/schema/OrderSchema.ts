import { Model, DataTypes } from 'sequelize';
import sequelize from '../../../utils/dbConfig';
import { CustomerOrderItemsMaster } from '../../Customer_Order_Items/schema';

class OrderMaster extends Model {
    public order_id!: number;
    public uuid!: string;
    public coupon_id!: number;
    public customer_id!: number;
    public order_date!: Date;
    public status!: number;
    public shipping_charges!: number;
    public discount_amount!: number;
    public total_pay!: number;
}

OrderMaster.init(
    {
        order_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        coupon_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        customer_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        order_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        shipping_charges: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        discount_amount: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0.0,
        },
        total_pay: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.0,
        },
    },
    {
        sequelize,
        paranoid: true,
        underscored: true,
        createdAt: false,
        tableName: 'order_master',
    }
);

OrderMaster.hasMany(CustomerOrderItemsMaster, {
    foreignKey: 'order_id',
    sourceKey: 'order_id',
});
CustomerOrderItemsMaster.belongsTo(OrderMaster, {
    foreignKey: 'order_id',
});

export default OrderMaster;
