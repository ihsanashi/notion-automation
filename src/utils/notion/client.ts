import dotenv from 'dotenv';

import { Client } from '@notionhq/client';

dotenv.config();

export const createNotionClient = () => {
  if (!process.env.NOTION_API_KEY) {
    throw new Error('NOTION_API_KEY environment variable is missing');
  }

  return new Client({
    auth: process.env.NOTION_API_KEY,
  });
};
