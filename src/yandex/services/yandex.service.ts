import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { createCanvas } from 'canvas';
import { Companies } from 'src/common/types/types';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class YandexService {
    private axiosInstance: AxiosInstance;

    constructor(private config: ConfigService) {
        this.axiosInstance = axios.create();
    }

    async downloadBarcodeImage(currentCompany: string, article: string, isOlivir: boolean = false) {
        try {
            const path = `${currentCompany}/${currentCompany === Companies.Economy ? this.removeNonDigits(article) : article}.jpeg`;
            const downloadLink = await this.getDownloadLink(path, isOlivir);

            const barcodeImage = await this.axiosInstance
                .get(downloadLink, { responseType: 'arraybuffer' })
                .then((res) => res.data);

            return Buffer.from(barcodeImage, 'binary');
        } catch (error) {
            console.log('Произошла ошибка при запросе ШК у Яндекса');
            console.log('Произошла ошибка при запросе ШК у Яндекса:', error.message);

            // Создание белой картинки с текстом
            const width = 1280;
            const height = 900;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Белый фон
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);

            // Текст по центру
            ctx.fillStyle = '#000000';
            ctx.font = '60px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const imageText = `Произошла ошибка при запросе ШК\nиз Яндекс Диска\nАртикул товара:${article}`;
            ctx.fillText(imageText, width / 2, height / 2);

            return canvas.toBuffer('image/png');
        }
    }

    private removeNonDigits(str: string) {
        return str.replace(/\D/g, '');
    }

    private async getDownloadLink(path: string, isOlivir: boolean): Promise<string> {
        const url = `https://cloud-api.yandex.net/v1/disk/resources/download?path=${path}`;
        const downloadLink = await axios
            .get(url, {
                headers: {
                    Authorization: `OAuth ${isOlivir ? this.config.olivirYandexToken : this.config.mainYandexToken}`,
                },
            })
            .then((res) => res.data.href);

        return downloadLink;
    }
}
