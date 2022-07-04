import { Sequelize } from 'sequelize';
import 'dotenv/config';

const DATABASE_NAME: string = process.env.DATABASE_NAME || '';
const DATABASE_USERNAME: string = process.env.DATABASE_USERNAME || '';
const DATABASE_PASSWORD: string = process.env.DATABASE_PASSWORD || '';

// const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
//     dialect: 'mysql',
//     host: 'ec2-54-211-255-161.compute-1.amazonaws.com',
// });

// const sequelize = new Sequelize(
//     'postgres://tlhebvxhycilrx:b81341bb0d312940849a82fc99dd02bc958342854938dc3eeb539d2c7f39bfa4@ec2-54-211-255-161.compute-1.amazonaws.com:5432/d82dsb1g0hjobu',
//     { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
// );

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
    dialect: 'mysql',
    host: 'localhost',
});

export default sequelize;
