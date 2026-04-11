import { StatusPedido } from '../enums/statusPedido.enum';

export class TransicaoStatusInvalidaException extends Error {
  constructor(statusAtual: StatusPedido, novoStatus: StatusPedido) {
    super(
      `Transição de ${statusAtual} para ${novoStatus} não é permitida.`,
    );
    this.name = 'TransicaoStatusInvalidaException';
  }
}