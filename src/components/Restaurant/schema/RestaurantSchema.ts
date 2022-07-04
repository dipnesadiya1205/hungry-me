import { Model, DataTypes, UUIDV4, DATE } from 'sequelize';
import sequelize from '../../../utils/dbConfig';
import CouponCodeMaster from '../../Coupon_Code/schema/CouponCodeSchema';
import { CuisineMaster } from '../../Cuisine/schema';
import { RestaurantMenuMaster } from '../../Restaurant_Menu/schema';

class RestaurantMaster extends Model {
    public restaurant_id!: number;
    public uuid!: string;
    public pincode!: string;
    public state!: string;
    public city!: string;
    public name!: string;
    public contact_no!: number;
    public email!: string;
    public password!: string;
    public password_hash!: string;
    public address!: string;
    public restaurant_image!: string;
    public restaurant_cover_image!: string;
    public reject_reason!: string;
    public rejected_date!: Date;
    public active!: number;
    public is_email_verified!: number;
    public created_at!: Date;
    public updated_at!: Date;
}

RestaurantMaster.init(
    {
        restaurant_id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            autoIncrement: true,
        },
        uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        contact_no: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        city: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        pincode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        active: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        restaurant_image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        restaurant_cover_image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        reject_reason: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        rejected_date: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        is_email_verified: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
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
        updatedAt: false,
        tableName: 'restaurant_master',
    }
);

RestaurantMaster.hasMany(CuisineMaster, {
    foreignKey: 'added_by_user_id',
    sourceKey: 'restaurant_id',
});
CuisineMaster.belongsTo(RestaurantMaster, {
    foreignKey: 'restaurant_id',
});

RestaurantMaster.hasMany(CouponCodeMaster, {
    foreignKey: 'restaurant_id',
    sourceKey: 'restaurant_id',
});
CouponCodeMaster.belongsTo(RestaurantMaster, {
    foreignKey: 'restaurant_id',
});

RestaurantMaster.hasMany(RestaurantMenuMaster, {
    foreignKey: 'restaurant_id',
    sourceKey: 'restaurant_id',
});
RestaurantMenuMaster.belongsTo(RestaurantMaster, {
    foreignKey: 'restaurant_id',
});

export default RestaurantMaster;
