import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserEntity, UserRole } from '@/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const handlerRoles = Reflect.getMetadata(ROLES_KEY, context.getHandler()) as UserRole[] | undefined;
    const classRoles = Reflect.getMetadata(ROLES_KEY, context.getClass()) as UserRole[] | undefined;
    const requiredRoles = handlerRoles ?? classRoles ?? this.inferRolesFromPath(context);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request?.user as UserEntity | undefined;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role privileges');
    }

    return true;
  }

  private inferRolesFromPath(context: ExecutionContext): UserRole[] | undefined {
    const request = context.switchToHttp().getRequest();
    const path = String(request?.originalUrl ?? request?.url ?? '').toLowerCase();

    if (path.includes('/api/v1/admin/')) return [UserRole.ADMIN];
    if (path.includes('/api/v1/media/')) return [UserRole.MEDIA, UserRole.ADMIN];
    if (path.includes('/api/v1/contestant/')) return [UserRole.CONTESTANT, UserRole.ADMIN];

    return undefined;
  }
}
