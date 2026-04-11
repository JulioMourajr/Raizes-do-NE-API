import { Injectable, NotFoundException,
         BadRequestException } from '@nestjs/common';
import { ProcessarPagamentoDto } from '../../dtos/processarPagamento.dto';
import { Pagamento }  from '../../../domain/entities/pagamento.entity';
import { StatusPedido } from '../../../domain/enums/statusPedido.enum';
import { PedidoRepository }     from '../../../infrastructure/repositories/pedido.repository';
import { PagamentoMockGateway } from '../../../infrastructure/gateways/pagamentoMockGateway';
import { AuditLogger }          from '../../../infrastructure/logging/auditLogger';
import { InjectRepository }     from '@nestjs/typeorm';
import { Repository }           from 'typeorm';

@Injectable()
export class ProcessarPagamentoUseCase {
  constructor(
    private readonly pedidoRepo:    PedidoRepository,
    private readonly mockGateway:   PagamentoMockGateway,
    private readonly auditLogger:   AuditLogger,
    @InjectRepository(Pagamento)
    private readonly pagamentoRepo: Repository<Pagamento>,
  ) {}

  async executar(dto: ProcessarPagamentoDto, usuarioId: string): Promise<Pagamento> {

    const pedido = await this.pedidoRepo.buscarPorId(dto.pedidoId);
    if (!pedido) {
      throw new NotFoundException(`Pedido ${dto.pedidoId} não encontrado.`);
    }

    if (pedido.status !== StatusPedido.AGUARDANDO_PAGAMENTO) {
      throw new BadRequestException({
        error: 'STATUS_INVALIDO',
        message: `Pedido não está aguardando pagamento. Status atual: ${pedido.status}`,
        details: [],
      });
    }

    const resultado = await this.mockGateway.processar(
      dto.pedidoId,
      dto.valor,
      dto.formaPagamento,
    );

    const pagamento = new Pagamento();
    pagamento.pedidoId = dto.pedidoId;
    pagamento.valor    = dto.valor;

    if (resultado.status === 'APROVADO') {
      pagamento.registrarAprovacao(resultado.transacaoId);
      pedido.avancarStatus(StatusPedido.PAGO);
      await this.pedidoRepo.atualizar(pedido);

    } else {
      pagamento.registrarRecusa(resultado.motivo ?? 'RECUSADO_PELO_GATEWAY');
    }

    const pagamentoSalvo = await this.pagamentoRepo.save(pagamento);

    this.auditLogger.registrar({
      usuarioId,
      acao: resultado.status === 'APROVADO' ? 'PAGAMENTO_APROVADO' : 'PAGAMENTO_RECUSADO',
      entidade: 'Pagamento',
      entidadeId: pagamentoSalvo.id,
      payload: {
        pedidoId:     dto.pedidoId,
        valor:        dto.valor,
        status:       resultado.status,
        transacaoId:  resultado.transacaoId,
        motivo:       resultado.motivo,
      },
    });

    return pagamentoSalvo;
  }
}