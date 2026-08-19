# Raízes do Nordeste — API Back-End

API REST para a rede de lanchonetes **Raízes do Nordeste**, desenvolvida como Projeto Multidisciplinar da Trilha Back-End — UNINTER 2026.

---

## Tecnologias

| Tecnologia | Versão | Função |
| :--- | :--- | :--- |
| **Node.js** | 18+ | Runtime |
| **NestJS** | 10+ | Framework |
| **TypeScript** | 5+ | Linguagem |
| **TypeORM** | 0.3+ | ORM |
| **PostgreSQL** | 15+ | Banco de dados |
| **JWT** | — | Autenticação |
| **Swagger/OpenAPI** | — | Documentação |
| **bcrypt** | — | Hash de senhas |

---

## Pré-requisitos

Antes de iniciar, certifique-se de ter os seguintes softwares instalados:

* **Node.js** 18 ou superior
* **npm** 9 ou superior
* **PostgreSQL** 15 rodando localmente

Verifique as versões no terminal:

```bash
node --version
npm --version
psql --version
```

---

## Configuração do Ambiente

=== "1. Clone e Instalação"

    Clone o repositório e instale as dependências:

    ```bash
    git clone https://github.com/seu-usuario/raizes-nordeste-api.git
    cd raizes-nordeste-api
    npm install
    ```

=== "2. Variáveis de Ambiente"

    Copie o arquivo de exemplo e configure suas variáveis:

    ```bash
    cp .env.example .env
    ```

    Edite o arquivo `.env`:

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

=== "3. Banco de Dados"

    Abra o `psql` ou pgAdmin e crie o banco com a extensão de UUID:

    ```sql
    CREATE DATABASE raizes_nordeste;
    \c raizes_nordeste
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    ```

---

## Executando o Projeto

=== "Local (NPM)"

    ### Passo 1 — Executar Migrations

    Cria todas as tabelas no banco com foreign keys e constraints:

    ```bash
    npm run migration:run
    ```

    *Saída esperada: 8 migrations executadas em sequência sem erros.*

    ### Passo 2 — Seed (Dados Iniciais)

    Popula o banco com usuários, unidades, produtos e estoques:

    ```bash
    npm run seed
    ```

    ### Passo 3 — Iniciar API

    ```bash
    npm run start:dev
    ```

    !!! success "Aplicação On-line"
        * **API:** `http://localhost:3000`
        * **Swagger:** `http://localhost:3000/api/docs`

