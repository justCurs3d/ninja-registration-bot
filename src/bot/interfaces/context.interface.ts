import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
    session: {
        chatState: ChatState;
        registrationUserId: number;
    };
}

export enum ChatState {
    NAME = 'NAME',
    AGE = 'AGE',
}
