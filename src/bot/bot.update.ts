import * as path from 'path';
import { Action, Ctx, InjectBot, Message, On, Start, Update } from 'nestjs-telegraf';
import { Input, Telegraf } from 'telegraf';
import { ChatState, Context } from './interfaces/context.interface';
import { ConfigService } from 'src/config/config.service';
import { aboutKeyboard, aboutMessage, nameMessage, ageMessage, startKeyboard, startMessage } from './messages';
import { UsersService } from 'src/users/services/users.service';

const START_VIDEO_PATH = path.join(__dirname, '..', '..', 'resources', 'about_video.mp4');

@Update()
export class BotUpdate {
    constructor(
        @InjectBot() private bot: Telegraf<Context>,
        private config: ConfigService,
        private usersService: UsersService,
    ) {}

    @Start()
    async onStart(@Ctx() ctx: Context) {
        await ctx.reply(startMessage, startKeyboard);
    }

    @Action('startRegistration')
    async onStartRegistration(@Ctx() ctx: Context) {
        await ctx.answerCbQuery();
        const { id } = await this.usersService.createUser({
            telegramId: ctx.chat.id,
            telegramUsername: ctx.from.username,
        });
        ctx.session.chatState = ChatState.NAME;
        ctx.session.registrationUserId = id;
        await ctx.reply(nameMessage);
    }

    @Action('about')
    async onAbout(@Ctx() ctx: Context) {
        await ctx.answerCbQuery();
        const status = await ctx.reply('Собираем информацию об академии...');
        try {
            await ctx.sendChatAction('upload_video');
            console.log(ctx);
            await ctx.replyWithVideo(Input.fromLocalFile(START_VIDEO_PATH), {
                caption: aboutMessage,
                ...aboutKeyboard,
            });
        } finally {
            if (ctx.chat) {
                await ctx.telegram.deleteMessage(ctx.chat.id, status.message_id).catch(() => undefined);
            }
        }
    }

    @On('text')
    async onMessage(@Ctx() ctx: Context, @Message('text') message: string) {
        if (ctx.session.chatState === ChatState.NAME) {
            await this.usersService.updateUser(ctx.session.registrationUserId, {
                name: message,
            });
            ctx.session.chatState = ChatState.AGE;
            await ctx.reply(ageMessage);
            return;
        }
    }
}
