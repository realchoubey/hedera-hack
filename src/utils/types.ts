import { Optional } from 'sequelize';

// Token attributes interface for database model
export interface TokenAttributes {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    last_updated: Date;
    is_hedera_ecosystem: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interface for Token creation attributes
export interface TokenCreationAttributes extends Optional<TokenAttributes, 'createdAt' | 'updatedAt'> {
}

// Interface for CoinGecko API token response
export interface CoinGeckoToken {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    last_updated: string;
}

// Interface for token information used in the application
export interface TokenInfo {
    id: string;
    symbol: string;
    name: string;
    current_price?: number;
    market_cap?: number;
    market_cap_rank?: number;
    total_volume?: number;
    price_change_24h?: number;
    price_change_percentage_24h?: number;
    description?: {
        en: string;
    };
    links?: {
        homepage: string[];
        blockchain_site: string[];
        official_forum_url: string[];
        twitter_screen_name: string;
        telegram_channel_identifier: string;
    };
}

// Alias for TokenAttributes to be used in controllers
export type IToken = TokenAttributes;
