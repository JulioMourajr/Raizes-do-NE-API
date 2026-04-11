import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Unidade } from './unidade.entity';
import { ItemPedido } from './itemPedido.entity';
import { CanalPedido } from '../enums/canalPedido.enum';
import { StatusPedido, TRANSICOES_VALIDAS } from '../enums/statusPedido.enum';
import { TransicaoStatusInvalidaException } from '../exceptions/transicaoStatusInvalida.exception';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Usuario;

  @Column({ name: 'cliente_id' })
  clienteId!: string;

  @ManyToOne(() => Unidade)
  @JoinColumn({ name: 'unidade_id' })
  unidade!: Unidade;

  @Column({ name: 'unidade_id' })
  unidadeId!: string;

  // Campo obrigatório de multicanalidade — requisito do roteiro
  @Column({ name: 'canal_pedido', type: 'enum', enum: CanalPedido })
  canalPedido!: CanalPedido;

  @Column({ type: 'enum', enum: StatusPedido, default: StatusPedido.AGUARDANDO_PAGAMENTO })
  status!: StatusPedido;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total!: number;

  @Column({ name: 'forma_pagamento', length: 50 })
  formaPagamento!: string;

  // Chave de idempotência — evita pedidos duplicados em caso de retry
  @Column({ name: 'idempotency_key', unique: true, nullable: true })
  idempotencyKey?: string;

  @OneToMany(() => ItemPedido, (item) => item.pedido, { cascade: true })
  itens!: ItemPedido[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  calcularTotal(): number {
    this.total = this.itens.reduce(
      (soma, item) => soma + item.calcularSubtotal(),
      0,
    );
    return this.total;
  }

  avancarStatus(novoStatus: StatusPedido): void {
    const transicoesPermitidas = TRANSICOES_VALIDAS[this.status];

    if (!transicoesPermitidas.includes(novoStatus)) {
      throw new TransicaoStatusInvalidaException(this.status, novoStatus);
    }

    this.status = novoStatus;
  }

  cancelar(): void {
    this.avancarStatus(StatusPedido.CANCELADO);
  }

  estaFinalizado(): boolean {
    return (
      this.status === StatusPedido.ENTREGUE ||
      this.status === StatusPedido.CANCELADO
    );
  }
}