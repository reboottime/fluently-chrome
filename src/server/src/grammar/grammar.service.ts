import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom, throwError } from 'rxjs';

@Injectable()
export class GrammarService {
  private readonly anthropicApiUrl = 'https://api.anthropic.com/v1/messages';

  constructor(private readonly httpService: HttpService) {}

  async correctGrammar(text: string) {
    const systemPrompt = `You are helping improve spoken English for better fluency and naturalness. 
Context: User practices with BoldVoice (accent reduction) and Fluently (spoken English evaluation) daily.
Goal: Improve natural and fluent level in spoken English so people understand better.
Style: Concise and direct communication.
Respond ONLY in valid JSON format with these two fields:
- "suggestedContent": the improved version of the sentence
- "explanation": brief explanation of what was improved and why within 20 words.
Be concise and direct in your explanations.`;

    const headers = {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    };

    const payload = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: systemPrompt, // Move system prompt here as top-level parameter
      messages: [
        {
          role: 'user',
          content: `Improve this spoken English sentence: "${text}"`,
        },
      ],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.anthropicApiUrl, payload, { headers }).pipe(
          map((response) => response.data),
          catchError(({ response }) => {
            const status = response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
            const message =
              response?.data?.error?.message || 'Claude API error';
            return throwError(() => new HttpException(message, status));
          }),
        ),
      );

      const claudeResponse = response.content[0].text.trim();
      const parsedResponse = JSON.parse(claudeResponse);

      return {
        suggestedContent: parsedResponse.suggestedContent,
        explanation: parsedResponse.explanation,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          'Failed to parse Claude response',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }
}