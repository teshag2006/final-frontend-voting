export const CONTESTANT_GENDERS = ['female', 'male', 'non_binary', 'prefer_not_to_say'] as const;

export type ContestantGender = (typeof CONTESTANT_GENDERS)[number];

export function isContestantGender(value: unknown): value is ContestantGender {
  return CONTESTANT_GENDERS.includes(String(value) as ContestantGender);
}

