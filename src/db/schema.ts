import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  nickname: varchar(),
  email: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const platformsTable = pgTable('platforms', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 50 }).notNull().default('Platform name'),
  base_url: varchar({ length: 255 }).notNull().default('https://example.com'),
});

export const userPlatformsTable = pgTable(
  'user_platforms',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer()
      .notNull()
      .references(() => usersTable.id),
    platform_id: integer()
      .notNull()
      .references(() => platformsTable.id),
    identifier: varchar({ length: 255 }).notNull(),
    metadata: jsonb(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.user_id, table.platform_id)]
);
