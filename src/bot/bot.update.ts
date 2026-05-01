import { Action, Command, Ctx, InjectBot, Message, On, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { ChatState, Context } from './interfaces/context.interface';
import { ConfigService } from 'src/config/config.service';
import { PdfService } from 'src/pdf/services/pdf.service';
import { WbService } from 'src/wb/services/wb.service';
import { Companies } from 'src/common/types/types';
import { TokensService } from 'src/tokens/services/tokens.service';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';

@Update()
export class BotUpdate {
    constructor(
        @InjectBot() private bot: Telegraf<Context>,
        private config: ConfigService,
        private pdfService: PdfService,
        private wbService: WbService,
        private tokensService: TokensService,
        private redisCache: RedisCacheService,
    ) {}

    @Start()
    async onStart(@Ctx() ctx: Context) {
        if (ctx.session.chatState !== ChatState.MAIN) {
            ctx.session.chatState = ChatState.AUTH;
            ctx.session.attemptsLeft = ctx.session.attemptsLeft ?? 3;
            return this.checkAttemptsLeft(ctx.session.attemptsLeft);
        } else {
            return 'Чтобы получить файл на печать, просто введите ID поставки.';
        }
    }

    @Command('change_token')
    async changeToken(@Ctx() ctx: Context) {
        ctx.session.chatState = ChatState.TOKEN_CHANGE_AUTH;
        return 'Для смены токена введите пароль администратора';
    }

    @Command('clear_cache')
    async initiateClearCache(@Ctx() ctx: Context) {
        ctx.session.chatState = ChatState.CLEAR_CACHE;
        return 'Для очистки кэша введите пароль администратора';
    }

    @Action(/^changeToken_(.+)$/)
    async changeTokenCompany(@Ctx() ctx: Context) {
        const company = ctx.match?.[1];
        ctx.session.companyToChange = company as Companies;
        ctx.session.chatState = ChatState.TOKEN_CHANGE_END;
        await ctx.reply('Введите новый токен');
    }

    @On('text')
    async onText(@Ctx() ctx: Context, @Message('text') message: string) {
        try {
            switch (ctx.session.chatState) {
                case ChatState.AUTH:
                    return this.tryAuth(ctx, message);

                case ChatState.MAIN:
                    await this.mainMessageHandler(ctx, message);
                    break;
                case ChatState.TOKEN_CHANGE_AUTH:
                    await this.tokenAuth(ctx, message);
                    break;
                case ChatState.TOKEN_CHANGE_END:
                    await this.updateToken(ctx, message);
                    break;
                case ChatState.CLEAR_CACHE:
                    await this.clearCache(ctx, message);
            }
        } catch (error) {
            ctx.reply(`Произошла ошибка: ${error.message}`);
        }
    }

    private async clearCache(ctx: Context, adminPassword: string) {
        if (adminPassword === this.config.adminPass) {
            ctx.session.chatState = ChatState.MAIN;
            await this.redisCache.clearCache();
            await ctx.reply('Кэш успешно очищен. Для формирования поставки введите ее ID.');
        } else {
            ctx.reply('Неверный пароль. Попробуйте еще раз.');
        }
    }

    private async updateToken(ctx: Context, newToken: string) {
        const company = ctx.session.companyToChange;
        await this.tokensService.updateToken(company, newToken);
        ctx.session.chatState = ChatState.MAIN;
        await ctx.reply('Токен успешно обновлен. Для формирования поставки введите ее ID.');
    }

    private tryAuth(ctx: Context, secretKey: string): string {
        if (ctx.session.attemptsLeft === 0)
            return 'Вы исчерпали количество попыток. Для возобновления доступа обратитесь к администратору бота.';

        if (secretKey === this.config.botSecretKey) {
            ctx.session.chatState = ChatState.MAIN;
            return 'Вы авторизованы.\nЧтобы получить файл на печать, просто введите ID поставки.';
        } else {
            ctx.session.attemptsLeft = ctx.session.attemptsLeft - 1;
            return this.rejectSecretKey(ctx.session.attemptsLeft);
        }
    }

    private async tokenAuth(ctx: Context, password: string) {
        if (password === this.config.adminPass) {
            ctx.session.chatState = ChatState.TOKEN_CHANGE_COMPANY;
            await this.bot.telegram.sendMessage(ctx.message.chat.id, 'Выберите компанию, которой хотите поменять токен', {
                reply_markup: {
                    inline_keyboard: Object.values(Companies).map((company) => [
                        { text: `${company}`, callback_data: `changeToken_${company}` },
                    ]),
                    resize_keyboard: true,
                },
            });
        } else {
            ctx.reply('Неверный пароль. Попробуйте еще раз.');
        }
    }

    private async mainMessageHandler(ctx: Context, message: string) {
        const { message_id } = await ctx.reply('Файл генерируется...');

        const sortedSupply = await this.wbService.getSortedSupply(message);
        // Генерируем PDF-файл
        const file = await this.pdfService.generateSupplyPdf(sortedSupply);
        // Заменяем сообщение на файл
        await ctx.telegram.editMessageMedia(ctx.chat.id, message_id, null, {
            type: 'document',
            media: { source: file, filename: `${message}.pdf` },
            caption: `Ваш файл готов! Количество заказов: ${sortedSupply.ordersLength}`,
        });
    }

    private checkAttemptsLeft(attemptsLeft: number): string {
        if (attemptsLeft > 0) return `Вы не авторизованы. Введите секретный ключ. Осталось попыток: ${attemptsLeft}.`;
        else {
            return 'Вы исчерпали количество попыток. Для возобновления доступа обратитесь к администратору бота.';
        }
    }

    private rejectSecretKey(attemptsLeft: number): string {
        if (attemptsLeft > 0) {
            return `Неверный секретный ключ. Попробуйте еще раз. Осталось попыток: ${attemptsLeft}.`;
        } else {
            return 'Вы исчерпали количество попыток. Для возобновления доступа обратитесь к администратору бота.';
        }
    }
}
