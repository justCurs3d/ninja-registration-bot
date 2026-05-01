import { Injectable } from '@nestjs/common';
@Injectable()
export class ConfigService {
    get botToken(): string {
        return process.env.BOT_TOKEN;
    }

    get adminPass(): string {
        return process.env.ADMIN_PASS;
    }

    get botSecretKey(): string {
        return process.env.SECRET_KEY;
    }

    get mongoUrl(): string {
        return process.env.MONGO_URL;
    }

    get wbApiUrl(): string {
        return process.env.WB_API_URL;
    }

    get olivirYandexToken(): string {
        return process.env.OLIVIR_YANDEX_TOKEN;
    }

    get mainYandexToken(): string {
        return process.env.MAIN_YANDEX_TOKEN;
    }
}
