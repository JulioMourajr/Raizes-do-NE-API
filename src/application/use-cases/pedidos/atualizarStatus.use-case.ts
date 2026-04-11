import { Injectable, NotFoundException,
         ConflictException, ForbiddenException } from '@nestjs/common';
import { AtualizarStatusDto } from '../../dtos/atualizarStatus.dto';
import { StatusPedido } from '../../../domain/enums/statusPedido.enum';
import { Perfil }       from '../../../domain/enums/perfil.enum';
import { PedidoRepository } from '../../../infrastructure/repositories/pedido.repository';
import { AuditLogger }      from '../../../infrastructure/logging/auditLogger';
import { TransicaoStatusInvalidaException } from '../../../domain/exceptions/transicaoStatusInvalida.exception';

const PERMISSAO_POR_STATUS: Record<StatusPedido, Perfil[]> = {
  [StatusPedido.AGUARDANDO_PAGAMENTO]: [],
  [StatusPedido.PAGO]:                 [Perfil.ADMIN, Perfil.GERENTE],
  [StatusPedido.EM_PREPARO]:           [Perfil.COZINHA, Perfil.GERENTE, Perfil.ADMIN],
  [StatusPedido.PRONTO]:               [Perfil.COZINHA, Perfil.GERENTE, Perfil.ADMIN],
  [StatusPedido.ENTREGUE]:             [Perfil.ATENDENTE, Perfil.GERENTE, Perfil.ADMIN],
  [StatusPedido.CANCELADO]:            [Perfil.ATENDENTE, Perfil.GERENTE, Perfil.ADMIN],
};

@Injectable()
export class AtualizarStatusPedidoUseCase {
  constructor(
    private readonly pedidoRepo:  PedidoRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async executar(
    pedidoId: string,
    dto: AtualizarStatusDto,
    usuarioId: string,
    perfilUsuario: Perfil,
  ): Promise<{ pedidoId: string; statusAnterior: StatusPedido; statusAtual: StatusPedido }> {

    const pedido = await this.pedidoRepo.buscarPorId(pedidoId);
    if (!pedido) {
      throw new NotFoundException(`Pedido ${pedidoId} não encontrado.`);
    }

    const perfisPermitidos = PERMISSAO_POR_STATUS[dto.novoStatus];
    if (!perfisPermitidos.includes(perfilUsuario)) {
      throw new ForbiddenException({
        error: 'SEM_PERMISSAO',
        message: `Perfil ${perfilUsuario} não pode definir status ${dto.novoStatus}.`,
        details: [],
      });
    }

    const statusAnterior = pedido.status;

    try {
      pedido.avancarStatus(dto.novoStatus);
    } catch (e) {
      if (e instanceof TransicaoStatusInvalidaException) {
        throw new ConflictException({
          error: 'TRANSICAO_INVALIDA',
          message: e.message,
          details: [],
        });
      }
      throw e;
    }

    await this.pedidoRepo.atualizar(pedido);

    this.auditLogger.registrar({
      usuarioId,
      acao: 'ATUALIZAR_STATUS_PEDIDO',
      entidade: 'Pedido',
      entidadeId: pedidoId,
      payload: { statusAnterior, statusAtual: dto.novoStatus },
    });

    return {
      pedidoId,
      statusAnterior,
      statusAtual: pedido.status,
    };
  }
}