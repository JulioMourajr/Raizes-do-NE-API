import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estoque } from '../../domain/entities/estoque.entity';
import { IEstoqueRepository } from '../../domain/repositories/estoque.repository.interface';

@Injectable()
export class EstoqueRepository implements IEstoqueRepository {
  constructor(
    @InjectRepository(Estoque)
    private readonly repo: Repository<Estoque>,
  ) {}

  async buscarPorUnidadeEProduto(
    unidadeId: string,
    produtoId: string,
  ): Promise<Estoque | null> {
    return this.repo.findOne({ where: { unidadeId, produtoId } });
  }

  async salvar(estoque: Estoque): Promise<Estoque> {
    return this.repo.save(estoque);
  }

  async listarPorUnidade(unidadeId: string): Promise<Estoque[]> {
    return this.repo.find({
      where: { unidadeId },
      relations: ['produto'],
    });
  }
}