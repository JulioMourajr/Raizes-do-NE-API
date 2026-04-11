import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePagamentos1775873800407 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE status_pagamento_enum AS ENUM (
        'PENDENTE', 'APROVADO', 'RECUSADO'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'pagamentos',
        columns: [
          { name: 'id',            type: 'uuid',                  isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'pedido_id',     type: 'uuid',                  isUnique: true },
          { name: 'transacao_id',  type: 'varchar',               isNullable: true },
          { name: 'status',        type: 'status_pagamento_enum', default: "'PENDENTE'" },
          { name: 'motivo_recusa', type: 'varchar',               isNullable: true },
          { name: 'valor',         type: 'decimal',               precision: 10, scale: 2 },
          { name: 'created_at',    type: 'timestamp',             default: 'now()' },
        ],
      }),
    );

    await queryRunner.createForeignKey('pagamentos', new TableForeignKey({
      columnNames: ['pedido_id'],
      referencedTableName: 'pedidos',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pagamentos');
    await queryRunner.query(`DROP TYPE IF EXISTS status_pagamento_enum`);
  }
}