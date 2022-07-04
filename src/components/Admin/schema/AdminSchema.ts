import { Model, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from '../../../utils/dbConfig';

class AdminMaster extends Model {
    public admin_id!: number;
    public uuid!: string;
    public pincode!: string;
    public name!: string;
    public contact_no!: number;
    public email!: string;
    public username!: string;
    public password_hash!: string;
    public address!: string;
    public created_at!: Date;
    public updated_at!: Date;
}

AdminMaster.init(
    {
        admin_id: {
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
        username: {
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
        pincode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        underscored: true,
        paranoid: true,
        createdAt: false,
        updatedAt: false,
        tableName: 'admin_master',
    }
);

export default AdminMaster;
