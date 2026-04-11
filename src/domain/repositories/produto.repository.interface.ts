import { Produto } from "../entities/produto.entity";

export interface IProdutoRepository {
  buscarPorId(id: string): Promise<Produto | null>;
  listarPorUnidade(unidadeId: string): Promise<Produto[]>;
}