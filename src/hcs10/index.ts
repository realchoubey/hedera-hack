// Export types
export * from './types';

// Export classes
export { HCS10Client } from './hcs10Client';
export { MessageService } from './messageService';
export { TopicManager } from './topicManager';

// Example usage
/*
import { HCS10Client, HCS10MessageType, HCS10ResponseStatus } from './hcs10';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Create client
  const client = new HCS10Client(
    'testnet',
    process.env.HEDERA_ACCOUNT_ID!,
    process.env.HEDERA_PRIVATE_KEY!
  );

  // Create topic
  const topicId = await client.createTopic(
    undefined,
    undefined,
    'HCS-10 Example Topic'
  );

  console.log(`Created topic: ${topicId}`);

  // Add message handler
  client.addMessageHandler(topicId, async (message) => {
    console.log(`Received message: ${JSON.stringify(message)}`);

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

  // Send a request
  const response = await client.sendRequest(
    topicId,
    'getInfo',
    { param1: 'value1', param2: 'value2' }
  );

  console.log(`Received response: ${JSON.stringify(response)}`);

  // Close the client
  client.close();
}

main().catch(console.error);
*/
