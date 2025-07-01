
export interface ApiCallMetric {
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  success: boolean;
  timestamp?: Date;
}

export interface PerformanceMetrics {
  apiCalls: ApiCallMetric[];
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestEndpoint: string;
  fastestEndpoint: string;
}

class PerformanceMetricsService {
  private metrics: ApiCallMetric[] = [];
  private readonly maxMetrics = 1000; // Limite per evitare memory leak

  recordApiCall(metric: ApiCallMetric): void {
    const metricWithTimestamp = {
      ...metric,
      timestamp: new Date()
    };

    this.metrics.push(metricWithTimestamp);

    // Mantieni solo le ultime N metriche
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        apiCalls: [],
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        slowestEndpoint: '',
        fastestEndpoint: ''
      };
    }

    const totalRequests = this.metrics.length;
    const successfulRequests = this.metrics.filter(m => m.success).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = totalDuration / totalRequests;

    // Raggruppa per endpoint per trovare il più lento e veloce
    const endpointMetrics = this.metrics.reduce((acc, metric) => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!acc[key]) {
        acc[key] = { total: 0, count: 0, durations: [] };
      }
      acc[key].total += metric.duration;
      acc[key].count++;
      acc[key].durations.push(metric.duration);
      return acc;
    }, {} as Record<string, { total: number; count: number; durations: number[] }>);

    const endpointAverages = Object.entries(endpointMetrics).map(([endpoint, data]) => ({
      endpoint,
      average: data.total / data.count,
      p95: this.calculatePercentile(data.durations, 95)
    }));

    endpointAverages.sort((a, b) => b.average - a.average);

    return {
      apiCalls: this.metrics.slice(-50), // Ultimi 50 chiamate
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(averageResponseTime),
      slowestEndpoint: endpointAverages[0]?.endpoint || '',
      fastestEndpoint: endpointAverages[endpointAverages.length - 1]?.endpoint || ''
    };
  }

  getEndpointMetrics(endpoint: string): ApiCallMetric[] {
    return this.metrics.filter(m => m.endpoint === endpoint);
  }

  getRecentMetrics(minutes: number = 5): ApiCallMetric[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp && m.timestamp > cutoff);
  }

  getErrorRate(): number {
    if (this.metrics.length === 0) return 0;
    const errors = this.metrics.filter(m => !m.success).length;
    return (errors / this.metrics.length) * 100;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  reset(): void {
    this.metrics = [];
  }

  exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics()
    }, null, 2);
  }
}

export const performanceMetrics = new PerformanceMetricsService();
