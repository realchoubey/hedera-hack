import axios from 'axios';
import { logger } from '../utils/logger';
import { TokenInfo } from '../utils/types';

export class TokenInfoService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'https://api.coingecko.com/api/v3';
    }

    public extractTokenSymbols(input: string): string[] {
        logger.info(`TokenInfoService::extractTokenSymbols::Extracting token symbols from input`);

        const symbolRegex = /\$([A-Za-z0-9]+)/g;
        const matches = input.match(symbolRegex);

        if (!matches) {
            logger.info(`TokenInfoService::extractTokenSymbols::No token symbols found in input`);
            return [];
        }

        const symbols = matches.map(match => match.substring(1).toUpperCase());
        logger.info(`TokenInfoService::extractTokenSymbols::Found ${symbols.length} token symbols: ${symbols.join(', ')}`);
        return symbols;
    }

    public async searchTokenBySymbol(symbol: string): Promise<TokenInfo | null> {
        try {
            logger.info(`TokenInfoService::searchTokenBySymbol::Searching for token with symbol: ${symbol}`);

            const searchResponse = await axios.get(`${this.baseUrl}/search`, {
                params: {
                    query: symbol,
                },
            });

            if (!searchResponse.data || !searchResponse.data.coins || searchResponse.data.coins.length === 0) {
                logger.warn(`TokenInfoService::searchTokenBySymbol::No tokens found with symbol: ${symbol}`);
                return null;
            }

            const matchedToken = searchResponse.data.coins.find(
                (coin: any) => coin.symbol.toLowerCase() === symbol.toLowerCase()
            );

            if (!matchedToken) {
                logger.warn(`TokenInfoService::searchTokenBySymbol::No exact match found for symbol: ${symbol}`);
                return null;
            }

            const tokenId = matchedToken.id;
            const detailsResponse = await axios.get(`${this.baseUrl}/coins/${tokenId}`, {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                },
            });

            if (!detailsResponse.data) {
                logger.warn(`TokenInfoService::searchTokenBySymbol::Failed to get details for token: ${symbol}`);
                return null;
            }

            const tokenData = detailsResponse.data;
            const tokenInfo: TokenInfo = {
                id: tokenData.id,
                symbol: tokenData.symbol,
                name: tokenData.name,
                current_price: tokenData.market_data?.current_price?.usd,
                market_cap: tokenData.market_data?.market_cap?.usd,
                market_cap_rank: tokenData.market_cap_rank,
                total_volume: tokenData.market_data?.total_volume?.usd,
                price_change_24h: tokenData.market_data?.price_change_24h,
                price_change_percentage_24h: tokenData.market_data?.price_change_percentage_24h,
                description: tokenData.description,
                links: {
                    homepage: tokenData.links?.homepage,
                    blockchain_site: tokenData.links?.blockchain_site,
                    official_forum_url: tokenData.links?.official_forum_url,
                    twitter_screen_name: tokenData.links?.twitter_screen_name,
                    telegram_channel_identifier: tokenData.links?.telegram_channel_identifier,
                },
            };

            logger.info(`TokenInfoService::searchTokenBySymbol::Successfully retrieved information for token: ${symbol}`);
            return tokenInfo;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                logger.error(`TokenInfoService::searchTokenBySymbol::CoinGecko API error: ${error.response.status} - ${error.response.statusText}`);
            } else {
                logger.error(`TokenInfoService::searchTokenBySymbol::Error searching for token ${symbol}:`, error);
            }
            return null;
        }
    }
}

export default TokenInfoService;
