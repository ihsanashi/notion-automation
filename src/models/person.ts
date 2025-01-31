import pool from '@config/db';

import { logger } from '@utils/logger';

import { BaseEntity } from './common';

export interface Person extends BaseEntity {
  id: number;
  name: string;
  email: string;
  nickname?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Platform {
  id: number;
  name: string;
}

export interface PersonPlatform extends BaseEntity {
  id: number;
  person_id: number;
  platform_id: number;
  identifier: string;
}

export class PersonModel {
  static async getMatchedPeople(emails: string[]): Promise<Person[]> {
    try {
      if (emails.length === 0) return [];

      const query = `
        SELECT * FROM person
        WHERE notion_user_id = ANY($1)
      `;
      const { rows } = await pool.query(query, [emails]);
      return rows;
    } catch (error) {
      logger.error('Error fetching matched people: ', error);
      throw new Error('Database query failed');
    }
  }
}
