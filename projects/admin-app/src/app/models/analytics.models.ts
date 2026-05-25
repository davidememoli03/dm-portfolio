export interface AnalyticsOverview {
  periodDays: number;
  totals: {
    views: number;
    sessions: number;
  };
  today: {
    views: number;
    sessions: number;
  };
  viewsByDay: Array<{
    day: string;
    views: number;
    sessions: number;
  }>;
  topCountries: Array<{
    country: string | null;
    label: string;
    count: number;
  }>;
  topReferrers: Array<{
    referrer: string | null;
    label: string;
    count: number;
  }>;
  locales: Array<{
    locale: string;
    count: number;
  }>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
    unknown: number;
  };
  recentViews: Array<{
    sessionId: string;
    path: string;
    referrer: string | null;
    referrerLabel: string;
    locale: string | null;
    deviceType: string;
    ipAddress: string | null;
    country: string | null;
    countryLabel: string;
    region: string | null;
    city: string | null;
    location: string;
    createdAt: string;
  }>;
}
