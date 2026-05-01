import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
    session: {
        chatState: ChatState;
    };
}

export enum ChatState {}
