import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const USER_ID_COUNTER_KEY = 'userId';

@Schema({ collection: 'counters' })
export class Counter {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ type: Number, default: 0 })
    seq: number;
}

export type CounterDocument = HydratedDocument<Counter>;
export const CounterSchema = SchemaFactory.createForClass(Counter);
