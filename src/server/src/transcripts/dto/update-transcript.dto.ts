import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
export class UpdateTranscriptDto {
  @IsString()
  @IsOptional()
  suggestedContent?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsEnum(['processed', 'user_modified'])
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  isBookmarked?: boolean;
}
