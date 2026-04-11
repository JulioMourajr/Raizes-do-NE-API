import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from '../../domain/entities/produto.entity';
import { IProdutoRepository } from '../../domain/repositories/produto.repository.interface';

@Injectable()
export class ProdutoRepository implements IProdutoRepository {
  constructor(
    @InjectRepository(Produto)
    private readonly repo: Repository<Produto>,
  ) {}

  async buscarPorId(id: string): Promise<Produto | null> {
    return this.repo.findOne({ where: { id, ativo: true } });
  }

  async listarPorUnidade(unidadeId: string): Promise<Produto[]> {
    return this.repo
      .createQueryBuilder('produto')
      .innerJoin('estoque', 'e', 'e.produto_id = produto.id AND e.unidade_id = :unidadeId', { unidadeId })
      .where('produto.ativo = true')
      .getMany();
  }
}