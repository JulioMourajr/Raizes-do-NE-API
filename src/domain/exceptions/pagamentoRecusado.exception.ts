export class PagamentoRecusadoException extends Error {
  public readonly motivo: string;

  constructor(motivo: string) {
    super(`Pagamento recusado: ${motivo}`);
    this.name = 'PagamentoRecusadoException';
    this.motivo = motivo;
  }
}