import { BadRequestException } from '@nestjs/common';

export function getRequestUser(headers: Record<string, string | string[] | undefined>) {
  const userIdRaw = headers['x-user-id'];
  const roleRaw = headers['x-role'];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;
  const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;
  if (!userId || !role) {
    throw new BadRequestException('Missing x-user-id or x-role header');
  }
  return { userId: String(userId), role: String(role) };
}
