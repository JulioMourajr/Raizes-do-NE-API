import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsuarios1775873800403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE perfil_enum AS ENUM (
        'CLIENTE', 'ATENDENTE', 'COZINHA', 'GERENTE', 'ADMIN'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'usuarios',
        columns: [
          { name: 'id',         type: 'uuid',        isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'nome',       type: 'varchar',     length: '150' },
          { name: 'email',      type: 'varchar',     length: '200', isUnique: true },
          { name: 'senha_hash', type: 'varchar' },
          { name: 'cpf_hash',   type: 'varchar',     isNullable: true },
          { name: 'perfil',     type: 'perfil_enum', default: "'CLIENTE'" },
          { name: 'ativo',      type: 'boolean',     default: true },
          { name: 'created_at', type: 'timestamp',   default: 'now()' },
          { name: 'updated_at', type: 'timestamp',   default: 'now()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('usuarios');
    await queryRunner.query(`DROP TYPE IF EXISTS perfil_enum`);
  }
}