export interface Incident {
  id: string;
  type: string;
  level: string;
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  status: string;
  aiCategory: string;
  location: string;
  viewCamAvailable?: boolean;
}

export interface SystemLog {
  time: string;
  text: string;
  type: 'system' | 'info' | 'alert' | 'comm';
}

export interface SentimentWord {
  word: string;
  weight: number;
  color: string;
}

export interface Telemetry {
  attendance: {
    capacity: number;
    activeInBowl: number;
    inConcourse: number;
    totalCount: number;
  };
  multilingual: Array<{
    lang: string;
    volunteers: number;
    requests: number;
    percent: number;
  }>;
  transit: Array<{
    name: string;
    hub: string;
    time: string;
    status: string;
  }>;
  weather: {
    temp: string;
    condition: string;
    humidity: string;
    wind: string;
    precipitation: string;
  };
  inclusionScore: string;
  avgResponseTime: string;
  feedbackScans: number;
}

export interface CommandState {
  incidents: Incident[];
  systemLogs: SystemLog[];
  sentimentWords: SentimentWord[];
  telemetry: Telemetry;
}
