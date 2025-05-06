export interface HCS10Message {
    id: string;
    timestamp: string;
    topicId: string;
    sender: string;
    type: HCS10MessageType;
    payload: any;
}


export enum HCS10MessageType {
    REQUEST = 'REQUEST',
    RESPONSE = 'RESPONSE',
    NOTIFICATION = 'NOTIFICATION',
    ERROR = 'ERROR'
}


export interface HCS10Request extends HCS10Message {
    type: HCS10MessageType.REQUEST;
    responseRequired: boolean;
    payload: {
        action: string;
        parameters?: Record<string, any>;
    };
}


export interface HCS10Response extends HCS10Message {
    type: HCS10MessageType.RESPONSE;
    correlationId: string;
    payload: {
        status: HCS10ResponseStatus;
        result?: any;
        error?: {
            code: string;
            message: string;
        };
    };
}


export enum HCS10ResponseStatus {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE'
}


export interface HCS10Notification extends HCS10Message {
    type: HCS10MessageType.NOTIFICATION;
    payload: {
        event: string;
        data: any;
    };
}


export interface HCS10Error extends HCS10Message {
    type: HCS10MessageType.ERROR;
    correlationId?: string;
    payload: {
        code: string;
        message: string;
        details?: any;
    };
}


export interface HCS10TopicInfo {
    topicId: string;
    adminKey?: string;
    submitKey?: string;
    memo?: string;
    autoRenewAccountId?: string;
    autoRenewPeriod?: number;
}


export type HCS10MessageHandler = (message: HCS10Message) => Promise<void>;
