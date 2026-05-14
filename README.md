# Raízes do Nordeste — API Back-End

API REST para a rede de lanchonetes **Raízes do Nordeste**, desenvolvida como Projeto Multidisciplinar da Trilha Back-End — UNINTER 2026.

---

## Tecnologias

| Tecnologia | Versão | Função |
|---|---|---|
| Node.js | 18+ | Runtime |
| NestJS | 10+ | Framework |
| TypeScript | 5+ | Linguagem |
| TypeORM | 0.3+ | ORM |
| PostgreSQL | 15+ | Banco de dados |
| JWT | — | Autenticação |
| Swagger/OpenAPI | — | Documentação |
| bcrypt | — | Hash de senhas |

---

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- PostgreSQL 15 rodando localmente

Verifique as versões:

```bash
node --version
npm --version
psql --version
```

---

## Configuração do ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/raizes-nordeste-api.git
cd raizes-nordeste-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_aqui
DATABASE_NAME=raizes_nordeste

JWT_SECRET=uma_chave_secreta_muito_longa_e_segura_aqui
JWT_EXPIRES_IN=3600s

PORT=3000
NODE_ENV=development
```

### 4. Crie o banco de dados

Abra o psql ou pgAdmin e execute:

```sql
CREATE DATABASE raizes_nordeste;
```

Em seguida, habilite a extensão de UUID:

```sql
\c raizes_nordeste
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## Executando o projeto

### Passo 1 — Rodar as migrations

Cria todas as tabelas no banco com as foreign keys e constraints corretas:

```bash
npm run migration:run
```

Saída esperada: 8 migrations executadas em sequência sem erros.

### Passo 2 — Popular o banco com dados iniciais (seed)

Cria os usuários, unidades, produtos e estoques necessários para testar:

```bash
npm run seed
```

Usuários criados pelo seed:

| Perfil | E-mail | Senha |
|---|---|---|
| ADMIN | admin@raizesnordeste.com | Admin@123 |
| GERENTE | gerente@raizesnordeste.com | Gerente@123 |
| CLIENTE | maria@email.com | Cliente@123 |
| COZINHA | cozinha@raizesnordeste.com | Cozinha@123 |
| ATENDENTE | atendente@raizesnordeste.com | Atendente@123 |

### Passo 3 — Iniciar a API

```bash
npm run start:dev
```

Saída esperada:

```
Aplicação rodando em: http://localhost:3000
Swagger disponível em: http://localhost:3000/api/docs
```

---

## Executando com Docker

> Pré-requisito: [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados.

### 1. Suba os containers

```bash
docker compose up --build
```

O comando:
- Constrói a imagem da API (multi-stage build)
- Sobe um container PostgreSQL 15
- Aguarda o banco estar pronto
- Executa todas as migrations automaticamente
- Popula o banco com os dados iniciais (seed)
- Inicia a API na porta **3000**

Saída esperada ao final:

```
raizes-api  | PostgreSQL disponível.
raizes-api  | Executando migrations...
raizes-api  | Aplicação rodando em: http://localhost:3000
raizes-api  | Swagger disponível em: http://localhost:3000/api/docs
```

### 2. Parar os containers

```bash
docker compose down
```

Para remover também o volume do banco (apaga todos os dados):

```bash
docker compose down -v
```

### Variáveis de ambiente no Docker

As variáveis já estão definidas no `docker-compose.yml`. Para customizá-las (ex.: trocar senhas em produção), edite a seção `environment` do serviço `api` antes de subir os containers.

---

## Documentação da API

Acesse o Swagger com a API rodando:

```
http://localhost:3000/api/docs
```

Todos os endpoints estão documentados com exemplos de request, response e códigos de status.

---

## Caminho feliz — fluxo completo de ponta a ponta

Este roteiro demonstra o fluxo completo: cadastro → pedido → pagamento → preparo → entrega.

> Substitua os UUIDs pelos valores reais retornados pela sua API.

---

### Etapa 1 — Cadastrar cliente (público)

**POST** `http://localhost:3000/api/v1/usuarios`

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "Cliente@123"
}
```

Resposta `201`:
```json
{
  "id": "uuid-maria",
  "nome": "Maria Silva",
  "perfil": "CLIENTE"
}
```

---

### Etapa 2 — Login da Maria

**POST** `http://localhost:3000/api/v1/auth/login`

