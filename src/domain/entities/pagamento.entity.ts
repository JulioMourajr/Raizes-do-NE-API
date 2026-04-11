import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { StatusPagamento } from '../enums/statusPagamento.enum';

@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Pedido)
  @JoinColumn({ name: 'pedido_id' })
  pedido!: Pedido;

  @Column({ name: 'pedido_id' })
  pedidoId!: string;

  @Column({ name: 'transacao_id', nullable: true })
  transacaoId!: string;

  @Column({ type: 'enum', enum: StatusPagamento, default: StatusPagamento.PENDENTE })
  status!: StatusPagamento;

  @Column({ name: 'motivo_recusa', nullable: true })
  motivoRecusa!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  registrarAprovacao(transacaoId: string): void {
    this.status = StatusPagamento.APROVADO;
    this.transacaoId = transacaoId;
  }

  registrarRecusa(motivo: string): void {
    this.status = StatusPagamento.RECUSADO;
    this.motivoRecusa = motivo;
  }
}