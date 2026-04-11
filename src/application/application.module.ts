import { Module }           from '@nestjs/common';
import { TypeOrmModule }    from '@nestjs/typeorm';
import { Pagamento }        from '../domain/entities/pagamento.entity';
import { InfrastructureModule } from '../infrastructure/infra.module';
import { CriarPedidoUseCase }          from './use-cases/pedidos/criarPedido.use-case';
import { ProcessarPagamentoUseCase }   from './use-cases/pedidos/processarPagamento.use-case';
import { AtualizarStatusPedidoUseCase } from './use-cases/pedidos/atualizarStatus.use-case';

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([Pagamento]),
  ],
  providers: [
    CriarPedidoUseCase,
    ProcessarPagamentoUseCase,
    AtualizarStatusPedidoUseCase,
  ],
  exports: [
    CriarPedidoUseCase,
    ProcessarPagamentoUseCase,
    AtualizarStatusPedidoUseCase,
  ],
})
export class ApplicationModule {}