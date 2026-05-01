import { Injectable } from '@nestjs/common';
import { TokensRepository } from '../repositories/tokens.repo';
import { Companies } from 'src/common/types/types';

@Injectable()
export class TokensService {
    constructor(private tokensRepo: TokensRepository) {}

    async getToken(company: Companies): Promise<string> {
        return await this.tokensRepo.findByCompany(company);
    }

    async updateToken(company: Companies, newToken: string) {
        return await this.tokensRepo.updateByCompany(company, newToken);
    }
}
