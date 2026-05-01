import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
      ) {}
    
      // Кэширование файла (например, изображения)
      async cacheImage(key: string, buffer: Buffer) {
        await this.cacheManager.set(key, buffer); // без TTL — хранится бессрочно
      }
    
      // Получение файла из кэша
      async getCachedImage(key: string): Promise<Buffer | null> {
        return this.cacheManager.get<Buffer>(key);
      }
        
      // Очистка ВСЕГО кэша
      async clearCache() {
        await this.cacheManager.clear();
      }
}
