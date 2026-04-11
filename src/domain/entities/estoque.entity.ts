import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, UpdateDateColumn,
} from 'typeorm';
import { Unidade } from './unidade.entity';
import { Produto } from './produto.entity';
import { EstoqueInsuficienteException } from '../exceptions/estoqueInsuficiente.exception';

@Entity('estoque')
export class Estoque {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Unidade)
  @JoinColumn({ name: 'unidade_id' })
  unidade!: Unidade;

  @Column({ name: 'unidade_id' })
  unidadeId!: string;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto!: Produto;

  @Column({ name: 'produto_id' })
  produtoId!: string;

  @Column({ type: 'int', default: 0 })
  quantidade!: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  temSaldo(qtdSolicitada: number): boolean {
    return this.quantidade >= qtdSolicitada;
  }

  debitar(qtd: number): void {
    if (!this.temSaldo(qtd)) {
      throw new EstoqueInsuficienteException(
        this.produtoId,
        this.quantidade,
        qtd,
      );
    }
    this.quantidade -= qtd;
  }

  creditar(qtd: number): void {
    this.quantidade += qtd;
  }
}