import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TranscriptDocument = Transcript & Document;

@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'transcripts',
})
export class Transcript {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  messageHash: string;

  @Prop({ required: true, index: true })
  sessionId: string;

  @Prop({ required: true })
  originalContent: string;

  @Prop({ required: true })
  improvedMessage: string;

  @Prop({ required: true })
  explanation: string;

  @Prop({
    required: true,
    enum: ['processed', 'user_modified'],
    default: 'processed',
  })
  status: string;
}

export const TranscriptSchema = SchemaFactory.createForClass(Transcript);

TranscriptSchema.index({ createdAt: -1 });
TranscriptSchema.index({ status: 1 });
