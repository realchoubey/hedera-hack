import { CoinGeckoService } from '../services/coingeckoService';
import Token from '../models/token';
import { logger } from '../utils/logger';
import { IToken } from '../utils/types';

export class TokenController {
    private coinGeckoService: CoinGeckoService;

    constructor() {
        this.coinGeckoService = new CoinGeckoService();
    }

    public async fetchAndSaveTokens(): Promise<void> {
        try {
            await this.coinGeckoService.fetchAndSaveHederaTokens();
        } catch (error) {
            logger.error(`TokenController::fetchAndSaveTokens::Error in fetchAndSaveTokens:`, error);
            throw error;
        }
    }

    public async getAllTokens(): Promise<IToken[]> {
        try {
            return await Token.findAll({ is_hedera_ecosystem: true }).sort({ market_cap_rank: 1 });
        } catch (error) {
            logger.error(`TokenController::getAllTokens::Error while getting tokens:`, error);
            throw error;
        }
    }

    public async getTokenById(id: string): Promise<IToken | null> {
        try {
            return await Token.findOne({ id, is_hedera_ecosystem: true });
        } catch (error) {
            logger.error(`TokenController::getTokenById::Error while getting token by ID:`, error);
            throw error;
        }
    }
}
