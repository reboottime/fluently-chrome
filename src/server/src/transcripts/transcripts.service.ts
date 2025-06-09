import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transcript, TranscriptDocument } from './schemas/transcript.schema';
import { CreateTranscriptDto } from './dto/create-transcript.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';
import { FilterTranscriptsDto } from './dto/filter-transcripts.dto';

@Injectable()
export class TranscriptsService {
  constructor(
    @InjectModel(Transcript.name)
    private transcriptModel: Model<TranscriptDocument>,
  ) {}

  async findAll(
    filterDto: FilterTranscriptsDto,
  ): Promise<TranscriptDocument[]> {
    const query: any = {};

    if (filterDto.sessionId) {
      query.sessionId = filterDto.sessionId;
    }

    if (filterDto.isBookmarked !== undefined) {
      query.isBookmarked = filterDto.isBookmarked;
    }

    return this.transcriptModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findByMessageHash(messageHash: string): Promise<TranscriptDocument> {
    const transcript = await this.transcriptModel
      .findOne({ messageHash })
      .exec();
    if (!transcript) {
      throw new NotFoundException('Transcript not found');
    }
    return transcript;
  }

  async create(
    createTranscriptDto: CreateTranscriptDto,
  ): Promise<TranscriptDocument> {
    const createdTranscript = new this.transcriptModel(createTranscriptDto);
    return createdTranscript.save();
  }

  async update(
    id: string,
    updateTranscriptDto: UpdateTranscriptDto,
  ): Promise<TranscriptDocument> {
    const updatedTranscript = await this.transcriptModel
      .findByIdAndUpdate(id, updateTranscriptDto, { new: true })
      .exec();
    if (!updatedTranscript) {
      throw new NotFoundException('Transcript not found');
    }
    return updatedTranscript;
  }
}
