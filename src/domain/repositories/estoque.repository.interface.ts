import { Estoque } from "../entities/estoque.entity";

export interface IEstoqueRepository {
  buscarPorUnidadeEProduto(unidadeId: string, produtoId: string): Promise<Estoque | null>;
  salvar(estoque: Estoque): Promise<Estoque>;
  listarPorUnidade(unidadeId: string): Promise<Estoque[]>;
}