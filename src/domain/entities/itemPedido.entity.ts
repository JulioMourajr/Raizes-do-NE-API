import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Produto } from './produto.entity';

@Entity('itens_pedido')
export class ItemPedido {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Pedido, (pedido) => pedido.itens)
  @JoinColumn({ name: 'pedido_id' })
  pedido!: Pedido;

  @Column({ name: 'pedido_id' })
  pedidoId!: string;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto!: Produto;

  @Column({ name: 'produto_id' })
  produtoId!: string;

  @Column({ type: 'int' })
  quantidade!: number;

  @Column({ name: 'preco_unitario', type: 'decimal', precision: 10, scale: 2 })
  precoUnitario!: number;

  calcularSubtotal(): number {
    return Number(this.precoUnitario) * this.quantidade;
  }
}