=== "Docker"

    !!! info "Pré-requisitos Docker"
        Certifique-se de ter o [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados.

    ### Subir Containers

    ```bash
    docker compose up --build
    ```

    *O Docker irá construir a imagem, aguardar o PostgreSQL, rodar migrations/seeds e expor a API na porta **3000**.*

    ### Encerrar Containers

    ```bash
    # Parar serviços
    docker compose down

    # Parar e remover volumes (apaga os dados do banco)
    docker compose down -v
    ```

---

## Contas Padrão (Seed)

Usuários criados automaticamente pelo comando de seed para testes:

| Perfil | E-mail | Senha |
| :--- | :--- | :--- |
| ADMIN | admin@raizesnordeste.com | Admin@123 |
| GERENTE | gerente@raizesnordeste.com | Gerente@123 |
| CLIENTE | maria@email.com | Cliente@123 |
| COZINHA | cozinha@raizesnordeste.com | Cozinha@123 |
| ATENDENTE | atendente@raizesnordeste.com | Atendente@123 |

---

## Fluxo de Execução (Caminho Feliz)

Demonstração do ciclo completo: Cadastro → Pedido → Pagamento → Preparo → Entrega.

!!! tip "Substituição de UUIDs"
    Substitua os IDs genéricos das requisições pelos UUIDs reais retornados pela API nas etapas anteriores.

=== "1. Cliente & Autenticação"

    **1. Cadastrar cliente (público)**
    `POST /api/v1/usuarios`
    ```json
    {
      "nome": "Maria Silva",
      "email": "maria@email.com",
      "senha": "Cliente@123"
    }
    ```

    **2. Login da Maria**
    `POST /api/v1/auth/login`
    ```json
    {
      "email": "maria@email.com",
      "senha": "Cliente@123"
    }
    ```
    *Guarde o `accessToken` retornado para enviar no header `Authorization: Bearer {token}`.*

=== "2. Cardápio & Pedido"

    **3. Consultar unidades (público)**
    `GET /api/v1/unidades`

    **4. Ver cardápio da unidade (público)**
    `GET /api/v1/unidades/{id}/cardapio`

    **5. Criar pedido no totem**
    `POST /api/v1/pedidos` *(Bearer Token da Maria)*
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

=== "3. Pagamento & Preparo"

    **6. Processar pagamento**
    `POST /api/v1/pagamentos/mock` *(Bearer Token da Maria)*
    ```json
    {
      "pedidoId": "uuid-pedido",
      "valor": 65.80,
      "formaPagamento": "MOCK"
    }
    ```

    **7. Login e Ação da Cozinha**
    `PATCH /api/v1/pedidos/{id}/status` *(Bearer Token da Cozinha)*
    ```json
    // Primeiro mover para preparo:
    { "novoStatus": "EM_PREPARO" }

    // Depois mover para pronto:
    { "novoStatus": "PRONTO" }
    ```

=== "4. Entrega"

    **8. Atendente entrega o pedido**
    `PATCH /api/v1/pedidos/{id}/status` *(Bearer Token do Atendente)*
    ```json
    { "novoStatus": "ENTREGUE" }
    ```

    **9. Consulta final do pedido**
    `GET /api/v1/pedidos/{id}` *(Bearer Token da Maria)*

---

## Estrutura do Projeto

```plaintext
src/
├── domain/               # Regras de negócio (Entities, Enums, Exceptions, Repositories)
├── application/          # Casos de uso e DTOs (Use-cases, DTOs, Ports)
├── infrastructure/       # Implementações concretas (Database, Migrations, Gateways)
└── api/                  # Interface HTTP (Controllers, Guards, Decorators, Filters)
```

---

## Padrão de Resposta de Erros

Todos os erros lançados pela API seguem o envelope padrão:

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

!!! warning "Conformidade e Proteção de Dados"
    * Senhas: Armazenadas com hash bcrypt (fator de custo 10).
    * CPF: Armazenado exclusivamente como hash — dados sensíveis nunca trafegam ou persistem em texto puro.
    * JWT: Autenticação stateless com tempo de expiração configurável via .env.
    * RBAC: Autorização por papéis (CLIENTE, ATENDENTE, COZINHA, GERENTE, ADMIN).
    * LGPD: Registro do consentimento ao programa de fidelidade com timestamp e versão dos termos.

---

## Scripts Disponíveis

| Script | Descrição |
| :--- | :--- |
| `npm run start:dev` | Inicia a aplicação em modo desenvolvimento (Hot-reload) |
| `npm run build` | Compila o projeto de TypeScript para JavaScript |
| `npm run start:prod` | Executa o build compilado em produção |
| `npm run migration:run` | Executa as migrations pendentes no banco de dados |
| `npm run migration:revert` | Reverte a última migration executada |
| `npm run seed` | Popula o banco com os dados iniciais |

---

## Coleção de Testes e IA

!!! note "Importação de Testes"
    O arquivo `raizes-nordeste.insomnia.json` está disponível na raiz do repositório para importação direta no Insomnia (File > Import).

**Declaração do Uso de IA:**

Ferramenta utilizada: Claude (Anthropic) — auxílio em suporte arquitetural, revisão de TypeScript e padronização de erros. A lógica de negócio, implementação das entidades e validações foram desenvolvidas e revisadas integralmente pelo autor.