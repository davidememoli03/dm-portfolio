export interface ContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
  locale?: 'it' | 'en';
  hp_field?: string;
}

export interface ContactMessageResponse {
  id: string | null;
}
