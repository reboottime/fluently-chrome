import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateTranscriptDto {
  @IsString()
  @IsNotEmpty()
  messageHash: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  originalContent: string;

  @IsString()
  @IsNotEmpty()
  improvedMessage: string;

  @IsString()
  @IsNotEmpty()
  explanation: string;

  @IsEnum(['processed', 'user_modified'])
  status: string;
}
