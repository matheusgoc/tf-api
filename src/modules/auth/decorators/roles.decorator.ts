import { SetMetadata } from '@nestjs/common';

import { USER_ROLE } from '@/entities/user.entity';

export const ROLES_DECORATOR_KEY = 'roles';

export const Roles = (...roles: USER_ROLE[]) =>
  SetMetadata(ROLES_DECORATOR_KEY, roles);
