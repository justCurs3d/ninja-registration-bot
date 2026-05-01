import { Ctx, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { ChatState, Context } from './interfaces/context.interface';
import { ConfigService } from 'src/config/config.service';

@Update()
export class BotUpdate {
    constructor(
        @InjectBot() private bot: Telegraf<Context>,
        private config: ConfigService,
    ) {}

    @Start()
    async onStart(@Ctx() ctx: Context) {
        return 'Hello World';
    }
}
