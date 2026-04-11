export enum StatusPedido {
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  PAGO = 'PAGO',
  EM_PREPARO = 'EM_PREPARO',
  PRONTO = 'PRONTO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

export const TRANSICOES_VALIDAS: Record<StatusPedido, StatusPedido[]> = {
  [StatusPedido.AGUARDANDO_PAGAMENTO]: [StatusPedido.PAGO, StatusPedido.CANCELADO],
  [StatusPedido.PAGO]:                 [StatusPedido.EM_PREPARO, StatusPedido.CANCELADO],
  [StatusPedido.EM_PREPARO]:           [StatusPedido.PRONTO],
  [StatusPedido.PRONTO]:               [StatusPedido.ENTREGUE],
  [StatusPedido.ENTREGUE]:             [],
  [StatusPedido.CANCELADO]:            [],
};