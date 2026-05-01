import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({type: Number, required: true, unique: true})
    id: number;
    
    @Prop({type: Number, required: true})
    telegramId: number;

    @Prop({type: String})
    telegramUsername: string;

    @Prop({type: String})
    name: string;

    @Prop({type: Number})
    age: number;

    @Prop({type: String})
    referralSource: string;

    @Prop({ type: String })
    login: string;

    @Prop({type: String})
    passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
