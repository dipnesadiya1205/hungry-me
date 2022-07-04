import { Model, DataTypes } from 'sequelize';
import sequelize from '../../../utils/dbConfig';
import bcrypt from 'bcrypt';
import { CustomerOrderItemsMaster } from '../../Customer_Order_Items/schema';

class CustomerMaster extends Model {
    public customer_id!: number;
    public uuid!: string;
    public pincode!: string;
    public firstname!: string;
    public lastname!: string;
    public contact_no!: number;
    public email!: string;
    public password!: string;
    public address!: string;
    public state!: string;
    public city!: string;
    public is_email_verified!: number;
    public created_at!: Date;
    public updated_at!: Date;
}

CustomerMaster.init(
    {
        customer_id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            autoIncrement: true,
        },
        uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastname: {
            type: DataTypes.STRING,
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
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pincode: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: 'customer_master',
    }
);

CustomerMaster.hasMany(CustomerOrderItemsMaster, {
    foreignKey: 'customer_id',
    sourceKey: 'customer_id',
});
CustomerOrderItemsMaster.belongsTo(CustomerMaster, {
    foreignKey: 'customer_id',
});

export default CustomerMaster;
