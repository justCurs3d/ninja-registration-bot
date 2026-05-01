import { Injectable } from '@nestjs/common';
@Injectable()
export class ConfigService {
    get botToken(): string {
        return process.env.BOT_TOKEN;
    }

    get mongoUrl(): string {
        return process.env.MONGO_URL;
    }
}
