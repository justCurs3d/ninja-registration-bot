import { Markup } from "telegraf";

export const finalMessage = name => `Добро пожаловать в Академию, ${name}.

Переходи в приложение и введи логин и пароль, который ты придумал(-а).`;

export const finalKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Перейти в приложение', 'https://ninja-gold-quest.lovable.app/')],
]);