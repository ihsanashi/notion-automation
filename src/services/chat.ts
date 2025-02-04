import 'dotenv/config';
import { eq, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { PersonUserObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import * as schema from '@db/schema';

import { WebhookPayload } from '@utils/types';

export class ChatService {
  static async getMatchedUsers(payload: WebhookPayload) {
    const { data } = payload;
    const { properties } = data;

    if (!properties['Contact person(s)']) {
      throw new Error('Invalid webhook payload');
    }

    const contactPersonBlock = properties['Contact person(s)'];

    if (contactPersonBlock.type !== 'people' || !Array.isArray(contactPersonBlock.people)) {
      throw new Error('Invalid contact person format');
    }

    const notionUserEmails = contactPersonBlock.people
      .filter((user): user is PersonUserObjectResponse => user.object === 'user')
      .map((user: PersonUserObjectResponse) => user.person.email)
      .filter((email): email is string => !!email);

    if (notionUserEmails.length === 0) {
      return [];
    }

    const db = drizzle(process.env.DATABASE_URL!, { schema });
    const userContactMethods = await db
      .select({
        name: schema.usersTable.name,
        nickname: schema.usersTable.nickname,
        email: schema.usersTable.email,
        platform_name: schema.platformsTable.name,
        base_url: schema.platformsTable.base_url,
        identifier: schema.userPlatformsTable.identifier,
      })
      .from(schema.usersTable)
      .leftJoin(schema.userPlatformsTable, eq(schema.usersTable.id, schema.userPlatformsTable.user_id))
      .leftJoin(schema.platformsTable, eq(schema.userPlatformsTable.platform_id, schema.platformsTable.id))
      .where(inArray(schema.usersTable.email, notionUserEmails));

    return userContactMethods;
  }
}
