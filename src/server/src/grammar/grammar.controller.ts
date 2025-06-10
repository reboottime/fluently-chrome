import { Controller, Post, Body } from '@nestjs/common';
import { GrammarService } from './grammar.service';

@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Post('correct')
  async correctGrammar(@Body() body: { text: string }) {
    return this.grammarService.correctGrammar(body.text);
  }
}
