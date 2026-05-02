import { Markup } from "telegraf";

export const finalMessage = `Добро пожаловать в Академию, Имя.

Переходи в приложение и введи логин и пароль, который ты придумал(-а).`;

export const finalKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Перейти в приложение', 'https://google.com')],
]);