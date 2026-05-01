import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { PdfModule } from 'src/pdf/pdf.module';
import { WbModule } from 'src/wb/wb.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';

@Module({
    imports: [PdfModule, WbModule, TokensModule, RedisCacheModule],
    providers: [BotUpdate],
})
export class BotModule {}
