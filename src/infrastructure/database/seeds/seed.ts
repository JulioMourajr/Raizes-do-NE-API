import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { Unidade } from '../../../domain/entities/unidade.entity';
import { Produto } from '../../../domain/entities/produto.entity';
import { Estoque } from '../../../domain/entities/estoque.entity';
import { Perfil } from '../../../domain/enums/perfil.enum';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('Conectado ao banco. Iniciando seed...');

  const usuarioRepo = dataSource.getRepository(Usuario);

  const admin = usuarioRepo.create({
    nome: 'Admin Sistema',
    email: 'admin@raizesnordeste.com',
    senhaHash: await bcrypt.hash('Admin@123', 10),
    perfil: Perfil.ADMIN,
    ativo: true,
  });

  const gerente = usuarioRepo.create({
    nome: 'Gerente Boa Viagem',
    email: 'gerente@raizesnordeste.com',
    senhaHash: await bcrypt.hash('Gerente@123', 10),
    perfil: Perfil.GERENTE,
    ativo: true,
  });

  const cliente = usuarioRepo.create({
    nome: 'Maria Silva',
    email: 'maria@email.com',
    senhaHash: await bcrypt.hash('Cliente@123', 10),
    perfil: Perfil.CLIENTE,
    ativo: true,
  });

  const cozinha = usuarioRepo.create({
    nome: 'Cozinha Unidade 1',
    email: 'cozinha@raizesnordeste.com',
    senhaHash: await bcrypt.hash('Cozinha@123', 10),
    perfil: Perfil.COZINHA,
    ativo: true,
  });

  await usuarioRepo.save([admin, gerente, cliente, cozinha]);
  console.log('Usuários criados.');

  const unidadeRepo = dataSource.getRepository(Unidade);

  const unidade1 = unidadeRepo.create({
    nome: 'Raízes do Nordeste — Boa Viagem',
    cnpj: '12.345.678/0001-01',
    endereco: 'Av. Boa Viagem, 1000, Recife - PE',
    ativo: true,
  });

  const unidade2 = unidadeRepo.create({
    nome: 'Raízes do Nordeste — Derby',
    cnpj: '12.345.678/0002-02',
    endereco: 'Rua do Derby, 200, Recife - PE',
    ativo: true,
  });

  await unidadeRepo.save([unidade1, unidade2]);
  console.log('Unidades criadas.');

  const produtoRepo = dataSource.getRepository(Produto);

  const produtos = produtoRepo.create([
    { nome: 'X-Nordestino',      descricao: 'Hambúrguer com carne de sol e queijo coalho', preco: 32.90, categoria: 'LANCHES', ativo: true },
    { nome: 'Baião de Dois',     descricao: 'Arroz com feijão verde e carne seca',          preco: 28.90, categoria: 'PRATOS',  ativo: true },
    { nome: 'Tapioca Recheada',  descricao: 'Tapioca com queijo e manteiga de garrafa',     preco: 18.90, categoria: 'LANCHES', ativo: true },
    { nome: 'Suco de Umbu',      descricao: 'Suco natural de umbu',                         preco: 12.90, categoria: 'BEBIDAS', ativo: true },
    { nome: 'Caldo de Cana',     descricao: 'Caldo de cana gelado',                         preco: 8.90,  categoria: 'BEBIDAS', ativo: true },
  ]);

  await produtoRepo.save(produtos);
  console.log('Produtos criados.');

  const estoqueRepo = dataSource.getRepository(Estoque);

  const estoques: Estoque[] = [];
  for (const unidade of [unidade1, unidade2]) {
    for (const produto of produtos) {
      estoques.push(estoqueRepo.create({
        unidadeId: unidade.id,
        produtoId: produto.id,
        quantidade: 50,
      }));
    }
  }

  await estoqueRepo.save(estoques);
  console.log('Estoque criado com sucesso (máximo de 50 unidades por produto por unidade).');

  await dataSource.destroy();
  console.log('Seed concluído com sucesso!');
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});