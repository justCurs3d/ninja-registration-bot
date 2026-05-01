import { Markup } from 'telegraf';

export const startMessage = `Приветствую в Академии Ниндзя 🥷🏻

Чем могу быть полезен?`;

/** Кнопки: поступление (регистрация) и рассказ об Академии */
export const startKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Хочу поступить в Академию', 'startRegistration')],
    [Markup.button.callback('Расскажи про Академию', 'about')],
]);