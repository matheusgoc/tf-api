import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { User, USER_ROLE } from '@/entities/user.entity';
import { ROLES_DECORATOR_KEY } from '@/modules/auth/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<USER_ROLE[]>(
      ROLES_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    // allow access case no roles are required
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    // master user can access all routes
    if (user.role === USER_ROLE.MASTER) {
      return true;
    }

    // allow access case user's role match one of the required roles
    if (requiredRoles.some((role) => user.role === role)) {
      return true;
    }

    // allow access case user's role is a parent of one of the required roles
    const USER_ROLES_TREE = {
      [USER_ROLE.ADMIN]: [USER_ROLE.SELLER],
      [USER_ROLE.SELLER]: [],
    };
    if (
      USER_ROLES_TREE[user.role]?.some((role) => requiredRoles.includes(role))
    ) {
      return true;
    }

    return false;
  }
}
