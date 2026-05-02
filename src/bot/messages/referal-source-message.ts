import { Markup } from "telegraf";

export const referalSourceMessage = `Как ты узнал(-а) о нашей Академии?`;

export const referalSourceKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Соц. сети', 'referalSource_social_networks')],
    [Markup.button.callback('От блогера', 'referalSource_blogger')],
    [Markup.button.callback('От друзей', 'referalSource_friends')],
    [Markup.button.callback('Поиск в сети', 'referalSource_search_in_network')],
    [Markup.button.callback('Другое', 'referalSource_other')],
]);