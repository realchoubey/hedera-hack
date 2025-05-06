import axios from 'axios';
import { logger } from '../utils/logger';
import Token from '../models/token';
import { CoinGeckoToken } from '../utils/types';


const HEDERA_ECOSYSTEM_TOKENS = ['hedera-ecosystem'];

export class CoinGeckoService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'https://api.coingecko.com/api/v3';
    }

    public async fetchAndSaveHederaTokens(): Promise<void> {
        try {
            logger.info(`CoinGeckoService::fetchAndSaveHederaTokens::Fetching Hedera ecosystem tokens from CoinGecko`);
            const tokenIds = HEDERA_ECOSYSTEM_TOKENS.join(',');
            const response = await axios.get(`${this.baseUrl}/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    ids: tokenIds,
                    order: 'market_cap_desc',
                    per_page: 100,
                    page: 1,
                    sparkline: false,
                },
            });
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response from CoinGecko API');
            }
            const tokens = response.data as CoinGeckoToken[];
            logger.info(`CoinGeckoService::fetchAndSaveHederaTokens::Fetched ${tokens.length} tokens from CoinGecko`);
            for (const tokenData of tokens) {
                await this.saveToken(tokenData);
            }
            logger.info(`CoinGeckoService::fetchAndSaveHederaTokens::Successfully saved Hedera ecosystem tokens to database`);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                logger.error(`CoinGeckoService::fetchAndSaveHederaTokens::CoinGecko API error: ${error.response.status} - ${error.response.statusText}`);
            } else {
                logger.error(`CoinGeckoService::fetchAndSaveHederaTokens::Error fetching Hedera ecosystem tokens:`, error);
            }
            throw error;
        }
    }

    private async saveToken(tokenData: CoinGeckoToken): Promise<void> {
        try {
            const tokenToSave = {
                id: tokenData.id,
                symbol: tokenData.symbol,
                name: tokenData.name,
                image: tokenData.image,
                current_price: tokenData.current_price,
                market_cap: tokenData.market_cap,
                market_cap_rank: tokenData.market_cap_rank,
                total_volume: tokenData.total_volume,
                high_24h: tokenData.high_24h,
                low_24h: tokenData.low_24h,
                price_change_24h: tokenData.price_change_24h,
                price_change_percentage_24h: tokenData.price_change_percentage_24h,
                last_updated: new Date(tokenData.last_updated),
                is_hedera_ecosystem: true,
            };
            await Token.upsert(tokenToSave);
            logger.info(`CoinGeckoService::saveToken::Saved/updated token: ${tokenData.name} (${tokenData.symbol})`);
        } catch (error) {
            logger.error(`CoinGeckoService::saveToken::Error saving token ${tokenData.name}:`, error);
            throw error;
        }
    }
}
