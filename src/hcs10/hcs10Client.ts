import {
    Client,
    AccountId,
    PrivateKey
} from '@hashgraph/sdk';
import {
    HCS10MessageHandler,
    HCS10MessageType,
    HCS10Request,
    HCS10Response,
    HCS10ResponseStatus,
    HCS10TopicInfo
} from './types';
import { MessageService } from './messageService';
import { TopicManager } from './topicManager';
import { logger } from '../utils/logger';

export class HCS10Client {
    private client: Client;
    private operatorId: string;
    private operatorKey: PrivateKey;
    private messageService: MessageService;
    private subscriptions: Map<string, string>;

    constructor(
        networkName: string,
        operatorId: string,
        operatorKey: string,
        requestTimeout: number = 30000
    ) {

        this.client = Client.forName(networkName);
        this.operatorId = operatorId;
        this.operatorKey = PrivateKey.fromString(operatorKey);
        this.client.setOperator(
            AccountId.fromString(operatorId),
            this.operatorKey
        );
        this.messageService = new MessageService(
            this.client,
            this.operatorId,
            this.operatorKey,
            requestTimeout
        );

        this.subscriptions = new Map<string, string>();
        logger.info(`HCS10Client::constructor::Initialized client for network: ${networkName}, operator: ${operatorId}`);
    }

    public getTopicManager(): TopicManager {
        return this.messageService.getTopicManager();
    }

    public async createTopic(
        adminKey?: string,
        submitKey?: string,
        memo?: string,
        autoSubscribe: boolean = true
    ): Promise<string> {
        try {
            logger.info(`HCS10Client::createTopic::Creating new topic with memo: ${memo || 'none'}`);
            const adminKeyObj = adminKey ? PrivateKey.fromString(adminKey) : undefined;
            const submitKeyObj = submitKey ? PrivateKey.fromString(submitKey) : undefined;
            const topicId = await this.getTopicManager().createTopic(adminKeyObj, submitKeyObj, memo);
            if (autoSubscribe) {
                await this.subscribeTopic(topicId);
            }

            return topicId;
        } catch (error) {
            logger.error(`HCS10Client::createTopic::Error creating topic:`, error);
            throw error;
        }
    }

    public async getTopicInfo(topicId: string): Promise<HCS10TopicInfo> {
        try {
            logger.info(`HCS10Client::getTopicInfo::Getting info for topic: ${topicId}`);
            return await this.getTopicManager().getTopicInfo(topicId);
        } catch (error) {
            logger.error(`HCS10Client::getTopicInfo::Error getting topic info:`, error);
            throw error;
        }
    }

    public async updateTopic(topicId: string, adminKey?: string, submitKey?: string, memo?: string): Promise<boolean> {
        try {
            logger.info(`HCS10Client::updateTopic::Updating topic: ${topicId}`);
            const adminKeyObj = adminKey ? PrivateKey.fromString(adminKey) : undefined;
            const submitKeyObj = submitKey ? PrivateKey.fromString(submitKey) : undefined;
            return await this.getTopicManager().updateTopic(
                topicId,
                adminKeyObj,
                submitKeyObj,
                memo
            );
        } catch (error) {
            logger.error(`HCS10Client::updateTopic::Error updating topic:`, error);
            throw error;
        }
    }

    public async subscribeTopic(topicId: string, startTime?: Date): Promise<string> {
        try {
            logger.info(`HCS10Client::subscribeTopic::Subscribing to topic: ${topicId}`);

            // Subscribe to the topic
            const subscriptionId = await this.messageService.subscribeToTopic(topicId, startTime);

            // Store the subscription
            this.subscriptions.set(topicId, subscriptionId);

            return subscriptionId;
        } catch (error) {
            logger.error(`HCS10Client::subscribeTopic::Error subscribing to topic:`, error);
            throw error;
        }
    }

    public addMessageHandler(topicId: string, handler: HCS10MessageHandler): void {
        logger.info(`HCS10Client::addMessageHandler::Adding message handler for topic: ${topicId}`);
        this.messageService.addMessageHandler(topicId, handler);
    }

    public removeMessageHandler(topicId: string, handler: HCS10MessageHandler): boolean {
        logger.info(`HCS10Client::removeMessageHandler::Removing message handler for topic: ${topicId}`);
        return this.messageService.removeMessageHandler(topicId, handler);
    }

    public async sendRequest(
        topicId: string,
        action: string,
        parameters?: Record<string, any>,
        responseRequired: boolean = true,
        submitKey?: string
    ): Promise<HCS10Response | HCS10Request> {
        try {
            logger.info(`HCS10Client::sendRequest::Sending request to topic: ${topicId}, action: ${action}`);

            // Convert submit key if provided
            const submitKeyObj = submitKey ? PrivateKey.fromString(submitKey) : undefined;

            return await this.messageService.sendRequest(
                topicId,
                action,
                parameters,
                responseRequired,
                submitKeyObj
            );
        } catch (error) {
            logger.error(`HCS10Client::sendRequest::Error sending request:`, error);
            throw error;
        }
    }

    public async sendResponse(
        topicId: string,
        requestId: string,
        status: HCS10ResponseStatus,
        result?: any,
        error?: { code: string, message: string },
        submitKey?: string
    ): Promise<string> {
        try {
            logger.info(`HCS10Client::sendResponse::Sending response to topic: ${topicId}, request: ${requestId}`);

            // Convert submit key if provided
            const submitKeyObj = submitKey ? PrivateKey.fromString(submitKey) : undefined;

            return await this.messageService.sendResponse(
                topicId,
                requestId,
                status,
                result,
                error,
                submitKeyObj
            );
        } catch (error) {
            logger.error(`HCS10Client::sendResponse::Error sending response:`, error);
            throw error;
        }
    }

    public close(): void {
        logger.info(`HCS10Client::close::Closing client`);
        this.client.close();
    }
}
