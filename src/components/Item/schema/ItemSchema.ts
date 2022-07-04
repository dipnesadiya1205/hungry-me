import { Model, DataTypes } from 'sequelize';
import sequelize from '../../../utils/dbConfig';
import { CustomerOrderItemsMaster } from '../../Customer_Order_Items/schema';
import { RestaurantMenuItemMaster } from '../../Restaurant_Menu_Item/schema';

class ItemMaster extends Model {
    public item_id!: number;
    public uuid!: string;
    public cuisine_id!: number;
    public name!: string;
    public description!: string;
    public created_at!: Date;
    public updated_at!: Date;
}

ItemMaster.init(
    {
        item_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        cuisine_id: {
            type: DataTypes.BIGINT,
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
        createdAt: false,
        tableName: 'item_master',
    }
);

ItemMaster.hasMany(RestaurantMenuItemMaster, {
    foreignKey: 'item_id',
    sourceKey: 'item_id',
});
RestaurantMenuItemMaster.belongsTo(ItemMaster, {
    foreignKey: 'item_id',
});

ItemMaster.hasMany(CustomerOrderItemsMaster, {
    foreignKey: 'item_id',
    sourceKey: 'item_id',
});
CustomerOrderItemsMaster.belongsTo(ItemMaster, {
    foreignKey: 'item_id',
});

export default ItemMaster;
