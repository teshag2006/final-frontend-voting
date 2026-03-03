import { UserRole } from '@/entities/user.entity';

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  tenant_id?: number;
  iat?: number;
  exp?: number;
}
