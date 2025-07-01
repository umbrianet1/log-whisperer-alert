
export interface AppConfig {
  graylog: {
    url: string;
    username: string;
    password: string;
    apiToken: string;
  };
  openwebui: {
    url: string;
    apiKey: string;
    model: string;
  };
  notifications: {
    email: {
      enabled: boolean;
      smtp: string;
      port: number;
      username: string;
      password: string;
      recipients: string;
    };
    telegram: {
      enabled: boolean;
      botToken: string;
      chatId: string;
    };
  };
  alertRules: {
    cpuThreshold: number;
    memoryThreshold: number;
    diskThreshold: number;
    failedLoginsThreshold: number;
  };
}

const DEFAULT_CONFIG: AppConfig = {
  graylog: {
    url: 'http://localhost:9000',
    username: 'admin',
    password: '',
    apiToken: ''
  },
  openwebui: {
    url: 'http://localhost:3000',
    apiKey: '',
    model: 'llama3.1'
  },
  notifications: {
    email: {
      enabled: false,
      smtp: 'smtp.gmail.com',
      port: 587,
      username: '',
      password: '',
      recipients: ''
    },
    telegram: {
      enabled: false,
      botToken: '',
      chatId: ''
    }
  },
  alertRules: {
    cpuThreshold: 85,
    memoryThreshold: 90,
    diskThreshold: 95,
    failedLoginsThreshold: 10
  }
};

export class ConfigService {
  private static readonly STORAGE_KEY = 'logguard-config';

  static saveConfig(config: AppConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  static loadConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
    return DEFAULT_CONFIG;
  }

  static resetConfig(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
