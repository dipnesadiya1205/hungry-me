import { Model, DataTypes } from 'sequelize';
import sequelize from '../../../utils/dbConfig';
import { ItemMaster } from '../../Item/schema';
import { RestaurantMenuItemMaster } from '../../Restaurant_Menu_Item/schema';

class CuisineMaster extends Model {
    public cuisine_id!: number;
    public uuid!: string;
    public name!: string;
    public description!: string;
    public status!: number;
    public added_by!: string;
    public added_by_user_id!: number;
    public created_at!: Date;
    public updated_at!: Date;
}

CuisineMaster.init(
    {
        cuisine_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        added_by: {
            type: DataTypes.ENUM('admin', 'restaurant'),
            defaultValue: null,
        },
        added_by_user_id: {
            type: DataTypes.BIGINT,
            defaultValue: null,
        },
        created_at: { type: DataTypes.DATE },
        updated_at: { type: DataTypes.DATE },
    },
    {
        sequelize,
        paranoid: true,
        underscored: true,
        createdAt: false,
        tableName: 'cuisine_master',
    }
);

CuisineMaster.hasMany(ItemMaster, {
    sourceKey: 'cuisine_id',
    foreignKey: 'cuisine_id',
});
ItemMaster.belongsTo(CuisineMaster, {
    foreignKey: 'cuisine_id',
});

CuisineMaster.hasMany(RestaurantMenuItemMaster, {
    sourceKey: 'cuisine_id',
    foreignKey: 'cuisine_id',
});
RestaurantMenuItemMaster.belongsTo(CuisineMaster, {
    foreignKey: 'cuisine_id',
});

export default CuisineMaster;
