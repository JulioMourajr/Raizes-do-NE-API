import { INestApplication, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule }              from '@nestjs/testing';
import { getRepositoryToken }               from '@nestjs/typeorm';
import { Repository }                       from 'typeorm';
import request                              from 'supertest';
import * as bcrypt                          from 'bcrypt';
import { AppModule }      from '../../src/app.module';
import { GlobalExceptionFilter } from '../../src/api/middlewares/httpException.filter';
import { Usuario }    from '../../src/domain/entities/usuario.entity';
import { Unidade }    from '../../src/domain/entities/unidade.entity';
import { Produto }    from '../../src/domain/entities/produto.entity';
import { Estoque }    from '../../src/domain/entities/estoque.entity';
import { Pedido }     from '../../src/domain/entities/pedido.entity';
import { ItemPedido } from '../../src/domain/entities/itemPedido.entity';
import { Pagamento }  from '../../src/domain/entities/pagamento.entity';
import { Perfil }     from '../../src/domain/enums/perfil.enum';

export interface TestContext {
  app:        INestApplication;
  httpServer: any;
  tokenCliente:   string;
  tokenCozinha:   string;
  tokenAtendente: string;
  tokenGerente:   string;
  clienteId:  string;
  unidadeId:  string;
  produtoId:  string;
}

const PREFIX = `test_${Date.now()}`;

export async function criarApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
      exceptionFactory: (errors) =>
        new UnprocessableEntityException({
          error:   'VALIDACAO_INVALIDA',
          message: 'Dados de entrada inválidos.',
          details: errors.map((e) => ({
            field: e.property,
            issue: Object.values(e.constraints ?? {}).join(', '),
          })),
        }),
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('api/v1');

  await app.init();
  return app;
}

export async function seedTestData(app: INestApplication): Promise<TestContext> {
  const usuarioRepo = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  const unidadeRepo = app.get<Repository<Unidade>>(getRepositoryToken(Unidade));
  const produtoRepo = app.get<Repository<Produto>>(getRepositoryToken(Produto));
  const estoqueRepo = app.get<Repository<Estoque>>(getRepositoryToken(Estoque));

  const usuarios = await usuarioRepo.save([
    usuarioRepo.create({
      nome:      'Cliente Teste',
      email:     `${PREFIX}_cliente@test.com`,
      senhaHash: await bcrypt.hash('Senha@123', 10),
      perfil:    Perfil.CLIENTE,
      ativo:     true,
    }),
    usuarioRepo.create({
      nome:      'Cozinha Teste',
      email:     `${PREFIX}_cozinha@test.com`,
      senhaHash: await bcrypt.hash('Senha@123', 10),
      perfil:    Perfil.COZINHA,
      ativo:     true,
    }),
    usuarioRepo.create({
      nome:      'Atendente Teste',
      email:     `${PREFIX}_atendente@test.com`,
      senhaHash: await bcrypt.hash('Senha@123', 10),
      perfil:    Perfil.ATENDENTE,
      ativo:     true,
    }),
    usuarioRepo.create({
      nome:      'Gerente Teste',
      email:     `${PREFIX}_gerente@test.com`,
      senhaHash: await bcrypt.hash('Senha@123', 10),
      perfil:    Perfil.GERENTE,
      ativo:     true,
    }),
  ]);

  const [cliente, , , ] = usuarios;

  const unidade = await unidadeRepo.save(
    unidadeRepo.create({
      nome:     `Unidade Teste ${PREFIX}`,
      cnpj:     `${Math.floor(Math.random() * 90000000) + 10000000}/0001-00`,
      endereco: 'Rua de Teste, 123, Recife - PE',
      ativo:    true,
    }),
  );

  const produto = await produtoRepo.save(
    produtoRepo.create({
      nome:      `X-Teste ${PREFIX}`,
      descricao: 'Produto para testes automatizados',
      preco:     32.90,
      categoria: 'LANCHES',
      ativo:     true,
    }),
  );

  await estoqueRepo.save(
    estoqueRepo.create({
      unidadeId: unidade.id,
      produtoId: produto.id,
      quantidade: 50,
    }),
  );

  const httpServer = app.getHttpServer();

  const login = async (email: string) => {
    const res = await request(httpServer)
      .post('/api/v1/auth/login')
      .send({ email, senha: 'Senha@123' });
    return res.body.accessToken as string;
  };

  const [tokenCliente, tokenCozinha, tokenAtendente, tokenGerente] =
    await Promise.all([
      login(`${PREFIX}_cliente@test.com`),
      login(`${PREFIX}_cozinha@test.com`),
      login(`${PREFIX}_atendente@test.com`),
      login(`${PREFIX}_gerente@test.com`),
    ]);

  return {
    app,
    httpServer,
    tokenCliente,
    tokenCozinha,
    tokenAtendente,
    tokenGerente,
    clienteId:  cliente.id,
    unidadeId:  unidade.id,
    produtoId:  produto.id,
  };
}

export async function limparTestData(
  app:       INestApplication,
  ctx:       TestContext,
  pedidoIds: string[] = [],
): Promise<void> {
  const pagamentoRepo   = app.get<Repository<Pagamento>>(getRepositoryToken(Pagamento));
  const itemPedidoRepo  = app.get<Repository<ItemPedido>>(getRepositoryToken(ItemPedido));
  const pedidoRepo      = app.get<Repository<Pedido>>(getRepositoryToken(Pedido));
  const estoqueRepo     = app.get<Repository<Estoque>>(getRepositoryToken(Estoque));
  const produtoRepo     = app.get<Repository<Produto>>(getRepositoryToken(Produto));
  const unidadeRepo     = app.get<Repository<Unidade>>(getRepositoryToken(Unidade));
  const usuarioRepo     = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));

  if (pedidoIds.length > 0) {
    for (const pid of pedidoIds) {
      await pagamentoRepo.delete({ pedidoId: pid });
      await itemPedidoRepo.delete({ pedidoId: pid });
    }
    await pedidoRepo.delete(pedidoIds);
  }

  await estoqueRepo.delete({ unidadeId: ctx.unidadeId });
  await produtoRepo.delete(ctx.produtoId);
  await unidadeRepo.delete(ctx.unidadeId);

  await usuarioRepo.delete({ email: `${PREFIX}_cliente@test.com` });
  await usuarioRepo.delete({ email: `${PREFIX}_cozinha@test.com` });
  await usuarioRepo.delete({ email: `${PREFIX}_atendente@test.com` });
  await usuarioRepo.delete({ email: `${PREFIX}_gerente@test.com` });
}
