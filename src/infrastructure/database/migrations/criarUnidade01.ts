import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUnidades1775873800404 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'unidades',
        columns: [
          { name: 'id',         type: 'uuid',      isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'nome',       type: 'varchar',   length: '150' },
          { name: 'cnpj',       type: 'varchar',   length: '18', isUnique: true },
          { name: 'endereco',   type: 'varchar',   length: '300' },
          { name: 'ativo',      type: 'boolean',   default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('unidades');
  }
}