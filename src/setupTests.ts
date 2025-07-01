
import '@testing-library/jest-dom';

// Mock per Winston logger
jest.mock('./utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  loggerService: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    apiCall: jest.fn(),
    security: jest.fn(),
    performance: jest.fn(),
  }
}));

// Mock per le performance metrics
jest.mock('./utils/performanceMetrics', () => ({
  performanceMetrics: {
    recordApiCall: jest.fn(),
    getMetrics: jest.fn(() => ({
      apiCalls: [],
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      slowestEndpoint: '',
      fastestEndpoint: ''
    })),
    reset: jest.fn(),
  }
}));

// Mock per axios
jest.mock('axios');

// Setup globale per i test
global.fetch = jest.fn();
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});
