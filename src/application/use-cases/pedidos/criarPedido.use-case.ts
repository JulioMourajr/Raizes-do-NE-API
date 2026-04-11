import { Injectable, NotFoundException,
         ConflictException, BadRequestException } from '@nestjs/common';
import { CriarPedidoDto } from '../../dtos/criarPedido.dto';
import { Pedido }     from '../../../domain/entities/pedido.entity';
import { ItemPedido } from '../../../domain/entities/itemPedido.entity';
import { PedidoRepository }  from '../../../infrastructure/repositories/pedido.repository';
import { EstoqueRepository } from '../../../infrastructure/repositories/estoque.repository';
import { ProdutoRepository } from '../../../infrastructure/repositories/produto.repository';
import { UsuarioRepository } from '../../../infrastructure/repositories/usuario.repository';
import { AuditLogger } from '../../../infrastructure/logging/auditLogger';
import { EstoqueInsuficienteException } from '../../../domain/exceptions/estoqueInsuficiente.exception';

@Injectable()
export class CriarPedidoUseCase {
  constructor(
    private readonly pedidoRepo:   PedidoRepository,
    private readonly estoqueRepo:  EstoqueRepository,
    private readonly produtoRepo:  ProdutoRepository,
    private readonly usuarioRepo:  UsuarioRepository,
    private readonly auditLogger:  AuditLogger,
  ) {}

  async executar(dto: CriarPedidoDto, usuarioId: string): Promise<Pedido> {

    if (dto['idempotencyKey']) {
      const existente = await this.pedidoRepo.buscarPorIdempotencyKey(
        dto['idempotencyKey'],
      );
      if (existente) return existente;
    }

    const clienteId = dto.clienteId ?? usuarioId;
    const cliente = await this.usuarioRepo.buscarPorId(clienteId);
    if (!cliente) {
      throw new NotFoundException(`Cliente ${clienteId} não encontrado.`);
    }

    const itensPedido: ItemPedido[] = [];

    for (const itemDto of dto.itens) {

      const produto = await this.produtoRepo.buscarPorId(itemDto.produtoId);
      if (!produto) {
        throw new NotFoundException(
          `Produto ${itemDto.produtoId} não encontrado ou inativo.`,
        );
      }

      const estoque = await this.estoqueRepo.buscarPorUnidadeEProduto(
        dto.unidadeId,
        itemDto.produtoId,
      );

      if (!estoque) {
        throw new NotFoundException(
          `Produto ${produto.nome} não disponível nesta unidade.`,
        );
      }

      try {
        estoque.debitar(itemDto.quantidade);
      } catch (e) {
        if (e instanceof EstoqueInsuficienteException) {

          throw new ConflictException({
            error: 'ESTOQUE_INSUFICIENTE',
            message: `Quantidade insuficiente para o produto ${produto.nome}.`,
            details: [{
              field: `itens[produtoId:${itemDto.produtoId}].quantidade`,
              issue: `Disponível: ${e.disponivel}, Solicitado: ${e.solicitado}`,
            }],
          });
        }
        throw e;
      }

      await this.estoqueRepo.salvar(estoque);

      const item = new ItemPedido();
      item.produtoId     = itemDto.produtoId;
      item.quantidade    = itemDto.quantidade;
      item.precoUnitario = produto.preco;
      itensPedido.push(item);
    }

    const pedido = new Pedido();
    pedido.clienteId      = clienteId;
    pedido.unidadeId      = dto.unidadeId;
    pedido.canalPedido    = dto.canalPedido;  
    pedido.formaPagamento = dto.formaPagamento;
    pedido.itens          = itensPedido;
    pedido.idempotencyKey = dto['idempotencyKey'] ?? null;

    pedido.calcularTotal();

    const pedidoSalvo = await this.pedidoRepo.salvar(pedido);

    this.auditLogger.registrar({
      usuarioId,
      acao: 'CRIAR_PEDIDO',
      entidade: 'Pedido',
      entidadeId: pedidoSalvo.id,
      payload: {
        canalPedido: pedidoSalvo.canalPedido,
        unidadeId:   pedidoSalvo.unidadeId,
        total:       pedidoSalvo.total,
        itens:       dto.itens,
      },
    });

    return pedidoSalvo;
  }
}