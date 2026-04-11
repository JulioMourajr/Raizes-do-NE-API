import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateFidelidade1775873800409 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'fidelidade',
        columns: [
          { name: 'id',               type: 'uuid',      isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'cliente_id',       type: 'uuid',      isUnique: true },
          { name: 'pontos_saldo',     type: 'int',       default: 0 },
          { name: 'ativo',            type: 'boolean',   default: false },
          { name: 'consentimento_at', type: 'timestamp', isNullable: true },
        ],
      }),
    );

    await queryRunner.createForeignKey('fidelidade', new TableForeignKey({
      columnNames: ['cliente_id'],
      referencedTableName: 'usuarios',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('fidelidade');
  }
}