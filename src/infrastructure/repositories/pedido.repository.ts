import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../../domain/entities/pedido.entity';
import {
  FiltrosPedido,
  IPedidoRepository,
} from '../../domain/repositories/pedido.repository.interface';

@Injectable()
export class PedidoRepository implements IPedidoRepository {
  constructor(
    @InjectRepository(Pedido)
    private readonly repo: Repository<Pedido>,
  ) {}

  async salvar(pedido: Pedido): Promise<Pedido> {
    return this.repo.save(pedido);
  }

  async buscarPorId(id: string): Promise<Pedido | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['itens', 'itens.produto', 'cliente', 'unidade'],
    });
  }

  async buscarPorIdempotencyKey(key: string): Promise<Pedido | null> {
    return this.repo.findOne({ where: { idempotencyKey: key } });
  }

  async listar(filtros: FiltrosPedido): Promise<{ data: Pedido[]; total: number }> {
    const query = this.repo.createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.itens', 'itens')
      .leftJoinAndSelect('pedido.cliente', 'cliente')
      .leftJoinAndSelect('pedido.unidade', 'unidade');
    if (filtros.canalPedido) {
      query.andWhere('pedido.canalPedido = :canal', { canal: filtros.canalPedido });
    }
    if (filtros.status) {
      query.andWhere('pedido.status = :status', { status: filtros.status });
    }
    if (filtros.unidadeId) {
      query.andWhere('pedido.unidadeId = :unidadeId', { unidadeId: filtros.unidadeId });
    }
    if (filtros.clienteId) {
      query.andWhere('pedido.clienteId = :clienteId', { clienteId: filtros.clienteId });
    }

    const page  = filtros.page  ?? 1;
    const limit = filtros.limit ?? 20;

    query.skip((page - 1) * limit).take(limit);
    query.orderBy('pedido.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async atualizar(pedido: Pedido): Promise<Pedido> {
    return this.repo.save(pedido);
  }
}