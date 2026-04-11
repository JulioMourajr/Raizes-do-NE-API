import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Perfil } from '../enums/perfil.enum';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  nome!: string;

  @Column({ unique: true, length: 200 })
  email!: string;

  // Nunca expor a senha — só o hash
  @Column({ name: 'senha_hash' })
  senhaHash!: string;

  // CPF guardado como hash — LGPD: minimização de dados sensíveis
  @Column({ name: 'cpf_hash', nullable: true })
  cpfHash!: string;

  @Column({ type: 'enum', enum: Perfil, default: Perfil.CLIENTE })
  perfil!: Perfil;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  temPerfil(perfil: Perfil): boolean {
    return this.perfil === perfil;
  }
}