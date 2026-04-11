import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateEstoque1775873800410 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'estoque',
        columns: [
          { name: 'id',          type: 'uuid',      isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'unidade_id',  type: 'uuid' },
          { name: 'produto_id',  type: 'uuid' },
          { name: 'quantidade',  type: 'int',       default: 0 },
          { name: 'updated_at',  type: 'timestamp', default: 'now()' },
        ],
        uniques: [{ columnNames: ['unidade_id', 'produto_id'] }],
      }),
    );

    await queryRunner.createForeignKey('estoque', new TableForeignKey({
      columnNames: ['unidade_id'],
      referencedTableName: 'unidades',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));

    await queryRunner.createForeignKey('estoque', new TableForeignKey({
      columnNames: ['produto_id'],
      referencedTableName: 'produtos',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('estoque');
  }
}