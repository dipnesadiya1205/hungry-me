import { Model, DataTypes } from 'sequelize';
import sequelize from '../../../utils/dbConfig';
import { CustomerOrderItemsMaster } from '../../Customer_Order_Items/schema';

class RestaurantMenuItemMaster extends Model {
    public menu_item_id!: number;
    public menu_id!: number;
    public cuisine_id!: number;
    public item_id!: number;
    public price!: number;
    public item_image!: string;
    public item_type!: string;
}

RestaurantMenuItemMaster.init(
    {
        menu_item_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        menu_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        cuisine_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        item_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        item_image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        item_type: {
            type: DataTypes.ENUM('VEG', 'NON-VEG', 'VEGAN'),
            allowNull: false,
        },
    },
    {
        sequelize,
        paranoid: true,
        underscored: true,
        createdAt: false,
        tableName: 'restaurant_menu_item_master',
    }
);

export default RestaurantMenuItemMaster;
