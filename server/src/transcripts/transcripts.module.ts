import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TranscriptsService } from './transcripts.service';
import { TranscriptsController } from './transcripts.controller';
import { Transcript, TranscriptSchema } from './schemas/transcript.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transcript.name, schema: TranscriptSchema },
    ]),
  ],
  controllers: [TranscriptsController],
  providers: [TranscriptsService],
})
export class TranscriptsModule {}
