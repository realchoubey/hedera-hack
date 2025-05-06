import { HCS10Client, HCS10MessageType, HCS10ResponseStatus } from '../index';
import dotenv from 'dotenv';
import { logger } from '../../utils/logger';

dotenv.config();

/**
 * Example of request-response pattern using the HCS-10 client
 */
async function runRequestResponseExample() {
  try {
    // Check for required environment variables
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
      throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in the .env file');
    }

    logger.info('Starting HCS-10 request-response example');

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
      'HCS-10 Request-Response Example Topic'
    );

    logger.info(`Created topic: ${topicId}`);

    // Add message handler for the "server" side
    client.addMessageHandler(topicId, async (message) => {
      logger.info(`Server received message: ${JSON.stringify(message)}`);

      // If it's a request, process it and send a response
      if (message.type === HCS10MessageType.REQUEST) {
        const request = message;
        
        if (request.responseRequired) {
          logger.info(`Server processing request: ${request.id}, action: ${request.payload.action}`);
          
          // Process different actions
          switch (request.payload.action) {
            case 'echo':
              // Echo the parameters back
              await client.sendResponse(
                topicId,
                request.id,
                HCS10ResponseStatus.SUCCESS,
                { echo: request.payload.parameters }
              );
              break;
              
            case 'add':
              // Add two numbers
              const { a, b } = request.payload.parameters || { a: 0, b: 0 };
              const sum = Number(a) + Number(b);
              
              await client.sendResponse(
                topicId,
                request.id,
                HCS10ResponseStatus.SUCCESS,
                { sum }
              );
              break;
              
            default:
              // Unknown action
              await client.sendResponse(
                topicId,
                request.id,
                HCS10ResponseStatus.FAILURE,
                undefined,
                { code: 'UNKNOWN_ACTION', message: `Unknown action: ${request.payload.action}` }
              );
              break;
          }
        }
      }
    });

    // Wait for the subscription to be active
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Send an echo request
    logger.info('Sending echo request...');
    const echoResponse = await client.sendRequest(
      topicId,
      'echo',
      { message: 'Hello, HCS-10!' }
    );

    logger.info(`Received echo response: ${JSON.stringify(echoResponse)}`);

    // Send an add request
    logger.info('Sending add request...');
    const addResponse = await client.sendRequest(
      topicId,
      'add',
      { a: 5, b: 7 }
    );

    logger.info(`Received add response: ${JSON.stringify(addResponse)}`);

    // Send an unknown action request
    logger.info('Sending unknown action request...');
    try {
      const unknownResponse = await client.sendRequest(
        topicId,
        'unknown',
        { foo: 'bar' }
      );
      
      logger.info(`Received unknown action response: ${JSON.stringify(unknownResponse)}`);
    } catch (error) {
      logger.error('Error with unknown action request:', error);
    }

    // Close the client
    client.close();
    
    logger.info('HCS-10 request-response example completed successfully');
  } catch (error) {
    logger.error('Error in HCS-10 request-response example:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runRequestResponseExample().catch(error => {
    logger.error('Unhandled error in HCS-10 request-response example:', error);
    process.exit(1);
  });
}

export { runRequestResponseExample };
