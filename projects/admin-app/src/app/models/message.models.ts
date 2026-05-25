export type MessageStatus = 'new' | 'read' | 'archived' | 'spam';

export const MESSAGE_STATUSES: MessageStatus[] = ['new', 'read', 'archived', 'spam'];

export interface MessageSummary {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  preview: string;
  locale: string;
  status: MessageStatus;
  createdAt: string;
  readAt: string | null;
}

export interface MessageDetail {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  locale: string;
  status: MessageStatus;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  readAt: string | null;
  updatedAt: string;
}

export interface MessagesListResponse {
  items: MessageSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MessagesListQuery {
  status?: MessageStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}
