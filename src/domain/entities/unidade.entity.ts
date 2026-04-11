import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('unidades')
export class Unidade {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  nome!: string;

  @Column({ unique: true, length: 18 })
  cnpj!: string;

  @Column({ length: 300 })
  endereco!: string;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  ativar(): void {
    this.ativo = true;
  }

  desativar(): void {
    this.ativo = false;
  }
}