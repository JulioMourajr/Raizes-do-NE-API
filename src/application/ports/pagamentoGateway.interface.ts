export interface ResultadoPagamento {
  transacaoId: string;
  status: 'APROVADO' | 'RECUSADO';
  motivo?: string;
}

export interface IPagamentoGateway {
  processar(pedidoId: string, valor: number, formaPagamento: string): Promise<ResultadoPagamento>;
}