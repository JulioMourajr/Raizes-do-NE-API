import { Injectable, Logger } from '@nestjs/common';
import {
  IPagamentoGateway,
  ResultadoPagamento,
} from '../../application/ports/pagamentoGateway.interface';

@Injectable()
export class PagamentoMockGateway implements IPagamentoGateway {
  private readonly logger = new Logger(PagamentoMockGateway.name);

  async processar(
    pedidoId: string,
    valor: number,
    formaPagamento: string,
  ): Promise<ResultadoPagamento> {
    this.logger.log(
      `[MOCK] Processando pagamento — pedido: ${pedidoId}, valor: R$${valor}, forma: ${formaPagamento}`,
    );

    await this.simularLatencia(300, 800);

    const transacaoId = `TXN-MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    if (valor > 500 || formaPagamento === 'RECUSAR') {
      this.logger.warn(`[MOCK] Pagamento RECUSADO — pedido: ${pedidoId}`);
      return {
        transacaoId,
        status: 'RECUSADO',
        motivo: valor > 500 ? 'LIMITE_EXCEDIDO' : 'RECUSA_FORCADA_TESTE',
      };
    }

    this.logger.log(`[MOCK] Pagamento APROVADO — transação: ${transacaoId}`);
    return {
      transacaoId,
      status: 'APROVADO',
    };
  }

  private simularLatencia(min: number, max: number): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}