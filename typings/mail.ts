export interface MailAction {
  label: string;
  event: string;
  isServer: boolean;
  data: unknown;
}

export interface MailMessage {
  id: number;
  folder: 'inbox' | 'sent';
  senderName: string;
  senderAddress: string | null;
  recipientAddress: string;
  subject: string;
  content: string;
  actions: MailAction[];
  read: boolean;
  timestamp: number;
}

export interface MailboxResp {
  address: string;
  messages: MailMessage[];
}

export interface MailSendDTO {
  to: string;
  subject: string;
  content: string;
}

export interface MailIdDTO {
  id: number;
}

export type MailError = 'RECIPIENT_NOT_FOUND' | 'EMPTY_MESSAGE';

export const MAIL_DOMAIN = 'lsmail.com';
export const MAIL_SUBJECT_MAX = 100;
export const MAIL_CONTENT_MAX = 4000;

export enum MailEvents {
  FETCH_MAILBOX = 'npwd:mail:fetchMailbox',
  SEND = 'npwd:mail:send',
  MARK_READ = 'npwd:mail:markRead',
  DELETE = 'npwd:mail:delete',
  RUN_ACTION = 'npwd:mail:runAction',
  NEW_MAIL = 'npwd:mail:newMail',
}
