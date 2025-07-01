interface GraylogConfig {
  url: string;
  username: string;
  password: string;
  apiToken: string;
}

interface GraylogMessage {
  _id: string;
  timestamp: string;
  source: string;
  message: string;
  level: number;
  facility: string;
  host: string;
  full_message: string;
}

export class GraylogService {
  private config: GraylogConfig;
  private authHeader: string;

  constructor(config: GraylogConfig) {
    this.config = config;
    this.authHeader = config.apiToken 
      ? `Bearer ${config.apiToken}`
      : `Basic ${btoa(`${config.username}:${config.password}`)}`;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.url}/api/system`, {
        method: 'GET',
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json',
          'X-Requested-By': 'LogGuard-AI'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Graylog connection test failed:', error);
      return false;
    }
  }

  async getMessages(query: string = '*', timeRange: string = 'PT1H'): Promise<GraylogMessage[]> {
    try {
      const params = new URLSearchParams({
        query,
        range: timeRange,
        limit: '100',
        sort: 'timestamp:desc'
      });

      const response = await fetch(`${this.config.url}/api/search/universal/relative?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json',
          'X-Requested-By': 'LogGuard-AI'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.messages?.map((msg: any) => ({
        _id: msg.message._id,
        timestamp: msg.message.timestamp,
        source: msg.message.source,
        message: msg.message.message,
        level: msg.message.level,
        facility: msg.message.facility,
        host: msg.message.host || msg.message.source,
        full_message: msg.message.full_message || msg.message.message
      })) || [];
    } catch (error) {
      console.error('Failed to fetch messages from Graylog:', error);
      return [];
    }
  }

  async streamMessages(callback: (message: GraylogMessage) => void): Promise<() => void> {
    // Simulazione di streaming - in produzione useresti WebSocket o Server-Sent Events
    const pollInterval = setInterval(async () => {
      try {
        const messages = await this.getMessages('*', 'PT5M');
        messages.forEach(callback);
      } catch (error) {
        console.error('Error in message streaming:', error);
      }
    }, 5000); // Poll ogni 5 secondi

    // Ritorna una funzione per fermare il polling
    return () => clearInterval(pollInterval);
  }
}
