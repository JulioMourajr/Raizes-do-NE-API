import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  nome!: string;

  @Column({ type: 'text', nullable: true })
  descricao!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco!: number;

  @Column({ length: 80 })
  categoria!: string;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}