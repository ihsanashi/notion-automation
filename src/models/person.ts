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
