import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { PdfModule } from './pdf/pdf.module';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { WbModule } from './wb/wb.module';
import { YandexModule } from './yandex/yandex.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TokensModule } from './tokens/tokens.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisCacheModule } from './redis-cache/redis-cache.module';

export const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
    imports: [
        ConfigModule,
        // MongooseModule.forRootAsync({
        //     useFactory: (appConfig: ConfigService) => ({
        //         uri: appConfig.mongoUrl,
        //     }),
        //     inject: [ConfigService],
        // }),
        BotModule,
        TelegrafModule.forRootAsync({
            useFactory: (appConfig: ConfigService) => ({
                token: appConfig.botToken,
                include: [BotModule],
                middlewares: [sessions.middleware()],
            }),
            inject: [ConfigService],
        }),
        PdfModule,
        WbModule,
        YandexModule,
        TokensModule,
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => ({
                store: await redisStore({
                    host: 'redis', // или 'redis', если Nest работает в том же docker-compose
                    port: 6379,
                    ttl: 0, // бессрочно
                }),
            }),
        }),
        RedisCacheModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