```json
{
  "email": "maria@email.com",
  "senha": "Cliente@123"
}
```

Resposta `200`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

> Copie o `accessToken`. No Insomnia: Auth > Bearer > cole o token.

---

### Etapa 3 — Consultar unidades (público)

**GET** `http://localhost:3000/api/v1/unidades`

Resposta `200`:
```json
{
  "data": [
    {
      "id": "uuid-unidade",
      "nome": "Raízes do Nordeste — Boa Viagem"
    }
  ]
}
```

> Salve o `id` da unidade.

---

### Etapa 4 — Ver cardápio da unidade (público)

**GET** `http://localhost:3000/api/v1/unidades/{id}/cardapio`

Resposta `200`:
```json
{
  "unidade": { "nome": "Raízes do Nordeste — Boa Viagem" },
  "totalProdutos": 5,
  "produtos": [
    {
      "produtoId": "uuid-produto",
      "nome": "X-Nordestino",
      "preco": 32.90,
      "disponivel": true
    }
  ]
}
```

> Salve o `produtoId` de um produto disponível.

---

### Etapa 5 — Maria cria o pedido no totem

**POST** `http://localhost:3000/api/v1/pedidos`
**Header:** `Authorization: Bearer {token da Maria}`

```json
{
  "canalPedido": "TOTEM",
  "unidadeId": "uuid-unidade",
  "itens": [
    { "produtoId": "uuid-produto", "quantidade": 2 }
  ],
  "formaPagamento": "MOCK"
}
```

Resposta `201`:
```json
{
  "id": "uuid-pedido",
  "canalPedido": "TOTEM",
  "status": "AGUARDANDO_PAGAMENTO",
  "total": 65.80
}
```

> Salve o `id` do pedido. Status inicial: `AGUARDANDO_PAGAMENTO`.

---

### Etapa 6 — Maria processa o pagamento

**POST** `http://localhost:3000/api/v1/pagamentos/mock`
**Header:** `Authorization: Bearer {token da Maria}`

```json
{
  "pedidoId": "uuid-pedido",
  "valor": 65.80,
  "formaPagamento": "MOCK"
}
```

Resposta `200`:
```json
{
  "transacaoId": "TXN-MOCK-1744365900-AB3XY",
  "status": "APROVADO",
  "pedidoStatus": "PAGO"
}
```

> Status do pedido agora: `PAGO`.

---

### Etapa 7 — Login da Cozinha

**POST** `http://localhost:3000/api/v1/auth/login`

```json
{
  "email": "cozinha@raizesnordeste.com",
  "senha": "Cozinha@123"
}
```

> Troque o token no Insomnia pelo token da cozinha.

---

### Etapa 8 — Cozinha coloca em preparo

**PATCH** `http://localhost:3000/api/v1/pedidos/{id}/status`
**Header:** `Authorization: Bearer {token da Cozinha}`

```json
{ "novoStatus": "EM_PREPARO" }
```

Resposta `200`:
```json
{
  "statusAnterior": "PAGO",
  "statusAtual": "EM_PREPARO"
}
```

---

### Etapa 9 — Cozinha marca como pronto

**PATCH** `http://localhost:3000/api/v1/pedidos/{id}/status`
**Header:** `Authorization: Bearer {token da Cozinha}`

```json
{ "novoStatus": "PRONTO" }
```

Resposta `200`:
```json
{
  "statusAnterior": "EM_PREPARO",
  "statusAtual": "PRONTO"
}
```

---

### Etapa 10 — Login do Atendente

**POST** `http://localhost:3000/api/v1/auth/login`

```json
{
  "email": "atendente@raizesnordeste.com",
  "senha": "Atendente@123"
}
```

> Troque o token pelo token do atendente.

---

### Etapa 11 — Atendente entrega o pedido

**PATCH** `http://localhost:3000/api/v1/pedidos/{id}/status`
**Header:** `Authorization: Bearer {token do Atendente}`

