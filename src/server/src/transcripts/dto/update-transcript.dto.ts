import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateTranscriptDto {
  @IsString()
  @IsOptional()
  improvedMessage?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsEnum(['processed', 'user_modified'])
  @IsOptional()
  status?: string;
}
