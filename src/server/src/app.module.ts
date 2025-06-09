import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { TranscriptsModule } from './transcripts/transcripts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available globally
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    TranscriptsModule,
  ],
})
export class AppModule {}
