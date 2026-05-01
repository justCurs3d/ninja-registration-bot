import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './services/users.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Counter.name, schema: CounterSchema },
        ]),
    ],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
