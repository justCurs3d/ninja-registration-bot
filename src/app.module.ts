import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { MongooseModule } from '@nestjs/mongoose';

export const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forRootAsync({
            useFactory: (appConfig: ConfigService) => ({
                uri: appConfig.mongoUrl,
            }),
            inject: [ConfigService],
        }),
        BotModule,
        TelegrafModule.forRootAsync({
            useFactory: (appConfig: ConfigService) => ({
                token: appConfig.botToken,
                include: [BotModule],
                middlewares: [sessions.middleware()],
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
