import { Client } from '@notionhq/client';

export const createNotionClient = () => {
  if (!process.env.NOTION_API_KEY) {
    throw new Error('NOTION_API_KEY environment variable is missing');
  }

  return new Client({
    auth: process.env.NOTION_API_KEY,
  });
};
