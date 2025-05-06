import { HCS10Client, HCS10MessageType, HCS10ResponseStatus } from '../index';
import dotenv from 'dotenv';
import { logger } from '../../utils/logger';

dotenv.config();

/**
 * Basic example of using the HCS-10 client
 */
async function runBasicExample() {
  try {
    // Check for required environment variables
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
      throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in the .env file');
    }

    logger.info('Starting HCS-10 basic example');

    // Create client
    const client = new HCS10Client(
      'testnet',
      process.env.HEDERA_ACCOUNT_ID,
      process.env.HEDERA_PRIVATE_KEY
    );

    // Create topic
    const topicId = await client.createTopic(
      undefined,
      undefined,
      'HCS-10 Example Topic'
    );

    logger.info(`Created topic: ${topicId}`);

    // Add message handler
    client.addMessageHandler(topicId, async (message) => {
      logger.info(`Received message: ${JSON.stringify(message)}`);

      // If it's a request, send a response
      if (message.type === HCS10MessageType.REQUEST) {
        const request = message;
        
        if (request.responseRequired) {
          await client.sendResponse(
            topicId,
            request.id,
            HCS10ResponseStatus.SUCCESS,
            { message: 'Request processed successfully' }
          );
        }
      }
    });

    // Wait for the subscription to be active
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Send a request
    logger.info('Sending request...');
    const response = await client.sendRequest(
      topicId,
      'getInfo',
      { param1: 'value1', param2: 'value2' }
    );

    logger.info(`Received response: ${JSON.stringify(response)}`);

    // Close the client
    client.close();
    
    logger.info('HCS-10 basic example completed successfully');
  } catch (error) {
    logger.error('Error in HCS-10 basic example:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runBasicExample().catch(error => {
    logger.error('Unhandled error in HCS-10 basic example:', error);
    process.exit(1);
  });
}

export { runBasicExample };
