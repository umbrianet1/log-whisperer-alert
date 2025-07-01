
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Server, 
  Clock,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

interface Alert {
  id: string;
  timestamp: string;
  host: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  aiSuggestion: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

const Dashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      timestamp: '2024-07-01 14:30:25',
      host: 'web-server-01',
      level: 'critical',
      message: 'High CPU usage detected - 95% for 5 minutes',
      aiSuggestion: 'Check for runaway processes with `top` command. Consider scaling horizontally or investigating memory leaks.',
      status: 'new'
    },
    {
      id: '2',
      timestamp: '2024-07-01 14:25:12',
      host: 'db-server-02',
      level: 'warning',
      message: 'Unusual number of failed login attempts',
      aiSuggestion: 'Potential brute force attack. Implement fail2ban or review firewall rules to block suspicious IPs.',
      status: 'acknowledged'
    },
    {
      id: '3',
      timestamp: '2024-07-01 14:20:08',
      host: 'api-gateway',
      level: 'info',
      message: 'SSL certificate expires in 30 days',
      aiSuggestion: 'Renew SSL certificate using certbot: `certbot renew --nginx` or update certificate in your load balancer.',
      status: 'new'
    }
  ]);

  const stats = {
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.level === 'critical').length,
    hostsMonitored: 15,
    uptime: '99.8%'
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'info': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      case 'info': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Operations Dashboard</h1>
        <p className="text-gray-600">Real-time log analysis and AI-powered incident detection</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAlerts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hosts Monitored</p>
              <p className="text-2xl font-bold text-gray-900">{stats.hostsMonitored}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-green-600">{stats.uptime}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent AI-Detected Issues</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live monitoring active</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg border ${getLevelColor(alert.level)}`}>
                  {getLevelIcon(alert.level)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900">{alert.host}</h3>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.status === 'new' ? 'bg-red-100 text-red-800' :
                      alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{alert.message}</p>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-blue-900 mb-1">AI Suggestion</p>
                        <p className="text-sm text-blue-800">{alert.aiSuggestion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
