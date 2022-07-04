import { Model, DataTypes } from 'sequelize';
import sequelize from '../../../utils/dbConfig';
import { RestaurantMenuItemMaster } from '../../Restaurant_Menu_Item/schema';

class RestaurantMenuMaster extends Model {
    public menu_id!: number;
    public restaurant_id!: number;
}

RestaurantMenuMaster.init(
    {
        menu_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        restaurant_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
    },
    {
        sequelize,
        paranoid: true,
        underscored: true,
        createdAt: false,
        tableName: 'restaurant_menu_master',
    }
);

RestaurantMenuMaster.hasMany(RestaurantMenuItemMaster, {
    foreignKey: 'menu_id',
    sourceKey: 'menu_id',
});
RestaurantMenuItemMaster.belongsTo(RestaurantMenuMaster, {
    foreignKey: 'menu_id',
});

export default RestaurantMenuMaster;
