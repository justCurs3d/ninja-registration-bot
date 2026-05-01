import { Module } from '@nestjs/common';
import { WbService } from './services/wb.service';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
    providers: [WbService],
    exports: [WbService],
    imports: [TokensModule],
})
export class WbModule {}
