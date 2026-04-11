import { Injectable, CanActivate, ExecutionContext,
         ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Perfil }    from '../../domain/enums/perfil.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisNecessarios = this.reflector.getAllAndOverride<Perfil[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!perfisNecessarios || perfisNecessarios.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!perfisNecessarios.includes(user.perfil)) {
      throw new ForbiddenException({
        error: 'SEM_PERMISSAO',
        message: `Acesso negado. Perfil necessário: ${perfisNecessarios.join(' ou ')}.`,
        details: [],
      });
    }
    return true;
  }
}