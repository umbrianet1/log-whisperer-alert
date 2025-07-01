
export interface GraylogConfig {
  url: string;
  username: string;
  password: string;
  apiToken: string;
}

export interface GraylogMessage {
  _id: string;
  timestamp: string;
  message: string;
  full_message: string;
  host: string;
  level: number;
  facility: string;
  source: string;
}

export class GraylogService {
  private config: GraylogConfig;

  constructor(config: GraylogConfig) {
    this.config = config;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-By': 'LogGuard-AI',
      'Accept': 'application/json'
    };

    // Usa API token se disponibile, altrimenti username/password
    if (this.config.apiToken && this.config.apiToken.trim() !== '') {
      console.log('Using API Token authentication');
      headers['Authorization'] = `Bearer ${this.config.apiToken}`;
    } else if (this.config.username && this.config.password) {
      console.log('Using Basic authentication with username:', this.config.username);
      const credentials = btoa(`${this.config.username}:${this.config.password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    } else {
      console.warn('No authentication credentials provided');
    }

    return headers;
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Graylog connection via proxy...');
      console.log('Using config:', {
        url: this.config.url,
        username: this.config.username,
        hasPassword: !!this.config.password,
        hasApiToken: !!this.config.apiToken
      });
      
      const headers = this.getAuthHeaders();
      console.log('Request headers:', { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : 'None' });
      
      // Usa il proxy invece dell'URL diretto
      const response = await fetch('/api/graylog/system', {
        method: 'GET',
        headers
      });

      console.log('Graylog response status:', response.status);
      console.log('Graylog response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.text();
        console.log('Graylog system response:', data);
        try {
          const jsonData = JSON.parse(data);
          console.log('Graylog system info:', jsonData);
        } catch (e) {
          console.log('Response is not JSON, but connection successful');
        }
        return true;
      } 
      
      if (response.status === 401) {
        console.error('Authentication failed - Invalid credentials');
        const errorText = await response.text();
        console.error('Error response:', errorText);
      } else {
        console.error('Graylog connection failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
      
      return false;
    } catch (error) {
      console.error('Error testing Graylog connection:', error);
      return false;
    }
  }

  async searchMessages(query: string = '*', timeRange: number = 300): Promise<GraylogMessage[]> {
    try {
      const searchParams = new URLSearchParams({
        query,
        range: timeRange.toString(),
        limit: '50',
        sort: 'timestamp:desc'
      });

      const response = await fetch(`/api/graylog/search/universal/relative?${searchParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed - Check your credentials');
        }
        throw new Error(`Search failed: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  async streamMessages(callback: (message: GraylogMessage) => void): Promise<() => void> {
    console.log('Starting message streaming...');
    
    let isStreaming = true;
    
    const pollMessages = async () => {
      while (isStreaming) {
        try {
          const messages = await this.searchMessages('*', 60); // Ultimi 60 secondi
          
          for (const message of messages) {
            if (isStreaming) {
              callback(message);
            }
          }
          
          // Polling ogni 30 secondi
          await new Promise(resolve => setTimeout(resolve, 30000));
        } catch (error) {
          console.error('Error in streaming:', error);
          await new Promise(resolve => setTimeout(resolve, 60000)); // Retry dopo 1 minuto
        }
      }
    };

    // Avvia il polling
    pollMessages();

    // Ritorna la funzione per fermare lo streaming
    return () => {
      console.log('Stopping message streaming...');
      isStreaming = false;
    };
  }
}
