import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(`config/${process.env.NODE_ENV}.env`) });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
    await NestFactory.createApplicationContext(AppModule);
    console.info('Bot successfully started');
}
bootstrap();
