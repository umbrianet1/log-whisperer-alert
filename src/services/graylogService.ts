
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { performanceMetrics } from '../utils/performanceMetrics';

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

export interface GraylogSearchResponse {
  messages: GraylogMessage[];
  total_results: number;
  time: number;
  built_query: string;
}

export class GraylogService {
  private config: GraylogConfig;
  private axiosInstance: AxiosInstance;
  private requestCount: number = 0;
  private requestTimings: Map<string, number> = new Map();

  constructor(config: GraylogConfig) {
    console.log('🔧 Initializing GraylogService with config:', {
      url: config.url,
      username: config.username,
      hasPassword: !!config.password,
      hasApiToken: !!config.apiToken
    });
    
    this.config = config;
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  private createAxiosInstance(): AxiosInstance {
    console.log('🌐 Creating axios instance with baseURL:', '/api/graylog');
    
    const instance = axios.create({
      baseURL: '/api/graylog',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-By': 'LogGuard-AI',
        'Accept': 'application/json'
      }
    });

    return instance;
  }

  private setupInterceptors(): void {
    // Request interceptor per aggiungere auth e logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const startTime = Date.now();
        const requestId = `${this.requestCount}_${startTime}`;
        this.requestTimings.set(requestId, startTime);
        
        // Store request ID in headers for tracking
        config.headers['X-Request-ID'] = requestId;
        
        // Aggiungi autenticazione
        if (this.config.apiToken && this.config.apiToken.trim() !== '') {
          console.log('🔑 Using API Token authentication');
          logger.debug('Using API Token authentication (Basic Auth format)');
          const credentials = btoa(`${this.config.apiToken}:`);
          config.headers.Authorization = `Basic ${credentials}`;
        } else if (this.config.username && this.config.password) {
          console.log('🔑 Using Basic authentication for user:', this.config.username);
          logger.debug('Using Basic authentication', { username: this.config.username });
          const credentials = btoa(`${this.config.username}:${this.config.password}`);
          config.headers.Authorization = `Basic ${credentials}`;
        } else {
          console.warn('⚠️ No authentication configured!');
        }

        this.requestCount++;
        console.log('📤 Making request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          fullUrl: `${config.baseURL}${config.url}`,
          requestId: this.requestCount,
          hasAuth: !!config.headers.Authorization
        });

        logger.info('Graylog API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          requestId: this.requestCount,
          hasAuth: !!config.headers.Authorization
        });

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error.message);
        logger.error('Request interceptor error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor per logging e metriche
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const endTime = Date.now();
        const requestId = response.config.headers['X-Request-ID'] as string;
        const startTime = this.requestTimings.get(requestId) || endTime;
        const duration = endTime - startTime;
        
        // Cleanup timing data
        if (requestId) {
          this.requestTimings.delete(requestId);
        }

        console.log('✅ Response received:', {
          status: response.status,
          url: response.config.url,
          duration: `${duration}ms`,
          dataSize: JSON.stringify(response.data).length,
          data: response.data
        });

        // Registra metriche di performance
        performanceMetrics.recordApiCall({
          endpoint: response.config.url || 'unknown',
          method: response.config.method?.toUpperCase() || 'GET',
          status: response.status,
          duration,
          success: true
        });

        logger.info('Graylog API Response', {
          status: response.status,
          url: response.config.url,
          duration: `${duration}ms`,
          dataSize: JSON.stringify(response.data).length
        });

        return response;
      },
      (error) => {
        const endTime = Date.now();
        const requestId = error.config?.headers['X-Request-ID'] as string;
        const startTime = this.requestTimings.get(requestId) || endTime;
        const duration = endTime - startTime;
        
        // Cleanup timing data
        if (requestId) {
          this.requestTimings.delete(requestId);
        }

        console.error('❌ Response error:', {
          status: error.response?.status,
          url: error.config?.url,
          duration: `${duration}ms`,
          error: error.message,
          response: error.response?.data,
          fullError: error
        });

        // Registra metriche di errore
        performanceMetrics.recordApiCall({
          endpoint: error.config?.url || 'unknown',
          method: error.config?.method?.toUpperCase() || 'GET',
          status: error.response?.status || 0,
          duration,
          success: false
        });

        logger.error('Graylog API Error', {
          status: error.response?.status,
          url: error.config?.url,
          duration: `${duration}ms`,
          error: error.message,
          response: error.response?.data
        });

        return Promise.reject(error);
      }
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Graylog connection...');
      logger.info('Testing Graylog connection', {
        url: this.config.url,
        hasApiToken: !!this.config.apiToken,
        hasCredentials: !!(this.config.username && this.config.password)
      });

      const response = await this.axiosInstance.get('/system');
      
      console.log('✅ Graylog connection successful!', response.data);
      logger.info('Graylog connection successful', {
        status: response.status,
        serverInfo: response.data
      });

      return true;
    } catch (error: any) {
      console.error('❌ Graylog connection failed:', {
        error: error.message,
        status: error.response?.status,
        response: error.response?.data,
        config: error.config
      });
      
      logger.error('Graylog connection failed', {
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      });

      return false;
    }
  }

  async searchMessages(query: string = '*', timeRange: number = 300): Promise<GraylogMessage[]> {
    try {
      console.log('🔍 Searching Graylog messages...', { query, timeRange });
      logger.debug('Searching Graylog messages', { query, timeRange });

      const response = await this.axiosInstance.get<GraylogSearchResponse>('/search/universal/relative', {
        params: {
          query,
          range: timeRange,
          limit: 50,
          sort: 'timestamp:desc'
        }
      });

      console.log('✅ Graylog search completed:', {
        query,
        totalResults: response.data.total_results,
        messagesReturned: response.data.messages?.length || 0,
        searchTime: `${response.data.time}ms`,
        messages: response.data.messages
      });

      logger.info('Graylog search completed', {
        query,
        totalResults: response.data.total_results,
        messagesReturned: response.data.messages?.length || 0,
        searchTime: `${response.data.time}ms`
      });

      return response.data.messages || [];
    } catch (error: any) {
      console.error('❌ Graylog search failed:', {
        query,
        timeRange,
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      });

      logger.error('Graylog search failed', {
        query,
        timeRange,
        error: error.message,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        throw new Error('Authentication failed - Check your credentials');
      }

      throw new Error(`Search failed: ${error.response?.status || 'Network Error'}`);
    }
  }

  async streamMessages(callback: (message: GraylogMessage) => void): Promise<() => void> {
    logger.info('Starting Graylog message streaming');
    
    let isStreaming = true;
    let lastTimestamp = new Date().toISOString();
    
    const pollMessages = async () => {
      while (isStreaming) {
        try {
          const messages = await this.searchMessages(`timestamp:>${lastTimestamp}`, 60);
          
          if (messages.length > 0) {
            logger.debug('Streaming: received new messages', { count: messages.length });
            lastTimestamp = messages[0].timestamp;
            
            for (const message of messages) {
              if (isStreaming) {
                callback(message);
              }
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 30000));
        } catch (error: any) {
          logger.error('Streaming error', { error: error.message });
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
    };

    pollMessages();

    return () => {
      logger.info('Stopping Graylog message streaming');
      isStreaming = false;
    };
  }

  // Metodi per metriche e diagnostica
  getRequestCount(): number {
    return this.requestCount;
  }

  async getSystemInfo(): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/system');
      return response.data;
    } catch (error) {
      logger.error('Failed to get system info', { error });
      throw error;
    }
  }

  async getClusterStatus(): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/cluster');
      return response.data;
    } catch (error) {
      logger.error('Failed to get cluster status', { error });
      throw error;
    }
  }
}
