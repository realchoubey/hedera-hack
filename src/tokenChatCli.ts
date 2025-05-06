import readlineSync from 'readline-sync';
import dotenv from 'dotenv';
import { TokenInfoService } from './services/tokenInfoService';
import { OpenAIService } from './services/openaiService';
import { logger } from './utils/logger';

dotenv.config();


async function main() {
    console.log('\n=== Hedera Token Chat CLI ===');
    console.log('Ask questions about tokens using $SYMBOL format (e.g., $HBAR, $LOKY)');
    console.log('Type "exit" to quit\n');

    const tokenInfoService = new TokenInfoService();
    const openaiService = new OpenAIService();

    while (true) {
        const userInput = readlineSync.question('\nYour question: ');

        if (userInput.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            break;
        }

        const tokenSymbols = tokenInfoService.extractTokenSymbols(userInput);
        if (tokenSymbols.length === 0) {
            console.log('Please include a token symbol in your question (e.g., $HBAR, $LOKY)');
            continue;
        }

        console.log(`\nFetching information for token: ${tokenSymbols[0]}...`);

        try {

            const tokenInfo = await tokenInfoService.searchTokenBySymbol(tokenSymbols[0]);

            if (!tokenInfo) {
                console.log(`Sorry, I couldn't find information for the token ${tokenSymbols[0]}`);
                continue;
            }

            console.log('Getting response from OpenAI...');


            const response = await openaiService.getChatCompletion(userInput, tokenInfo);


            console.log('\n=== Response ===');
            console.log(response);
            console.log('================');
        } catch (error) {
            logger.error(`TokenChatCli::main::Error processing request:`, error);
            console.log('Sorry, there was an error processing your request. Please try again.');
        }
    }
}


main().catch(error => {
    logger.error(`TokenChatCli::main::Unhandled error:`, error);
    console.error('An unexpected error occurred:', error.message);
    process.exit(1);
});
