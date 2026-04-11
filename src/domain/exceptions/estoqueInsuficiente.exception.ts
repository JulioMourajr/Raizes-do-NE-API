export class EstoqueInsuficienteException extends Error {
  public readonly produtoId: string;
  public readonly disponivel: number;
  public readonly solicitado: number;

  constructor(produtoId: string, disponivel: number, solicitado: number) {
    super(
      `Estoque insuficiente para o produto ${produtoId}. ` +
      `Disponível: ${disponivel}, Solicitado: ${solicitado}`,
    );
    this.name = 'EstoqueInsuficienteException';
    this.produtoId = produtoId;
    this.disponivel = disponivel;
    this.solicitado = solicitado;
  }
}