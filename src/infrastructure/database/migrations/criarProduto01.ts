import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProdutos1775873800405 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'produtos',
        columns: [
          { name: 'id',         type: 'uuid',      isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'nome',       type: 'varchar',   length: '150' },
          { name: 'descricao',  type: 'text',      isNullable: true },
          { name: 'preco',      type: 'decimal',   precision: 10, scale: 2 },
          { name: 'categoria',  type: 'varchar',   length: '80' },
          { name: 'ativo',      type: 'boolean',   default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('produtos');
  }
}