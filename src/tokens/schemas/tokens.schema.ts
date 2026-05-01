import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
    timestamps: true,
    versionKey: false,
    collection: 'tokens',
    toJSON: {
        transform: function (doc, returnedDoc) {
            delete returnedDoc._id;
            delete returnedDoc.createdAt;
            delete returnedDoc.updatedAt;
        },
    },
})
export class Tokens {
    @Prop({ type: String, required: true, unique: true, index: true })
    company: number;

    @Prop({ type: String, required: true })
    token: string;
}

export const TokensSchema = SchemaFactory.createForClass(Tokens);
export type TokensDocument = HydratedDocument<Tokens>;
