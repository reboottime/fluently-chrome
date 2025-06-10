import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { TranscriptsModule } from './transcripts/transcripts.module';
import { GrammarModule } from './grammar/grammar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    TranscriptsModule,
    GrammarModule,
  ],
})
export class AppModule {}
