import { z } from 'zod';

/**
 * VoteType enum defined locally to avoid import path issues in declaration files
 */
export enum VoteType {
  FREE = 'free',
  PAID = 'paid',
}

/**
 * Zod schema for fast vote validation
 * This replaces class-validator for better performance
 */
export const CreateVoteSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
  contestantId: z.coerce.number().int().positive(),
  voteType: z.nativeEnum(VoteType),
  paymentId: z.coerce.number().int().positive().optional(),
  deviceFingerprint: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  isAnonymous: z.boolean().optional(),
});

export type CreateVoteZodDto = z.infer<typeof CreateVoteSchema>;

/**
 * Manual validation function for CreateVoteDto - very fast
 * Use this instead of class-validator for high-throughput endpoints
 */
export function validateCreateVote(data: unknown): CreateVoteZodDto {
  return CreateVoteSchema.parse(data);
}

/**
 * Safe validation that returns errors instead of throwing
 */
export function validateCreateVoteSafe(data: unknown): {
  success: boolean;
  data?: CreateVoteZodDto;
  errors?: z.ZodError;
} {
  const result = CreateVoteSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
