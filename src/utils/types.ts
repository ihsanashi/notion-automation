import {
  FileBlockObjectResponse,
  PageObjectResponse,
  PartialUserObjectResponse,
  RichTextItemResponse,
  UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

type StringRequest = string;
type TextRequest = string;

export type ExternalFileBlock = Extract<
  FileBlockObjectResponse['file'],
  { type: 'external' }
>;

export type WebhookPayload = {
  source: {
    type: string;
    automation_id: string;
    action_id: string;
    event_id: string;
    attempt: number;
  };
  data: PageObjectResponse;
};

export type TitleType = {
  type: 'title';
  title: Array<RichTextItemResponse>;
  id: string;
};

export type PeopleType = {
  type: 'people';
  people: Array<PartialUserObjectResponse | UserObjectResponse>;
  id: string;
};

export type FileType = {
  type: 'files';
  files: Array<
    | {
        file: {
          url: string;
          expiry_time: string;
        };
        name: StringRequest;
        type?: 'file';
      }
    | {
        external: {
          url: TextRequest;
        };
        name: StringRequest;
        type?: 'external';
      }
  >;
  id: string;
};

export type UserContactRequestParam = {
  name: string;
  nickname: string | null;
  email: string;
  platform_name: string | null;
  base_url: string | null;
  identifier: string | null;
};

export type UserContactResponse = {
  name: string;
  external: { url: string };
};
