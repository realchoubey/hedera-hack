import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
import { TokenInfo } from '../utils/types';

dotenv.config();

export class OpenAIService {
    private openai: OpenAI;

    private isMockMode: boolean = false;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            logger.warn(`OpenAIService::constructor::OPENAI_API_KEY is not defined in the environment variables. Using mock mode.`);
            this.isMockMode = true;

            this.openai = new OpenAI({ apiKey: 'dummy-key' });
        } else {
            this.openai = new OpenAI({ apiKey });
        }
    }

    private formatTokenData(tokenData: TokenInfo): string {
        if (!tokenData) {
            return 'No token data available.';
        }
        let formattedData = `
Token Information:
- Name: ${tokenData.name} (${tokenData.symbol.toUpperCase()})
- Current Price: $${tokenData.current_price?.toFixed(6) || 'N/A'}
- Market Cap: $${tokenData.market_cap?.toLocaleString() || 'N/A'}
- Market Cap Rank: #${tokenData.market_cap_rank || 'N/A'}
- 24h Volume: $${tokenData.total_volume?.toLocaleString() || 'N/A'}
- 24h Price Change: ${tokenData.price_change_24h?.toFixed(6) || 'N/A'} (${tokenData.price_change_percentage_24h?.toFixed(2) || 'N/A'}%)
`;

        if (tokenData.description?.en) {

            const cleanDescription = tokenData.description.en
                .replace(/<[^>]*>/g, '')
                .substring(0, 500);
            formattedData += `\nDescription: ${cleanDescription}...\n`;
        }

        if (tokenData.links) {
            formattedData += '\nLinks:';
            if (tokenData.links.homepage && tokenData.links.homepage[0]) {
                formattedData += `\n- Website: ${tokenData.links.homepage[0]}`;
            }
            if (tokenData.links.blockchain_site && tokenData.links.blockchain_site[0]) {
                formattedData += `\n- Blockchain Explorer: ${tokenData.links.blockchain_site[0]}`;
            }
            if (tokenData.links.twitter_screen_name) {
                formattedData += `\n- Twitter: @${tokenData.links.twitter_screen_name}`;
            }
            if (tokenData.links.telegram_channel_identifier) {
                formattedData += `\n- Telegram: ${tokenData.links.telegram_channel_identifier}`;
            }
        }

        return formattedData;
    }


    public async getChatCompletion(userQuestion: string, tokenData: TokenInfo): Promise<string> {
        try {

            if (this.isMockMode) {
                logger.info(`OpenAIService::getChatCompletion::Using mock OpenAI chat completion`);


                const formattedTokenData = this.formatTokenData(tokenData);
                let mockResponse = `This is a mock response since no OpenAI API key is provided.\n\n`;
                mockResponse += `Based on the data for ${tokenData.name} (${tokenData.symbol.toUpperCase()}):\n`;

                if (tokenData.current_price) {
                    mockResponse += `- Current price: $${tokenData.current_price.toFixed(6)}\n`;
                }

                if (tokenData.market_cap) {
                    mockResponse += `- Market cap: $${tokenData.market_cap.toLocaleString()}\n`;
                }

                if (tokenData.price_change_percentage_24h) {
                    const changeDirection = tokenData.price_change_percentage_24h > 0 ? 'up' : 'down';
                    mockResponse += `- The price has gone ${changeDirection} by ${Math.abs(tokenData.price_change_percentage_24h).toFixed(2)}% in the last 24 hours.\n`;
                }

                mockResponse += `\nTo get actual AI-powered responses, please add your OpenAI API key to the .env file.`;


                await new Promise(resolve => setTimeout(resolve, 1000));

                return mockResponse;
            }


            logger.info(`OpenAIService::getChatCompletion::Calling OpenAI chat completion API`);

            const formattedTokenData = this.formatTokenData(tokenData);

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful assistant that provides information about cryptocurrency tokens.
            Use the provided token data to answer the user's question accurately.
            If the data doesn't contain the information needed to answer the question,
            say that you don't have that specific information.`
                    },
                    {
                        role: 'user',
                        content: `Here is information about a token:\n${formattedTokenData}\n\nUser question: ${userQuestion}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            if (response.choices && response.choices.length > 0 && response.choices[0].message) {
                logger.info(`OpenAIService::getChatCompletion::Successfully received response from OpenAI`);
                return response.choices[0].message.content || 'No response content';
            } else {
                logger.error(`OpenAIService::getChatCompletion::Invalid response format from OpenAI`);
                return 'Sorry, I could not generate a response at this time.';
            }
        } catch (error) {
            logger.error(`OpenAIService::getChatCompletion::Error calling OpenAI chat completion API:`, error);
            return 'Sorry, there was an error processing your request. Please try again later.';
        }
    }
}

export default OpenAIService;
