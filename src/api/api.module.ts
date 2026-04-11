import { Module }    from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD }  from '@nestjs/core';
import { InfrastructureModule } from '../infrastructure/infra.module';
import { ApplicationModule }    from '../application/application.module';
import { JwtStrategy }   from './guards/jwt.strategy';
import { JwtAuthGuard }  from './guards/jwtAuth.guard';
import { RolesGuard }    from './guards/roles.guard';
import { AuthController }    from './controllers/auth.controller';
import { PedidoController }  from './controllers/pedido.controller';
import { PagamentoController } from './controllers/pagamento.controller';
import { UsuarioController }   from './controllers/usuario.controller';
import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { UnidadeController } from './controllers/unidade.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret:      config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '3600s') as `${number}${'s'|'m'|'h'|'d'}` },
      }),
      inject: [ConfigService],
    }),
    InfrastructureModule,
    ApplicationModule,
  ],
  controllers: [
    AuthController,
    PedidoController,
    PagamentoController,
    UsuarioController,
    UnidadeController,
  ],
  providers: [
    JwtStrategy,
    LoginUseCase,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class ApiModule {}