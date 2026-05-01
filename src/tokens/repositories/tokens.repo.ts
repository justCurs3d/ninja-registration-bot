import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Tokens, TokensDocument } from '../schemas/tokens.schema';
import { Companies } from 'src/common/types/types';

@Injectable()
export class TokensRepository {
    constructor(@InjectModel(Tokens.name) private readonly tokensModel: Model<TokensDocument>) {}

    async findByCompany(company: Companies) {
        const { token } = await this.tokensModel.findOne({ company });
        return token;
    }

    async updateByCompany(company: Companies, newToken: string) {
        return this.tokensModel.findOneAndUpdate({ company }, { $set: { token: newToken } }, { upsert: true });
    }
}
