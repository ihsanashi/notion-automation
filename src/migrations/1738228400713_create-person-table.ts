import { MigrationBuilder, PgLiteral } from 'node-pg-migrate';

exports.shorthands = {
  id: {
    type: 'uuid',
    primaryKey: true,
  },
  created_at: { type: 'timestamp', notNull: true, default: new PgLiteral('current_timestamp') },
  updated_at: { type: 'timestamp', notNull: true, default: new PgLiteral('current_timestamp') },
};

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('person', {
    id: 'id',
    name: { type: 'TEXT', notNull: true },
    email: { type: 'TEXT', notNull: true, unique: true },
    nickname: { type: 'TEXT', notNull: false },
    created_at: 'created_at',
    updated_at: 'updated_at',
  });

  pgm.createTable('platform', {
    id: 'id',
    name: { type: 'TEXT', notNull: true, unique: true },
    created_at: 'created_at',
    updated_at: 'updated_at',
  });

  // join table
  pgm.createTable('person_platform', {
    id: 'id',
    person_id: { type: 'id', notNull: true, references: 'person', onDelete: 'CASCADE' },
    platform_id: { type: 'id', notNull: true, references: 'platform', onDelete: 'CASCADE' },
    identifier: { type: 'TEXT', notNull: true },
    created_at: 'created_at',
    updated_at: 'updated_at',
  });

  pgm.addConstraint('person_platform', 'unique_person_platform', 'UNIQUE(person_id, platform_id)');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('person_platform');
  pgm.dropTable('platform');
  pgm.dropTable('person');
}
