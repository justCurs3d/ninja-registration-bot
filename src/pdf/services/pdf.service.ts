import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Companies, SortedSupply } from 'src/common/types/types';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { YandexService } from 'src/yandex/services/yandex.service';

@Injectable()
export class PdfService {
    constructor(
        private yandexService: YandexService,
        private redisCache: RedisCacheService,
    ) {}
    //TODO: Осталось только добавить штрих-коды
    async generateSupplyPdf(sortedSupply: SortedSupply): Promise<Buffer> {
        const startTime = Date.now();
        const doc = new PDFDocument({
            size: [164.57, 113.39], // 58 мм x 40 мм
            margins: { left: 0, bottom: 0, right: 0, top: 0 },
            autoFirstPage: false,
        });

        const buffers: Buffer[] = [];

        // Подключаем сбор данных в буфер
        doc.on('data', (data) => buffers.push(data));

        const endPromise = new Promise<Buffer>((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
        });

        const barcodeImages: Record<number, Buffer> = {};
        const uniqueArticles = Array.from(new Set(sortedSupply.combinedOrders.map((order) => order.article)));
        await Promise.all(
            uniqueArticles.map(async (article) => {
                const barcodeImage = await this.getBarcodeImage(sortedSupply, article);
                barcodeImages[article] = barcodeImage;
            }),
        );
        const BcTime = Date.now();
        console.log(`Баркоды скачаны - ${BcTime - startTime}`);
        // Асинхронная генерация страниц
        for (const order of sortedSupply.combinedOrders) {
            // Добавляем страницу с ШК
            doc.addPage();
            const barcodeImage = barcodeImages[order.article];

            doc.image(barcodeImage, {
                fit: [164.57, 113.39],
                align: 'center',
                valign: 'center',
            });

            // Добавляем страницу с QR-кодом
            doc.addPage();
            const qrImage = Buffer.from(order.qr, 'base64');
            doc.image(qrImage, {
                fit: [164.57, 113.39],
                align: 'center',
                valign: 'center',
            });
        }

        if (sortedSupply.mainQrCode) {
            doc.addPage();
            const qrImage = Buffer.from(sortedSupply.mainQrCode, 'base64');
            doc.image(qrImage, {
                fit: [164.57, 113.39],
                align: 'center',
                valign: 'center',
            });
        }

        // Завершаем документ
        doc.end();
        console.log(`Документ сформирован - ${Date.now() - BcTime}`);
        // Ожидаем завершения потока
        return endPromise;
    }

    private async getBarcodeImage(sortedSupply: SortedSupply, article: string) {
        const key = `${sortedSupply.currentCompany}_${article}`;
        const cachedImage = await this.redisCache.getCachedImage(key);
        if (cachedImage) return cachedImage;

        const image = await this.yandexService.downloadBarcodeImage(
            sortedSupply.currentCompany,
            article,
            sortedSupply.currentCompany === Companies.Olivir,
        );
        await this.redisCache.cacheImage(key, image);
        return image;
    }
}
