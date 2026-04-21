import request from 'supertest';
import {
  criarApp,
  seedTestData,
  limparTestData,
  TestContext,
} from './helpers/test-setup';
import { INestApplication } from '@nestjs/common';

describe('Regras de Negócio e Falhas (E2E)', () => {
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

  describe('T02 — Acesso sem token', () => {
    it('GET /pedidos sem Authorization deve retornar 401', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/v1/pedidos');

      expect(res.status).toBe(401);
    });

    it('POST /pedidos sem Authorization deve retornar 401', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .send({
          canalPedido:    'APP',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(401);
    });

    it('resposta 401 deve seguir o padrão de erro do projeto', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/v1/pedidos');

      expect(res.body).toMatchObject({
        error:     'NAO_AUTENTICADO',
        message:   expect.any(String),
        details:   expect.any(Array),
        timestamp: expect.any(String),
        path:      '/api/v1/pedidos',
      });
    });

    it('PATCH /pedidos/:id/status sem token deve retornar 401', async () => {
      const res = await request(ctx.httpServer)
        .patch('/api/v1/pedidos/qualquer-id/status')
        .send({ novoStatus: 'EM_PREPARO' });

      expect(res.status).toBe(401);
    });
  });

  describe('T03 — Perfil sem permissão', () => {
    it('CLIENTE tentando listar pedidos deve receber 403', async () => {

      const res = await request(ctx.httpServer)
        .get('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`);

      expect(res.status).toBe(403);
    });

    it('resposta 403 deve seguir o padrão de erro do projeto', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`);

      expect(res.body).toMatchObject({
        error:     'SEM_PERMISSAO',
        message:   expect.any(String),
        details:   expect.any(Array),
        timestamp: expect.any(String),
        path:      '/api/v1/pedidos',
      });
    });

    it('COZINHA tentando criar pedido deve receber 403', async () => {

      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCozinha}`)
        .send({
          canalPedido:    'TOTEM',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(403);
    });

    it('CLIENTE tentando mudar status de pedido deve receber 403', async () => {
      // PATCH /pedidos/:id/status requer COZINHA, ATENDENTE, GERENTE ou ADMIN
      const res = await request(ctx.httpServer)
        .patch(`/api/v1/pedidos/qualquer-id/status`)
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({ novoStatus: 'EM_PREPARO' });

      expect(res.status).toBe(403);
    });
  });

  describe('T05 — Estoque insuficiente', () => {
    it('deve retornar 409 com envelope ESTOQUE_INSUFICIENTE', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'APP',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 9999 }],
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        error:     'ESTOQUE_INSUFICIENTE',
        message:   expect.any(String),
        details:   expect.any(Array),
        timestamp: expect.any(String),
        path:      '/api/v1/pedidos',
      });
    });

    it('details deve conter o campo e o estoque disponível', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'WEB',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 9999 }],
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(409);
      expect(res.body.details).toBeInstanceOf(Array);
      expect(res.body.details.length).toBeGreaterThan(0);
      expect(res.body.details[0]).toHaveProperty('field');
      expect(res.body.details[0]).toHaveProperty('issue');
    });
  });

  describe('T06 — Validação do campo canalPedido', () => {
    it('deve retornar 422 quando canalPedido está ausente', async () => {
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

    it('deve retornar 422 quando canalPedido tem valor fora do ENUM', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'DRIVE_THRU', 
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(422);
    });

    it('deve aceitar todos os valores válidos do ENUM', async () => {
      const canaisValidos = ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'];

      for (const canal of canaisValidos) {
        const res = await request(ctx.httpServer)
          .post('/api/v1/pedidos')
          .set('Authorization', `Bearer ${ctx.tokenCliente}`)
          .send({
            canalPedido:    canal,
            unidadeId:      ctx.unidadeId,
            itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
            formaPagamento: 'MOCK',
          });

        expect(res.status).toBe(201);
        expect(res.body.canalPedido).toBe(canal);
        pedidosCriados.push(res.body.id);
      }
    });
  });

  describe('T07 — Produto inexistente', () => {
    it('deve retornar 404 quando o produtoId não existe', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'PICKUP',
          unidadeId:      ctx.unidadeId,
          itens:          [{
            produtoId: '00000000-0000-0000-0000-000000000000',
            quantidade: 1,
          }],
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(404);
    });

    it('deve retornar 404 quando a unidade não existe', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'APP',
          unidadeId:      '00000000-0000-0000-0000-000000000000',
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      expect(res.status).toBe(404);
    });
  });

  describe('T09 — Pagamento mock recusado', () => {
    let pedidoId: string;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'TOTEM',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'RECUSAR',
        });

      pedidoId = res.body.id;
      pedidosCriados.push(pedidoId);
    });

    it('deve retornar RECUSADO e manter pedido em AGUARDANDO_PAGAMENTO', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/v1/pagamentos/mock')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          pedidoId,
          valor:          32.90,
          formaPagamento: 'RECUSAR',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('RECUSADO');
      expect(res.body.pedidoStatus).toBe('AGUARDANDO_PAGAMENTO');
      expect(res.body.motivo).toBeDefined();
    });

    it('pedido deve continuar em AGUARDANDO_PAGAMENTO após recusa', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/v1/pedidos/${pedidoId}`)
        .set('Authorization', `Bearer ${ctx.tokenCliente}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('AGUARDANDO_PAGAMENTO');
    });
  });

  describe('T11 — Transição de status inválida', () => {
    let pedidoId: string;

    beforeAll(async () => {

      const pedidoRes = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'APP',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      pedidoId = pedidoRes.body.id;
      pedidosCriados.push(pedidoId);

      // Paga
      await request(ctx.httpServer)
        .post('/api/v1/pagamentos/mock')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({ pedidoId, valor: 32.90, formaPagamento: 'MOCK' });

      // Preparo
      await request(ctx.httpServer)
        .patch(`/api/v1/pedidos/${pedidoId}/status`)
        .set('Authorization', `Bearer ${ctx.tokenCozinha}`)
        .send({ novoStatus: 'EM_PREPARO' });

      // Pronto
      await request(ctx.httpServer)
        .patch(`/api/v1/pedidos/${pedidoId}/status`)
        .set('Authorization', `Bearer ${ctx.tokenCozinha}`)
        .send({ novoStatus: 'PRONTO' });

      // Entregue
      await request(ctx.httpServer)
        .patch(`/api/v1/pedidos/${pedidoId}/status`)
        .set('Authorization', `Bearer ${ctx.tokenAtendente}`)
        .send({ novoStatus: 'ENTREGUE' });
    });

    it('deve retornar 409 ao tentar voltar de ENTREGUE para EM_PREPARO', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/v1/pedidos/${pedidoId}/status`)
        .set('Authorization', `Bearer ${ctx.tokenCozinha}`)
        .send({ novoStatus: 'EM_PREPARO' });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        error:     'TRANSICAO_INVALIDA',
        message:   expect.any(String),
        timestamp: expect.any(String),
        path:      `/api/v1/pedidos/${pedidoId}/status`,
      });
    });

    it('deve retornar 409 ao tentar voltar de ENTREGUE para CANCELADO', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/v1/pedidos/${pedidoId}/status`)
        .set('Authorization', `Bearer ${ctx.tokenAtendente}`)
        .send({ novoStatus: 'CANCELADO' });

      expect(res.status).toBe(409);
    });

    it('deve retornar 409 ao pular de AGUARDANDO_PAGAMENTO direto para EM_PREPARO', async () => {

      const novoPedido = await request(ctx.httpServer)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${ctx.tokenCliente}`)
        .send({
          canalPedido:    'BALCAO',
          unidadeId:      ctx.unidadeId,
          itens:          [{ produtoId: ctx.produtoId, quantidade: 1 }],
          formaPagamento: 'MOCK',
        });

      pedidosCriados.push(novoPedido.body.id);

      const res = await request(ctx.httpServer)
        .patch(`/api/v1/pedidos/${novoPedido.body.id}/status`)
        .set('Authorization', `Bearer ${ctx.tokenCozinha}`)
        .send({ novoStatus: 'EM_PREPARO' });

      expect(res.status).toBe(409);
    });
  });

  describe('Cardápio — rota pública', () => {
    it('deve retornar cardápio sem precisar de token', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/v1/unidades/${ctx.unidadeId}/cardapio`);

      expect(res.status).toBe(200);
      expect(res.body.unidade).toBeDefined();
      expect(res.body.produtos).toBeInstanceOf(Array);
      expect(res.body.totalProdutos).toBeGreaterThanOrEqual(0);
    });

    it('deve retornar 404 para unidade inexistente', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/v1/unidades/00000000-0000-0000-0000-000000000000/cardapio');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('UNIDADE_NAO_ENCONTRADA');
    });

    it('deve filtrar por categoria', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/v1/unidades/${ctx.unidadeId}/cardapio?categoria=LANCHES`);

      expect(res.status).toBe(200);
      res.body.produtos.forEach((p: { categoria: string }) => {
        expect(p.categoria).toBe('LANCHES');
      });
    });
  });
});