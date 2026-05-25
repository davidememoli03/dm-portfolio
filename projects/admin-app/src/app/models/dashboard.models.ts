import { MessageStatus } from './message.models';

export interface DashboardOverview {
  periodDays: number;
  messages: {
    byStatus: Record<MessageStatus, number>;
    total: number;
    today: number;
    byDay: Array<{ day: string; count: number }>;
    recent: Array<{
      id: string;
      name: string;
      email: string;
      subject: string | null;
      status: MessageStatus;
      createdAt: string;
    }>;
  };
  traffic: {
    totals: { views: number; sessions: number };
    today: { views: number; sessions: number };
    byDay: Array<{ day: string; views: number; sessions: number }>;
    topCountries: Array<{ country: string | null; label: string; count: number }>;
    devices: {
      desktop: number;
      mobile: number;
      tablet: number;
      unknown: number;
    };
  };
}
