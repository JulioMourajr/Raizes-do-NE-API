import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateItensPedido1775873800408 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'itens_pedido',
        columns: [
          { name: 'id',             type: 'uuid',      isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'pedido_id',      type: 'uuid' },
          { name: 'produto_id',     type: 'uuid' },
          { name: 'quantidade',     type: 'int' },
          { name: 'preco_unitario', type: 'decimal',   precision: 10, scale: 2 },
        ],
      }),
    );

    await queryRunner.createForeignKey('itens_pedido', new TableForeignKey({
      columnNames: ['pedido_id'],
      referencedTableName: 'pedidos',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('itens_pedido', new TableForeignKey({
      columnNames: ['produto_id'],
      referencedTableName: 'produtos',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('itens_pedido');
  }
}