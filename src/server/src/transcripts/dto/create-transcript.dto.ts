import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateTranscriptDto {
  @IsString()
  @IsNotEmpty()
  messageHash: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  textContent: string;

  @IsString()
  @IsOptional()
  speaker?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsNotEmpty()
  suggestedContent: string;

  @IsString()
  @IsNotEmpty()
  explanation: string;

  @IsEnum(['processed', 'user_modified'])
  status: string;
}
