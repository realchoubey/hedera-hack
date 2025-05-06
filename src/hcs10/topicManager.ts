import {
    Client,
    PrivateKey,
    TopicCreateTransaction,
    TopicInfoQuery,
    TopicId,
    TopicMessageSubmitTransaction,
    TopicUpdateTransaction
} from '@hashgraph/sdk';
import { HCS10TopicInfo } from './types';
import { logger } from '../utils/logger';


export class TopicManager {
    private client: Client;
    private operatorId: string;
    private operatorKey: PrivateKey;

    constructor(client: Client, operatorId: string, operatorKey: PrivateKey) {
        this.client = client;
        this.operatorId = operatorId;
        this.operatorKey = operatorKey;
    }

    public async createTopic(
        adminKey?: PrivateKey,
        submitKey?: PrivateKey,
        memo?: string
    ): Promise<string> {
        try {
            logger.info(`TopicManager::createTopic::Creating new topic with memo: ${memo || 'none'}`);
            let transaction = new TopicCreateTransaction();
            if (adminKey) {
                transaction = transaction.setAdminKey(adminKey);
            }
            if (submitKey) {
                transaction = transaction.setSubmitKey(submitKey);
            }
            if (memo) {
                transaction = transaction.setTopicMemo(memo);
            }
            const txResponse = await transaction
                .execute(this.client);
            const receipt = await txResponse.getReceipt(this.client);
            const topicId = receipt.topicId!.toString();
            logger.info(`TopicManager::createTopic::Topic created successfully: ${topicId}`);
            return topicId;
        } catch (error) {
            logger.error(`TopicManager::createTopic::Error creating topic:`, error);
            throw error;
        }
    }

    public async getTopicInfo(topicId: string): Promise<HCS10TopicInfo> {
        try {
            logger.info(`TopicManager::getTopicInfo::Getting info for topic: ${topicId}`);
            const query = new TopicInfoQuery()
                .setTopicId(TopicId.fromString(topicId));
            const info = await query.execute(this.client);
            const topicInfo: HCS10TopicInfo = {
                topicId,
                memo: info.topicMemo,
                adminKey: info.adminKey?.toString(),
                submitKey: info.submitKey?.toString(),
                autoRenewAccountId: info.autoRenewAccountId?.toString(),
                autoRenewPeriod: info.autoRenewPeriod?.seconds.toNumber()
            };
            return topicInfo;
        } catch (error) {
            logger.error(`TopicManager::getTopicInfo::Error getting topic info:`, error);
            throw error;
        }
    }

    public async updateTopic(
        topicId: string,
        adminKey?: PrivateKey,
        submitKey?: PrivateKey,
        memo?: string
    ): Promise<boolean> {
        try {
            logger.info(`TopicManager::updateTopic::Updating topic: ${topicId}`)
            let transaction = new TopicUpdateTransaction()
                .setTopicId(TopicId.fromString(topicId));
            if (adminKey) {
                transaction = transaction.setAdminKey(adminKey);
            }
            if (submitKey) {
                transaction = transaction.setSubmitKey(submitKey);
            }
            if (memo) {
                transaction = transaction.setTopicMemo(memo);
            }
            const txResponse = await transaction
                .execute(this.client);
            await txResponse.getReceipt(this.client);
            logger.info(`TopicManager::updateTopic::Topic updated successfully: ${topicId}`);
            return true;
        } catch (error) {
            logger.error(`TopicManager::updateTopic::Error updating topic:`, error);
            throw error;
        }
    }

    public async submitMessage(topicId: string, message: string | Uint8Array, submitKey?: PrivateKey) {
        try {
            logger.info(`TopicManager::submitMessage::Submitting message to topic: ${topicId}`);
            let transaction = new TopicMessageSubmitTransaction()
                .setTopicId(TopicId.fromString(topicId));
            if (typeof message === 'string') {
                transaction = transaction.setMessage(message);
            } else {
                transaction = transaction.setMessage(message);
            }
            if (submitKey) {
                transaction = transaction.freezeWith(this.client);
                transaction = await transaction.sign(submitKey);

                const txResponse = await transaction
                    .execute(this.client);
                await txResponse.getReceipt(this.client);
                const transactionId = txResponse.transactionId.toString();
                logger.info(`TopicManager::submitMessage::Message submitted successfully: ${transactionId}`);

                return transactionId;
            }
        } catch (error) {
            logger.error(`TopicManager::submitMessage::Error submitting message:`, error);
            throw error;
        }
    }
}
