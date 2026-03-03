import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * High-performance Zod validation pipe for NestJS
 * Use this instead of ValidationPipe with class-validator for better performance
 * 
 * @example
 * @UseGuards(JwtGuard)
 * @Post()
 * @UsePipes(new ZodValidationPipe(CreateVoteSchema))
 * async castVote(@Body() body: CreateVoteZodDto) { ... }
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      }
      throw new BadRequestException('Invalid request data');
    }
  }
}

/**
 * Factory function to create a ZodValidationPipe
 */
export function createZodPipe(schema: ZodSchema): ZodValidationPipe {
  return new ZodValidationPipe(schema);
}
