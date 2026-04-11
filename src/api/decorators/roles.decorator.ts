import { SetMetadata } from '@nestjs/common';
import { Perfil } from '../../domain/enums/perfil.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...perfis: Perfil[]) => SetMetadata(ROLES_KEY, perfis);