import { Pedido } from '../entities/pedido.entity';
import { CanalPedido } from '../enums/canalPedido.enum';
import { StatusPedido } from '../enums/statusPedido.enum';

export interface FiltrosPedido {
  canalPedido?: CanalPedido;
  status?: StatusPedido;
  unidadeId?: string;
  clienteId?: string;
  page?: number;
  limit?: number;
}

export interface IPedidoRepository {
  salvar(pedido: Pedido): Promise<Pedido>;
  buscarPorId(id: string): Promise<Pedido | null>;
  buscarPorIdempotencyKey(key: string): Promise<Pedido | null>;
  listar(filtros: FiltrosPedido): Promise<{ data: Pedido[]; total: number }>;
  atualizar(pedido: Pedido): Promise<Pedido>;
}