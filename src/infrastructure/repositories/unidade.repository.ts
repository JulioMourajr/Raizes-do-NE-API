import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unidade } from '../../domain/entities/unidade.entity';
import { Estoque } from '../../domain/entities/estoque.entity';

@Injectable()
export class UnidadeRepository {
  constructor(
    @InjectRepository(Unidade)
    private readonly unidadeRepo: Repository<Unidade>,

    @InjectRepository(Estoque)
    private readonly estoqueRepo: Repository<Estoque>,
  ) {}

  async listar(): Promise<Unidade[]> {
    return this.unidadeRepo.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async buscarPorId(id: string): Promise<Unidade | null> {
    return this.unidadeRepo.findOne({ where: { id, ativo: true } });
  }

  async buscarCardapio(
    unidadeId: string,
    categoria?: string,
  ): Promise<{
    produtoId: string;
    nome: string;
    descricao: string;
    preco: number;
    categoria: string;
    disponivel: boolean;
    quantidadeEstoque: number;
  }[]> {

    const query = this.estoqueRepo
      .createQueryBuilder('estoque')
      .innerJoinAndSelect('estoque.produto', 'produto')
      .where('estoque.unidadeId = :unidadeId', { unidadeId })
      .andWhere('produto.ativo = true');

    if (categoria) {
      query.andWhere('produto.categoria = :categoria', {
        categoria: categoria.toUpperCase(),
      });
    }

    query.orderBy('produto.categoria', 'ASC')
         .addOrderBy('produto.nome', 'ASC');

    const estoques = await query.getMany();

    return estoques.map((e) => ({
      produtoId:         e.produto.id,
      nome:              e.produto.nome,
      descricao:         e.produto.descricao,
      preco:             Number(e.produto.preco),
      categoria:         e.produto.categoria,
      disponivel:        e.quantidade > 0,
      quantidadeEstoque: e.quantidade,
    }));
  }
}