import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/generated/prisma/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Look for the @Roles() decorator on the route or controller
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If there is no @Roles() decorator, allow access (meaning any logged-in user can access it)
    if (!requiredRoles) {
      return true;
    }

    // Grab the user object that JwtStrategy attached to the request
    const { user } = context.switchToHttp().getRequest();

    // Check if the user's role matches one of the required roles
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
