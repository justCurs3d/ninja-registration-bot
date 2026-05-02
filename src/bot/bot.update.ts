import * as path from 'path';
import { Action, Ctx, InjectBot, Message, On, Start, Update } from 'nestjs-telegraf';
import { Input, Telegraf } from 'telegraf';
import { ChatState, Context } from './interfaces/context.interface';
import { ConfigService } from 'src/config/config.service';
import {
    aboutKeyboard,
    aboutMessage,
    nameMessage,
    ageMessage,
    startKeyboard,
    startMessage,
    referalSourceMessage,
    referalSourceKeyboard,
    loginMessage,
    passwordMessage,
    finalMessage,
    finalKeyboard,
} from './messages';
import { UsersService } from 'src/users/services/users.service';
import {
    validateAgeInput,
    validateLoginInput,
    validateNameInput,
    validatePasswordInput,
} from './validation/registration.validation';
import * as bcrypt from 'bcrypt';

const START_VIDEO_PATH = path.join(__dirname, '..', '..', 'resources', 'about_video.mp4');
const BCRYPT_ROUNDS = 12;

@Update()
export class BotUpdate {
    constructor(
        @InjectBot() private bot: Telegraf<Context>,
        private config: ConfigService,
        private usersService: UsersService,
    ) {}

    @Start()
    async onStart(@Ctx() ctx: Context) {
        ctx.session.chatState = ChatState.DEFAULT;
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
        const status = await ctx.reply('Собираю информацию об академии...');
        try {
            await ctx.sendChatAction('upload_video');
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

    @Action(/^referalSource_(.+)$/)
    async onReferalSource(@Ctx() ctx: Context) {
        await ctx.answerCbQuery();
        const source = ctx.match[1];
        await this.usersService.updateUser(ctx.session.registrationUserId, {
            referralSource: source,
        });
        ctx.session.chatState = ChatState.LOGIN;
        await ctx.reply(loginMessage);
    }

    @On('text')
    async onMessage(@Ctx() ctx: Context, @Message('text') message: string) {
        if (ctx.session.chatState === ChatState.NAME) {
            const {error, value} = validateNameInput(message);
            if (error) {
                await ctx.reply(error);
                return;
            }
            await this.usersService.updateUser(ctx.session.registrationUserId, {
                name: value,
            });
            ctx.session.chatState = ChatState.AGE;
            await ctx.reply(ageMessage(value));
            return;
        }

        if (ctx.session.chatState === ChatState.AGE) {
            const {error, value} = validateAgeInput(message);
            if (error) {
                await ctx.reply(error);
                return;
            }
            await this.usersService.updateUser(ctx.session.registrationUserId, {  
                age: value,
            });
            ctx.session.chatState = ChatState.REFERRAL_SOURCE;
            await ctx.reply(referalSourceMessage, referalSourceKeyboard);
            return;
        }

        if (ctx.session.chatState === ChatState.REFERRAL_SOURCE) {
            await ctx.reply('Выбери один из вариантов.');
            return;
        }

        if (ctx.session.chatState === ChatState.LOGIN) {
            const {error, value} = validateLoginInput(message);
            if (error) {
                await ctx.reply(error);
                return;
            }
            const existingUser = await this.usersService.getUserByLogin(value);
            if (existingUser) {
                await ctx.reply('Такой логин уже занят. Попробуй другой.');
                return;
            }
            await this.usersService.updateUser(ctx.session.registrationUserId, {
                login: value,
            });
            ctx.session.chatState = ChatState.PASSWORD;
            await ctx.reply(passwordMessage);
            return;
        }

        if (ctx.session.chatState === ChatState.PASSWORD) {
            const {error, value} = validatePasswordInput(message);
            if (error) {
                await ctx.reply(error);
                return;
            }

            const passwordHash = await bcrypt.hash(value, BCRYPT_ROUNDS);
            await this.usersService.updateUser(ctx.session.registrationUserId, {
                passwordHash,
            });

            const {name} = await this.usersService.getUserById(ctx.session.registrationUserId);
            ctx.session.chatState = ChatState.DEFAULT;
            await ctx.reply(finalMessage(name), finalKeyboard);
            return;
        }

        if (ctx.session.chatState === ChatState.DEFAULT) {
            await ctx.reply(startMessage, startKeyboard);
            return;
        }
    }
}
