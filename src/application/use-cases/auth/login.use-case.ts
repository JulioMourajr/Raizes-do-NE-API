import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioRepository } from '../../../infrastructure/repositories/usuario.repository';

export class LoginDto {
  email!: string;
  senha!: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usuarioRepo: UsuarioRepository,
    private readonly jwtService:  JwtService,
  ) {}

  async executar(dto: LoginDto) {

    const usuario = await this.usuarioRepo.buscarPorEmail(dto.email);

    if (!usuario || !(await bcrypt.compare(dto.senha, usuario.senhaHash))) {
      throw new UnauthorizedException({
        error: 'CREDENCIAIS_INVALIDAS',
        message: 'E-mail ou senha incorretos.',
        details: [],
      });
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException({
        error: 'USUARIO_INATIVO',
        message: 'Usuário desativado. Entre em contato com o suporte.',
        details: [],
      });
    }

    const payload = {
      sub:    usuario.id,
      email:  usuario.email,
      perfil: usuario.perfil,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType:   'Bearer',
      expiresIn:   3600,
      usuario: {
        id:     usuario.id,
        nome:   usuario.nome,
        email:  usuario.email,
        perfil: usuario.perfil,
      },
    };
  }
}