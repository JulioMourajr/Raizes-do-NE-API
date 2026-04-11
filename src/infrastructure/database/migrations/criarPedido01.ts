import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePedidos1775873800406 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE canal_pedido_enum AS ENUM (
        'APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE status_pedido_enum AS ENUM (
        'AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO',
        'PRONTO', 'ENTREGUE', 'CANCELADO'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'pedidos',
        columns: [
          { name: 'id',               type: 'uuid',               isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'cliente_id',       type: 'uuid' },
          { name: 'unidade_id',       type: 'uuid' },
          { name: 'canal_pedido',     type: 'canal_pedido_enum' },
          { name: 'status',           type: 'status_pedido_enum', default: "'AGUARDANDO_PAGAMENTO'" },
          { name: 'total',            type: 'decimal',            precision: 10, scale: 2, default: 0 },
          { name: 'forma_pagamento',  type: 'varchar',            length: '50' },
          { name: 'idempotency_key',  type: 'varchar',            isNullable: true, isUnique: true },
          { name: 'created_at',       type: 'timestamp',          default: 'now()' },
          { name: 'updated_at',       type: 'timestamp',          default: 'now()' },
        ],
      }),
    );

    await queryRunner.createForeignKey('pedidos', new TableForeignKey({
      columnNames: ['cliente_id'],
      referencedTableName: 'usuarios',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));

    await queryRunner.createForeignKey('pedidos', new TableForeignKey({
      columnNames: ['unidade_id'],
      referencedTableName: 'unidades',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pedidos');
    await queryRunner.query(`DROP TYPE IF EXISTS canal_pedido_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS status_pedido_enum`);
  }
}