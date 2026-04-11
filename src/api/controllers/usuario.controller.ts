import { Controller, Post, Get, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Public }          from '../decorators/public.decorator';
import { UsuarioAtual }    from '../decorators/usuarioAtual.decorator';
import { UsuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { Usuario }           from '../../domain/entities/usuario.entity';

export class CriarUsuarioDto {
  @ApiProperty({ example: 'João Souza' })
  @IsString()
  nome!: string;

  @ApiProperty({ example: 'pedromoura@email.com' })
  @IsEmail({}, { message: 'E-mail inválido.' })
  email!: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsString()
  @MinLength(6)
  senha!: string;

  @ApiProperty({ required: false, example: '123.456.789-00' })
  @IsOptional()
  @IsString()
  cpf?: string;
}

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  @Public()
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async criar(@Body() dto: CriarUsuarioDto) {

    const existe = await this.usuarioRepo.buscarPorEmail(dto.email);
    if (existe) {
      throw new Error('EMAIL_JA_CADASTRADO');
    }

    const usuario    = new Usuario();
    usuario.nome     = dto.nome;
    usuario.email    = dto.email;
    usuario.senhaHash = await bcrypt.hash(dto.senha, 10);

    if (dto.cpf) {
      usuario.cpfHash = await bcrypt.hash(dto.cpf, 10);
    }

    const salvo = await this.usuarioRepo.salvar(usuario);

    return {
      id:        salvo.id,
      nome:      salvo.nome,
      email:     salvo.email,
      perfil:    salvo.perfil,
      createdAt: salvo.createdAt,
    };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  async perfil(@UsuarioAtual() usuario: { id: string }) {
    const u = await this.usuarioRepo.buscarPorId(usuario.id);
    return {
      id:     u?.id,
      nome:   u?.nome,
      email:  u?.email,
      perfil: u?.perfil,
    };
  }
}