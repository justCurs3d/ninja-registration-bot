import { Module } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { YandexModule } from 'src/yandex/yandex.module';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';

@Module({
    providers: [PdfService],
    exports: [PdfService],
    imports: [YandexModule, RedisCacheModule],
})
export class PdfModule {}
