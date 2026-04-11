import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario }    from '../domain/entities/usuario.entity';
import { Unidade }    from '../domain/entities/unidade.entity';
import { Produto }    from '../domain/entities/produto.entity';
import { Estoque }    from '../domain/entities/estoque.entity';
import { Pedido }     from '../domain/entities/pedido.entity';
import { ItemPedido } from '../domain/entities/itemPedido.entity';
import { Pagamento }  from '../domain/entities/pagamento.entity';
import { Fidelidade } from '../domain/entities/fidelidade.entity';
import { UsuarioRepository } from './repositories/usuario.repository';
import { PedidoRepository }  from './repositories/pedido.repository';
import { EstoqueRepository } from './repositories/estoque.repository';
import { ProdutoRepository } from './repositories/produto.repository';
import { PagamentoMockGateway } from './gateways/pagamentoMockGateway';
import { AuditLogger }          from './logging/auditLogger';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario, Unidade, Produto, Estoque,
      Pedido, ItemPedido, Pagamento, Fidelidade,
    ]),
  ],
  providers: [
    UsuarioRepository,
    PedidoRepository,
    EstoqueRepository,
    ProdutoRepository,
    PagamentoMockGateway,
    AuditLogger,
  ],
  exports: [
    UsuarioRepository,
    PedidoRepository,
    EstoqueRepository,
    ProdutoRepository,
    PagamentoMockGateway,
    AuditLogger,
  ],
})
export class InfrastructureModule {}