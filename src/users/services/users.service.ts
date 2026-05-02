import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Counter,
    CounterDocument,
    USER_ID_COUNTER_KEY,
} from '../schemas/counter.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Counter.name)
        private readonly counterModel: Model<CounterDocument>,
    ) {}

    async createUser(user: Partial<User>): Promise<UserDocument> {
        const id = await this.nextUserId();
        const newUser = await this.userModel.create({ ...user, id });
        return newUser;
    }

    /** Атомарный счётчик: первый пользователь получит id === 1 */
    private async nextUserId(): Promise<number> {
        const counter = await this.counterModel
            .findOneAndUpdate(
                { _id: USER_ID_COUNTER_KEY },
                { $inc: { seq: 1 } },
                { returnDocument: 'after', upsert: true },
            )
            .exec();
        return counter!.seq;
    }

    async updateUser(id: number, user: Partial<User>): Promise<UserDocument> {
        const updatedUser = await this.userModel.findOneAndUpdate({ id }, user, { returnDocument: 'after' });
        return updatedUser;
    }

    async getUserById(id: number): Promise<UserDocument> {
        const user = await this.userModel.findOne({ id });
        return user;
    }

    async getUserByLogin(login: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ login });
        return user;
    }
}
