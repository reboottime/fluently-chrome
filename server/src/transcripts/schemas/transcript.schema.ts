import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TranscriptDocument = Transcript & Document;

@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'transcripts',
  versionKey: false,
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
  textContent: string;

  @Prop({ required: false })
  speaker?: string;

  @Prop({ required: false })
  duration?: string;

  @Prop({ required: true })
  suggestedContent: string;

  @Prop({ required: false })
  explanation: string;

  @Prop({
    required: true,
    enum: ['processed', 'user_modified'],
    default: 'processed',
  })
  status: string;

  @Prop({
    required: false,
    default: false,
  })
  isBookmarked: boolean;
}

export const TranscriptSchema = SchemaFactory.createForClass(Transcript);

// Indexes
TranscriptSchema.index({ createdAt: -1 });
TranscriptSchema.index({ status: 1 });
TranscriptSchema.index({ sessionId: 1, index: 1 });
