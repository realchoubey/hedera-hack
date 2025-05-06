import { connectToDatabase, disconnectFromDatabase } from './config/database';
import { TokenController } from './controllers/tokenController';
import { logger } from './utils/logger';

async function main(): Promise<void> {
    try {
        await connectToDatabase();
        const tokenController = new TokenController();
        logger.info('Starting to fetch Hedera ecosystem tokens from CoinGecko');
        await tokenController.fetchAndSaveTokens();

        const tokens = await tokenController.getAllTokens();
        logger.info(`Retrieved ${tokens.length} Hedera ecosystem tokens from database:`);
        tokens.forEach(token => {
            logger.info(`${token.name} (${token.symbol.toUpperCase()}) - $${token.current_price}`);
        });
        await disconnectFromDatabase();
        logger.info('Process completed successfully');
    } catch (error) {
        logger.error('An error occurred:', error);
        await disconnectFromDatabase();
        process.exit(1);
    }
}
main();
