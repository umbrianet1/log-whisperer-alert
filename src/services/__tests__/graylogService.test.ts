
import axios from 'axios';
import { GraylogService } from '../graylogService';
import { logger } from '../../utils/logger';
import { performanceMetrics } from '../../utils/performanceMetrics';

// Mock axios
const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');

describe('GraylogService', () => {
  let graylogService: GraylogService;
  let mockAxiosInstance: any;

  const mockConfig = {
    url: 'http://localhost:9000',
    username: 'admin',
    password: 'admin',
    apiToken: ''
  };

  beforeEach(() => {
    // Reset dei mock
    jest.clearAllMocks();
    
    // Mock dell'istanza axios
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn()
        }
      }
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    graylogService = new GraylogService(mockConfig);
  });

  describe('Constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: '/api/graylog',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-By': 'LogGuard-AI',
          'Accept': 'application/json'
        }
      });
    });

    it('should setup interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('testConnection', () => {
    it('should return true on successful connection', async () => {
      const mockResponse = {
        status: 200,
        data: { server_id: 'test-server' }
      };
      
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);
      
      const result = await graylogService.testConnection();
      
      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/system');
    });

    it('should return false on connection failure', async () => {
      const mockError = new Error('Connection failed');
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);
      
      const result = await graylogService.testConnection();
      
      expect(result).toBe(false);
    });

    it('should handle 401 authentication errors', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);
      
      const result = await graylogService.testConnection();
      
      expect(result).toBe(false);
    });
  });

  describe('searchMessages', () => {
    it('should search messages with default parameters', async () => {
      const mockMessages = [
        {
          _id: 'msg1',
          timestamp: '2023-01-01T00:00:00Z',
          message: 'Test message',
          full_message: 'Full test message',
          host: 'localhost',
          level: 1,
          facility: 'test',
          source: 'test'
        }
      ];
      
      const mockResponse = {
        data: {
          messages: mockMessages,
          total_results: 1,
          time: 10
        }
      };
      
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);
      
      const result = await graylogService.searchMessages();
      
      expect(result).toEqual(mockMessages);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/universal/relative', {
        params: {
          query: '*',
          range: 300,
          limit: 50,
          sort: 'timestamp:desc'
        }
      });
    });

    it('should handle custom search parameters', async () => {
      const mockResponse = {
        data: {
          messages: [],
          total_results: 0,
          time: 5
        }
      };
      
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);
      
      await graylogService.searchMessages('error', 3600);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/universal/relative', {
        params: {
          query: 'error',
          range: 3600,
          limit: 50,
          sort: 'timestamp:desc'
        }
      });
    });

    it('should throw authentication error on 401', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);
      
      await expect(graylogService.searchMessages()).rejects.toThrow('Authentication failed - Check your credentials');
    });

    it('should throw generic error on other failures', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };
      
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);
      
      await expect(graylogService.searchMessages()).rejects.toThrow('Search failed: 500');
    });
  });

  describe('API Token Authentication', () => {
    it('should use API token authentication when provided', () => {
      const configWithToken = {
        ...mockConfig,
        apiToken: 'test-token'
      };
      
      new GraylogService(configWithToken);
      
      // Verifica che gli interceptor siano stati configurati
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });
  });

  describe('getRequestCount', () => {
    it('should return current request count', () => {
      const count = graylogService.getRequestCount();
      expect(typeof count).toBe('number');
    });
  });

  describe('getSystemInfo', () => {
    it('should fetch system information', async () => {
      const mockSystemInfo = {
        server_id: 'test-server',
        version: '4.0.0'
      };
      
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockSystemInfo
      });
      
      const result = await graylogService.getSystemInfo();
      
      expect(result).toEqual(mockSystemInfo);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/system');
    });
  });

  describe('getClusterStatus', () => {
    it('should fetch cluster status', async () => {
      const mockClusterStatus = {
        nodes: ['node1', 'node2']
      };
      
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockClusterStatus
      });
      
      const result = await graylogService.getClusterStatus();
      
      expect(result).toEqual(mockClusterStatus);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cluster');
    });
  });
});
