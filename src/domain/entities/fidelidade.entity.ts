import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('fidelidade')
export class Fidelidade {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Usuario;

  @Column({ name: 'cliente_id' })
  clienteId!: string;

  @Column({ name: 'pontos_saldo', type: 'int', default: 0 })
  pontosSaldo!: number;

  @Column({ default: false })
  ativo!: boolean;

  // LGPD: registro do consentimento com timestamp
  @Column({ name: 'consentimento_at', nullable: true })
  consentimentoAt!: Date;

  adicionarPontos(qtd: number): void {
    this.pontosSaldo += qtd;
  }

  resgatar(qtd: number): void {
    if (this.pontosSaldo < qtd) {
      throw new Error('Saldo de pontos insuficiente para resgate.');
    }
    this.pontosSaldo -= qtd;
  }

  // Regra: 1 ponto a cada R$1,00
  calcularPontos(totalPedido: number): number {
    return Math.floor(totalPedido);
  }
}