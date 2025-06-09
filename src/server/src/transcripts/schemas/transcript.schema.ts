import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TranscriptDocument = Transcript & Document;

@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'notes',
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

  @Prop({ required: true })
  explanation: string;

  @Prop({
    required: true,
    enum: ['processed', 'user_modified'],
    default: 'processed',
  })
  status: string;
}

export const NoteSchema = SchemaFactory.createForClass(Transcript);

// Indexes
NoteSchema.index({ createdAt: -1 });
NoteSchema.index({ status: 1 });
NoteSchema.index({ sessionId: 1, index: 1 });