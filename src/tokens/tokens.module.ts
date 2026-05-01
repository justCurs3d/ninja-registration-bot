import { Module } from '@nestjs/common';
import { TokensService } from './services/tokens.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tokens, TokensSchema } from './schemas/tokens.schema';
import { TokensRepository } from './repositories/tokens.repo';

@Module({
    providers: [TokensService, TokensRepository],
    imports: [MongooseModule.forFeature([{ name: Tokens.name, schema: TokensSchema }])],
    exports: [TokensService],
})
export class TokensModule {}
