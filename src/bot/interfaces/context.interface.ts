import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
    session: {
        chatState: ChatState;
        registrationUserId: number;
        
    };

    match?: string[];
}

export enum ChatState {
    NAME = 'NAME',
    AGE = 'AGE',
    REFERRAL_SOURCE = 'REFERRAL_SOURCE',
    LOGIN = 'LOGIN',
    PASSWORD = 'PASSWORD',
    DEFAULT = 'DEFAULT',
}
