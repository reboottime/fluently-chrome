import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { TranscriptsService } from './transcripts.service';
import { CreateTranscriptDto } from './dto/create-transcript.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';
import { FilterTranscriptsDto } from './dto/filter-transcripts.dto';

@Controller('transcripts')
export class TranscriptsController {
  constructor(private readonly transcriptsService: TranscriptsService) {}

  @Get()
  async findAll(@Query() filterDto: FilterTranscriptsDto) {
    return await this.transcriptsService.findAll(filterDto);
  }

  @Get(':messageHash')
  async findByMessageHash(@Param('messageHash') messageHash: string) {
    try {
      return await this.transcriptsService.findByMessageHash(messageHash);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException({ error: 'Transcript not found' });
      }
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTranscriptDto: CreateTranscriptDto) {
    return await this.transcriptsService.create(createTranscriptDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTranscriptDto: UpdateTranscriptDto,
  ) {
    return await this.transcriptsService.update(id, updateTranscriptDto);
  }
}
