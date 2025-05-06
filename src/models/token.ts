import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { TokenAttributes, TokenCreationAttributes } from '../utils/types';

// Token model class
class Token extends Model<TokenAttributes, TokenCreationAttributes> implements TokenAttributes {
    public id!: string;
    public symbol!: string;
    public name!: string;
    public image!: string;
    public current_price!: number;
    public market_cap!: number;
    public market_cap_rank!: number;
    public total_volume!: number;
    public high_24h!: number;
    public low_24h!: number;
    public price_change_24h!: number;
    public price_change_percentage_24h!: number;
    public last_updated!: Date;
    public is_hedera_ecosystem!: boolean;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialize Token model
Token.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        symbol: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        current_price: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        market_cap: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        market_cap_rank: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        total_volume: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        high_24h: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        low_24h: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        price_change_24h: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        price_change_percentage_24h: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        last_updated: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        is_hedera_ecosystem: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'Token',
        tableName: 'tokens',
        timestamps: true,
    }
);

export default Token;
