import {
    Client,
    PrivateKey,
    TopicId,
    TopicMessageQuery,
    TopicMessage
} from '@hashgraph/sdk';
import { v4 as uuidv4 } from 'uuid';
import {
    HCS10Message,
    HCS10MessageHandler,
    HCS10MessageType,
    HCS10Request,
    HCS10Response,
    HCS10ResponseStatus
} from './types';
import { TopicManager } from './topicManager';
import { logger } from '../utils/logger';

export class MessageService {
    private client: Client;
    private operatorId: string;
    private operatorKey: PrivateKey;
    private topicManager: TopicManager;
    private messageHandlers: Map<string, HCS10MessageHandler[]>;
    private pendingRequests: Map<string, {
        resolve: (response: HCS10Response) => void,
        reject: (error: any) => void,
        timeout: NodeJS.Timeout
    }>;
    private requestTimeout: number;

    constructor(
        client: Client,
        operatorId: string,
        operatorKey: PrivateKey,
        requestTimeout: number = 30000
    ) {
        this.client = client;
        this.operatorId = operatorId;
        this.operatorKey = operatorKey;
        this.topicManager = new TopicManager(client, operatorId, operatorKey);
        this.messageHandlers = new Map<string, HCS10MessageHandler[]>();
        this.pendingRequests = new Map();
        this.requestTimeout = requestTimeout;
    }

    public getTopicManager(): TopicManager {
        return this.topicManager;
    }

    public async subscribeToTopic(topicId: string, startTime?: Date): Promise<string> {
        try {
            logger.info(`MessageService::subscribeToTopic::Subscribing to topic: ${topicId}`);
            let query = new TopicMessageQuery()
                .setTopicId(TopicId.fromString(topicId));
            if (startTime) {
                query = query.setStartTime(startTime);
            }
            const subscriptionId = uuidv4();
            query.subscribe(
                this.client,
                (message) => this.handleTopicMessage(message, subscriptionId)
            );
            logger.info(`MessageService::subscribeToTopic::Subscribed to topic: ${topicId}, subscription ID: ${subscriptionId}`);
            return subscriptionId;
        } catch (error) {
            logger.error(`MessageService::subscribeToTopic::Error subscribing to topic:`, error);
            throw error;
        }
    }

    private async handleTopicMessage(message: TopicMessage, subscriptionId: string): Promise<void> {
        try {
            const messageContent = message.contents.toString();
            logger.info(`MessageService::handleTopicMessage::Received message on subscription ${subscriptionId}: ${messageContent.substring(0, 100)}...`);
            const hcs10Message = JSON.parse(messageContent) as HCS10Message;
            if (hcs10Message.type === HCS10MessageType.RESPONSE) {
                const response = hcs10Message as HCS10Response;
                const pendingRequest = this.pendingRequests.get(response.correlationId);
                if (pendingRequest) {
                    clearTimeout(pendingRequest.timeout);
                    pendingRequest.resolve(response);
                    this.pendingRequests.delete(response.correlationId);
                    logger.info(`MessageService::handleTopicMessage::Resolved pending request: ${response.correlationId}`);
                }
            }
            const handlers = this.messageHandlers.get(hcs10Message.topicId) || [];
            for (const handler of handlers) {
                await handler(hcs10Message);
            }
        } catch (error) {
            logger.error(`MessageService::handleTopicMessage::Error handling topic message:`, error);
        }
    }

    public addMessageHandler(topicId: string, handler: HCS10MessageHandler): void {
        logger.info(`MessageService::addMessageHandler::Adding message handler for topic: ${topicId}`);
        const handlers = this.messageHandlers.get(topicId) || [];
        handlers.push(handler);
        this.messageHandlers.set(topicId, handlers);
    }

    public removeMessageHandler(topicId: string, handler: HCS10MessageHandler): boolean {
        logger.info(`MessageService::removeMessageHandler::Removing message handler for topic: ${topicId}`);
        const handlers = this.messageHandlers.get(topicId) || [];
        const index = handlers.indexOf(handler);
        if (index !== -1) {
            handlers.splice(index, 1);
            this.messageHandlers.set(topicId, handlers);
            return true;
        }
        return false;
    }

    public async sendRequest(
        topicId: string,
        action: string,
        parameters?: Record<string, any>,
        responseRequired: boolean = true,
        submitKey?: PrivateKey
    ): Promise<HCS10Response | HCS10Request> {
        try {
            logger.info(`MessageService::sendRequest::Sending request to topic: ${topicId}, action: ${action}`);

            const requestId = uuidv4();
            const request: HCS10Request = {
                id: requestId,
                timestamp: new Date().toISOString(),
                topicId,
                sender: this.operatorId,
                type: HCS10MessageType.REQUEST,
                responseRequired,
                payload: {
                    action,
                    parameters
                }
            };
            await this.topicManager.submitMessage(topicId,JSON.stringify(request),submitKey);
            logger.info(`MessageService::sendRequest::Request sent: ${requestId}`);
            if (!responseRequired) {
                return request;
            }

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.pendingRequests.delete(requestId);
                    reject(new Error(`Request timed out after ${this.requestTimeout}ms: ${requestId}`));
                }, this.requestTimeout);
                this.pendingRequests.set(requestId, { resolve, reject, timeout });
            });
        } catch (error) {
            logger.error(`MessageService::sendRequest::Error sending request:`, error);
            throw error;
        }
    }

    public async sendResponse(
        topicId: string,
        requestId: string,
        status: HCS10ResponseStatus,
        result?: any,
        error?: { code: string, message: string },
        submitKey?: PrivateKey
    ): Promise<string> {
        try {
            logger.info(`MessageService::sendResponse::Sending response to topic: ${topicId}, request: ${requestId}`);
            const response: HCS10Response = {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                topicId,
                sender: this.operatorId,
                type: HCS10MessageType.RESPONSE,
                correlationId: requestId,
                payload: {
                    status,
                    result,
                    error
                }
            };
            const transactionId = await this.topicManager.submitMessage(
                topicId,
                JSON.stringify(response),
                submitKey
            );
            logger.info(`MessageService::sendResponse::Response sent: ${response.id}, transaction: ${transactionId}`);
            return transactionId;
        } catch (error) {
            logger.error(`MessageService::sendResponse::Error sending response:`, error);
            throw error;
        }
    }
}
