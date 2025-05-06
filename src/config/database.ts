import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();


const DB_NAME = process.env.DB_NAME || 'hedera_tokens';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');


export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: (msg) => logger.debug(`Database::sequelize::${msg}`),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export const connectToDatabase = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        logger.info(`Database::connectToDatabase::Connected to PostgreSQL database`);
        await sequelize.sync({ force: false });
        logger.info(`Database::connectToDatabase::Database synchronized`);
    } catch (error) {
        logger.error(`Database::connectToDatabase::Error connecting to PostgreSQL database:`, error);
        process.exit(1);
    }
};

export const disconnectFromDatabase = async (): Promise<void> => {
    try {
        await sequelize.close();
        logger.info(`Database::disconnectFromDatabase::Disconnected from PostgreSQL database`);
    } catch (error) {
        logger.error(`Database::disconnectFromDatabase::Error disconnecting from PostgreSQL database:`, error);
    }
};
