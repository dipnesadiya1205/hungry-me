import { Model, DataTypes } from 'sequelize';
import sequelize from '../../../utils/dbConfig';

class CustomerOrderItemsMaster extends Model {
    public order_item_id!: number;
    public order_id!: number;
    public item_id!: number;
    public qty!: number;
    public total_price!: number;
    public created_at!: Date;
    public updated_at!: Date;
}

CustomerOrderItemsMaster.init(
    {
        order_item_id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            autoIncrement: true,
        },
        order_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        item_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_price: {
            type: DataTypes.FLOAT,
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
        underscored: true,
        paranoid: true,
        createdAt: false,
        tableName: 'customer_order_items',
    }
);

export default CustomerOrderItemsMaster;
