import request from 'supertest';
import {
  criarApp,
  seedTestData,
  limparTestData,
  TestContext,
} from './helpers/test-setup';
import { INestApplication } from '@nestjs/common';

describe('Caminho Feliz — Fluxo Completo (E2E)', () => {
  let app: INestApplication;
  let ctx: TestContext;

  const pedidosCriados: string[] = [];

  beforeAll(async () => {
    app = await criarApp();
    ctx = await seedTestData(app);
  });

  afterAll(async () => {
    await limparTestData(app, ctx, pedidosCriados);
    await app.close();
  });

  describe('T01 — Autenticação', () => {
    it('deve retornar accessToken ao fazer login com credenciais válidas', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/auth/login')
        .send({
          email: `${ctx.clienteId}`,
          senha: 'Senha@123',
        });

      expect(ctx.tokenCliente).toBeDefined();
      expect(typeof ctx.tokenCliente).toBe('string');
      expect(ctx.tokenCliente.split('.')).toHaveLength(3); 
    });

    it('deve retornar envelope correto no login', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/auth/login')
        .send({
          email: `test_login_${Date.now()}@naoexiste.com`,
          senha: 'qualquer',
        });

      expect(res.status).toBe(401);

      expect(res.body).toMatchObject({
        error:   'CREDENCIAIS_INVALIDAS',
        message: expect.any(String),
        details: expect.any(Array),
        timestamp: expect.any(String),
        path:    '/api/v1/auth/login',
      });
    });
  });

  describe('T04 — Criação de pedido', () => {
    it('deve criar pedido com status AGUARDANDO_PAGAMENTO e canalPedido registrado', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'TOTEM',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        canalPedido: 'TOTEM',
        status:      'AGUARDANDO_PAGAMENTO',
        total:       expect.any(Number),
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.itens).toHaveLength(1);
      expect(res.body.total).toBeGreaterThan(0);

      pedidosCriados.push(res.body.id);
    });

    it('deve retornar 422 quando canalPedido não é informado', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({

          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(422);
    });

    it('deve retornar 422 quando canalPedido tem valor inválido', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'VALOR_INVALIDO',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(422);
    });
  });

  describe('T08 — Pagamento mock aprovado', () => {
    let pedidoId: string;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'APP',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      pedidoId = res.body.id;
      pedidosCriados.push(pedidoId);
    });

    it('deve aprovar pagamento e retornar status APROVADO', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pagamentos/mock')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          pedidoId,
          valor:          32.90,
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status:      'APROVADO',
        pedidoStatus: 'PAGO',
      });
      expect(res.body.transacaoId).toBeDefined();
      expect(res.body.transacaoId).toMatch(/^TXN-MOCK-/);
    });

    it('deve recusar pagamento quando formaPagamento é RECUSAR', async () => {

      const pedidoRes = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'WEB',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'RECUSAR',
        });

      const pid = pedidoRes.body.id;
      pedidosCriados.push(pid);

      const res = await request(ctx.httpServer)
        .post('/api/v1/pagamentos/mock')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          pedidoId:       pid,
          valor:          32.90,
          formaPagamento: 'RECUSAR',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('RECUSADO');
      expect(res.body.pedidoStatus).toBe('AGUARDANDO_PAGAMENTO');
    });
  });

  describe('T10 — Fluxo de status: PAGO → EM_PREPARO → PRONTO → ENTREGUE', () => {
    let pedidoId: string;

    beforeAll(async () => {

      const pedidoRes = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'BALCAO',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      pedidoId = pedidoRes.body.id;
      pedidosCriados.push(pedidoId);

      await request(ctx.httpServer)
        .post('/api/v1/pagamentos/mock')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({ pedidoId, valor: 32.90, formaPagamento: 'MOCK' });
    });

    it('Cozinha avança para EM_PREPARO', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/v1/pedidos/${pedidoId}/status`)
        .set('Authorization', `Bearer ${ctx.tokenCozinha}`)
        .send({ novoStatus: 'EM_PREPARO' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        statusAnterior: 'PAGO',
        statusAtual:    'EM_PREPARO',
      });
    });

    it('Cozinha avança para PRONTO', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/v1/pedidos/${pedidoId}/status`)
        .set('Authorization', `Bearer ${ctx.tokenCozinha}`)
        .send({ novoStatus: 'PRONTO' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        statusAnterior: 'EM_PREPARO',
        statusAtual:    'PRONTO',
      });
    });

    it('Atendente avança para ENTREGUE', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/v1/pedidos/${pedidoId}/status`)
        .set('Authorization', `Bearer ${ctx.tokenAtendente}`)
        .send({ novoStatus: 'ENTREGUE' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        statusAnterior: 'PRONTO',
        statusAtual:    'ENTREGUE',
      });
    });

    it('Pedido consultado mostra status ENTREGUE', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/v1/pedidos/${pedidoId}`)
        .set('Authorization', `Bearer ${ctx.tokenCliente}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ENTREGUE');
      expect(res.body.canalPedido).toBe('BALCAO');
    });
  });

  describe('T12 — Listagem com filtro canalPedido', () => {
    it('deve listar apenas pedidos com canalPedido=TOTEM', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/v1/pedidos?canalPedido=TOTEM')
        .set('Authorization', `Bearer ${ctx.tokenGerente}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();

      res.body.data.forEach((p: { canalPedido: string }) => {
        expect(p.canalPedido).toBe('TOTEM');
      });
    });
  });
});