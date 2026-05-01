import { Companies } from 'src/common/types/types';
import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
    session: {
        chatState: ChatState;
        attemptsLeft: number;
        companyToChange: Companies;
    };

    match?: string[];
}

export enum ChatState {
    'AUTH' = 'AUTH',
    'MAIN' = 'MAIN',
    'TOKEN_CHANGE_AUTH' = 'TOKEN_CHANGE_AUTH',
    'TOKEN_CHANGE_START' = 'TOKEN_CHANGE_START',
    'TOKEN_CHANGE_COMPANY' = 'TOKEN_CHANGE_COMPANY',
    'TOKEN_CHANGE_END' = 'TOKEN_CHANGE_END',
    'CLEAR_CACHE' = 'CLEAR_CACHE',
}
