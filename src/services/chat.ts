import { PersonUserObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import { WebhookPayload } from '@utils/types';

export class ChatService {
  static async getMatchedPeople(payload: WebhookPayload) {
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

    // return PersonModel.getMatchedPeople(notionUserEmails);
  }
}