```json
{ "novoStatus": "ENTREGUE" }
```

Resposta `200`:
```json
{
  "statusAnterior": "PRONTO",
  "statusAtual": "ENTREGUE"
}
```

---

### Etapa 12 — Maria consulta o pedido finalizado

**GET** `http://localhost:3000/api/v1/pedidos/{id}`
**Header:** `Authorization: Bearer {token da Maria}`

Resposta `200`:
```json
{
  "id": "uuid-pedido",
  "canalPedido": "TOTEM",
  "status": "ENTREGUE",
  "total": 65.80
}
```

> Fluxo completo concluído. Maria feliz.

---

## Scripts disponíveis

```bash
npm run start:dev       # Inicia em modo desenvolvimento com hot-reload
npm run build           # Compila TypeScript para JavaScript
npm run start:prod      # Inicia em modo produção

npm run migration:run   # Aplica todas as migrations pendentes
npm run migration:revert # Reverte a última migration
npm run migration:generate -- src/infrastructure/database/migrations/NomeDaMigration # Gera nova migration

npm run seed            # Popula o banco com dados iniciais
```

---

## Estrutura do projeto

```
src/
├── domain/               # Regras de negócio — independente de framework
│   ├── entities/         # Entidades com comportamento (Pedido, Estoque...)
│   ├── enums/            # Valores fechados (CanalPedido, StatusPedido...)
│   ├── exceptions/       # Erros de negócio (EstoqueInsuficiente...)
│   └── repositories/     # Interfaces dos repositórios (contratos)
│
├── application/          # Casos de uso — orquestra o domínio
│   ├── use-cases/        # CriarPedido, ProcessarPagamento, AtualizarStatus
│   ├── dtos/             # Objetos de transferência com validação
│   └── ports/            # Interfaces de serviços externos (gateway)
│
├── infrastructure/       # Implementações concretas
│   ├── database/         # Migrations e seeds
│   ├── repositories/     # Implementações TypeORM dos repositórios
│   ├── gateways/         # PagamentoMockGateway
│   └── logging/          # AuditLogger
│
└── api/                  # Interface HTTP
    ├── controllers/      # Recebem requisições e delegam aos use cases
    ├── guards/           # JwtAuthGuard, RolesGuard, JwtStrategy
    ├── decorators/       # @Public(), @Roles(), @UsuarioAtual()
    └── middlewares/      # GlobalExceptionFilter (padrão de erro)
```

---

## Padrão de erro

Todos os erros retornam o mesmo envelope JSON:

```json
{
  "error": "NOME_DO_ERRO",
  "message": "Mensagem legível para o usuário.",
  "details": [
    { "field": "campo", "issue": "descrição do problema" }
  ],
  "timestamp": "2026-04-11T10:00:00Z",
  "path": "/api/v1/rota"
}
```

---

## Segurança e LGPD

- Senhas armazenadas com hash bcrypt (fator 10)
- CPF armazenado como hash — dado sensível nunca em texto puro
- Autenticação via JWT com expiração configurável
- Autorização por perfis (CLIENTE, ATENDENTE, COZINHA, GERENTE, ADMIN)
- Dados sensíveis nunca expostos nas respostas (senhaHash, cpfHash)
- Consentimento do programa de fidelidade registrado com timestamp e versão da política
- Log de auditoria em ações sensíveis: criação de pedido, mudança de status, pagamento

---

## Coleção de testes

O arquivo `raizes-nordeste.insomnia.json` na raiz do repositório contém todos os cenários do plano de testes organizados por pasta. Importe no Insomnia via:

`File > Import > From File > raizes-nordeste.insomnia.json`

---

## Uso de IA

Ferramenta utilizada: Claude (Anthropic) — para orientação técnica, revisão de estrutura e explicação de conceitos.

Prompts utilizados: orientação sobre arquitetura em camadas NestJS/TypeORM, explicação do padrão de migrations, revisão de erros de compilação TypeScript.

Todo o código foi escrito, compreendido e adaptado pelo autor. A lógica de negócio, nomes de variáveis, organização de módulos e decisões de implementação são de autoria própria.