
# Graylog Client API Documentation

## Overview

This document provides comprehensive documentation for the enhanced Graylog Client API, including all available endpoints, authentication methods, error handling, and performance monitoring capabilities.

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Error Handling](#error-handling)
4. [Performance Monitoring](#performance-monitoring)
5. [Testing](#testing)
6. [Configuration](#configuration)

## Authentication

### Basic Authentication
```typescript
const config = {
  url: 'http://your-graylog-server:9000',
  username: 'admin',
  password: 'your-password',
  apiToken: ''
};
```

### API Token Authentication
```typescript
const config = {
  url: 'http://your-graylog-server:9000',
  username: '',
  password: '',
  apiToken: 'your-api-token'
};
```

**Note**: API tokens use Basic Authentication with the token as username and empty password.

## API Endpoints

### GraylogService Class

#### Constructor
```typescript
constructor(config: GraylogConfig)
```

Creates a new GraylogService instance with the provided configuration.

**Parameters:**
- `config`: GraylogConfig object containing connection details

**Example:**
```typescript
const graylogService = new GraylogService({
  url: 'http://localhost:9000',
  username: 'admin',
  password: 'admin',
  apiToken: ''
});
```

#### testConnection()
```typescript
async testConnection(): Promise<boolean>
```

Tests the connection to the Graylog server.

**Returns:**
- `Promise<boolean>`: true if connection successful, false otherwise

**Example:**
```typescript
const isConnected = await graylogService.testConnection();
if (isConnected) {
  console.log('Connected to Graylog');
} else {
  console.log('Failed to connect');
}
```

#### searchMessages()
```typescript
async searchMessages(query: string = '*', timeRange: number = 300): Promise<GraylogMessage[]>
```

Searches for messages in Graylog.

**Parameters:**
- `query` (optional): Search query string. Default: '*'
- `timeRange` (optional): Time range in seconds. Default: 300

**Returns:**
- `Promise<GraylogMessage[]>`: Array of matching messages

**Example:**
```typescript
// Search for error messages in last hour
const messages = await graylogService.searchMessages('level:error', 3600);

// Search all messages in last 5 minutes
const recentMessages = await graylogService.searchMessages('*', 300);
```

#### streamMessages()
```typescript
async streamMessages(callback: (message: GraylogMessage) => void): Promise<() => void>
```

Starts streaming messages from Graylog in real-time.

**Parameters:**
- `callback`: Function to handle incoming messages

**Returns:**
- `Promise<() => void>`: Function to stop streaming

**Example:**
```typescript
const stopStreaming = await graylogService.streamMessages((message) => {
  console.log('New message:', message.message);
});

// Stop streaming after 60 seconds
setTimeout(() => {
  stopStreaming();
}, 60000);
```

#### getSystemInfo()
```typescript
async getSystemInfo(): Promise<any>
```

Retrieves system information from Graylog.

**Returns:**
- `Promise<any>`: System information object

#### getClusterStatus()
```typescript
async getClusterStatus(): Promise<any>
```

Retrieves cluster status from Graylog.

**Returns:**
- `Promise<any>`: Cluster status object

#### getRequestCount()
```typescript
getRequestCount(): number
```

Returns the total number of requests made by this service instance.

**Returns:**
- `number`: Total request count

## Data Types

### GraylogConfig
```typescript
interface GraylogConfig {
  url: string;           // Graylog server URL
  username: string;      // Username for authentication
  password: string;      // Password for authentication
  apiToken: string;      // API token for authentication
}
```

### GraylogMessage
```typescript
interface GraylogMessage {
  _id: string;           // Unique message ID
  timestamp: string;     // Message timestamp
  message: string;       // Short message
  full_message: string;  // Full message content
  host: string;          // Source host
  level: number;         // Log level
  facility: string;      // Log facility
  source: string;        // Message source
}
```

### GraylogSearchResponse
```typescript
interface GraylogSearchResponse {
  messages: GraylogMessage[];  // Array of messages
  total_results: number;       // Total number of results
  time: number;               // Search execution time
  built_query: string;        // Query that was executed
}
```

## Error Handling

The API uses structured error handling with specific error types:

### Authentication Errors
```typescript
// Thrown when credentials are invalid
throw new Error('Authentication failed - Check your credentials');
```

### Search Errors
```typescript
// Thrown when search fails
throw new Error(`Search failed: ${status}`);
```

### Network Errors
```typescript
// Thrown when network request fails
throw new Error('Network Error');
```

## Performance Monitoring

### Automatic Metrics Collection

The service automatically collects performance metrics for all API calls:

- Request count
- Response times
- Success/failure rates
- Endpoint-specific metrics

### Accessing Metrics

```typescript
import { performanceMetrics } from '../utils/performanceMetrics';

// Get current metrics
const metrics = performanceMetrics.getMetrics();

// Get metrics for specific endpoint
const endpointMetrics = performanceMetrics.getEndpointMetrics('/search/universal/relative');

// Get recent metrics (last 5 minutes)
const recentMetrics = performanceMetrics.getRecentMetrics(5);

// Get error rate
const errorRate = performanceMetrics.getErrorRate();
```

### Metrics Data Structure

```typescript
interface PerformanceMetrics {
  apiCalls: ApiCallMetric[];
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestEndpoint: string;
  fastestEndpoint: string;
}

interface ApiCallMetric {
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  success: boolean;
  timestamp?: Date;
}
```

## Logging

The service uses Winston for structured logging:

### Log Levels
- `error`: Error messages
- `warn`: Warning messages
- `info`: Informational messages
- `debug`: Debug messages
- `http`: HTTP request/response logs

### Accessing Logs
```typescript
import { logger } from '../utils/logger';

// Log messages
logger.info('Message', { metadata });
logger.error('Error occurred', { error: err });
logger.debug('Debug info', { data });
```

### Log Files
- `logs/error.log`: Error logs only
- `logs/combined.log`: All log levels

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- Target coverage: >80%
- Includes unit tests for all service methods
- Mock implementations for external dependencies

### Example Test
```typescript
import { GraylogService } from '../graylogService';

describe('GraylogService', () => {
  it('should connect successfully', async () => {
    const service = new GraylogService(mockConfig);
    const result = await service.testConnection();
    expect(result).toBe(true);
  });
});
```

## Configuration

### Environment Variables
```bash
# Graylog server URL
VITE_GRAYLOG_URL=http://localhost:9000

# Log level
LOG_LEVEL=info

# Test environment
NODE_ENV=test
```

### ESLint Configuration
The project uses ESLint with TypeScript and Jest plugins for code quality:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Best Practices

### 1. Error Handling
Always wrap API calls in try-catch blocks:

```typescript
try {
  const messages = await graylogService.searchMessages('error');
  // Handle messages
} catch (error) {
  console.error('Search failed:', error.message);
  // Handle error appropriately
}
```

### 2. Resource Management
Stop streaming when component unmounts:

```typescript
useEffect(() => {
  let stopStreaming: (() => void) | null = null;

  const startStreaming = async () => {
    stopStreaming = await graylogService.streamMessages(handleMessage);
  };

  startStreaming();

  return () => {
    if (stopStreaming) {
      stopStreaming();
    }
  };
}, []);
```

### 3. Performance Monitoring
Regularly check performance metrics:

```typescript
// Monitor API performance
const metrics = performanceMetrics.getMetrics();
if (metrics.averageResponseTime > 1000) {
  console.warn('High response times detected');
}
```

## Migration Guide

### From Previous Version

1. **Install Dependencies**
   ```bash
   npm install axios winston jest @types/jest
   ```

2. **Update Service Usage**
   ```typescript
   // Old way
   const connected = await graylogService.testConnection();
   
   // New way (same interface, enhanced internally)
   const connected = await graylogService.testConnection();
   ```

3. **Access New Features**
   ```typescript
   // Performance metrics
   const metrics = performanceMetrics.getMetrics();
   
   // Structured logging
   import { logger } from '../utils/logger';
   logger.info('Message logged');
   ```

## Support

For issues and questions:
1. Check the logs in `logs/` directory
2. Review performance metrics dashboard
3. Run the test suite to identify issues
4. Check ESLint output for code quality issues

## Changelog

### v2.0.0
- ✅ Added axios with interceptors
- ✅ Implemented Winston logging
- ✅ Added Jest testing framework
- ✅ Enhanced ESLint configuration
- ✅ Performance metrics dashboard
- ✅ Comprehensive error handling
- ✅ API documentation
- ✅ >80% test coverage
