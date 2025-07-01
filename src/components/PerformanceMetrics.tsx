
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { performanceMetrics, PerformanceMetrics as IPerformanceMetrics } from '../utils/performanceMetrics';
import { Activity, Clock, AlertTriangle, CheckCircle, TrendingUp, Download } from 'lucide-react';

const PerformanceMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<IPerformanceMetrics | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMetrics.getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleExportMetrics = () => {
    const exportData = performanceMetrics.exportMetrics();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graylog-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetMetrics = () => {
    performanceMetrics.reset();
    setMetrics(performanceMetrics.getMetrics());
  };

  if (!metrics) {
    return <div className="p-6">Loading metrics...</div>;
  }

  const successRate = metrics.totalRequests > 0 ? (metrics.successfulRequests / metrics.totalRequests) * 100 : 0;
  const errorRate = 100 - successRate;

  const endpointData = metrics.apiCalls.reduce((acc, call) => {
    const key = `${call.method} ${call.endpoint}`;
    if (!acc[key]) {
      acc[key] = { endpoint: key, count: 0, totalDuration: 0, errors: 0 };
    }
    acc[key].count++;
    acc[key].totalDuration += call.duration;
    if (!call.success) acc[key].errors++;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(endpointData).map((item: any) => ({
    endpoint: item.endpoint.split(' ')[1]?.split('/').pop() || 'unknown',
    avgDuration: Math.round(item.totalDuration / item.count),
    requests: item.count,
    errorRate: (item.errors / item.count) * 100
  }));

  const statusData = [
    { name: 'Success', value: metrics.successfulRequests, color: '#10b981' },
    { name: 'Errors', value: metrics.failedRequests, color: '#ef4444' }
  ];

  const recentTrend = metrics.apiCalls.slice(-20).map((call, index) => ({
    request: index + 1,
    duration: call.duration,
    success: call.success
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Metrics</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring of Graylog API performance</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExportMetrics} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleResetMetrics} variant="outline">
            Reset
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              API calls made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.successfulRequests} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average latency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.failedRequests} failures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Performance</CardTitle>
              <CardDescription>Average response time and request count by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="endpoint" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgDuration" fill="#3b82f6" name="Avg Duration (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trend</CardTitle>
              <CardDescription>Recent 20 requests response time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="request" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="duration" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Status Distribution</CardTitle>
                <CardDescription>Success vs Error ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endpoint Statistics</CardTitle>
                <CardDescription>Detailed breakdown by endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(endpointData).slice(0, 5).map(([endpoint, data]: [string, any]) => (
                    <div key={endpoint} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{endpoint}</p>
                        <p className="text-xs text-gray-500">{data.count} requests</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={data.errors > 0 ? "destructive" : "secondary"}>
                          {Math.round(data.totalDuration / data.count)}ms
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>Real-time monitoring active • Updated every 5 seconds</span>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
