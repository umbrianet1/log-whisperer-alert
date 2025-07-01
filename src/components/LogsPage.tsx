
import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, Pause, RefreshCw } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  host: string;
  level: string;
  message: string;
  source: string;
}

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '2024-07-01 14:35:22',
      host: 'web-server-01',
      level: 'ERROR',
      message: 'Connection timeout to database pool after 30 seconds',
      source: 'application'
    },
    {
      id: '2',
      timestamp: '2024-07-01 14:35:20',
      host: 'web-server-01',
      level: 'WARN',
      message: 'High memory usage detected: 89% of available memory in use',
      source: 'system'
    },
    {
      id: '3',
      timestamp: '2024-07-01 14:35:18',
      host: 'api-gateway',
      level: 'INFO',
      message: 'Rate limit exceeded for IP 192.168.1.100 - temporarily blocked',
      source: 'security'
    },
    {
      id: '4',
      timestamp: '2024-07-01 14:35:15',
      host: 'db-server-02',
      level: 'ERROR',
      message: 'Failed authentication attempt from user "admin" - invalid password',
      source: 'auth'
    },
    {
      id: '5',
      timestamp: '2024-07-01 14:35:12',
      host: 'load-balancer',
      level: 'INFO',
      message: 'Health check successful for all backend servers',
      source: 'health'
    }
  ]);

  const [isLive, setIsLive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedHost, setSelectedHost] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.host.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesHost = selectedHost === 'all' || log.host === selectedHost;
    
    return matchesSearch && matchesLevel && matchesHost;
  });

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR': return 'text-red-600 bg-red-50 border-red-200';
      case 'WARN': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'INFO': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DEBUG': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const uniqueHosts = Array.from(new Set(logs.map(log => log.host)));
  const uniqueLevels = Array.from(new Set(logs.map(log => log.level)));

  // Simulate live log updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        host: uniqueHosts[Math.floor(Math.random() * uniqueHosts.length)],
        level: uniqueLevels[Math.floor(Math.random() * uniqueLevels.length)],
        message: `Simulated log entry - ${Math.random().toString(36).substring(7)}`,
        source: 'system'
      };
      
      setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep only 50 logs
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Log Stream</h1>
            <p className="text-gray-600">Real-time log monitoring from Graylog</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isLive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isLive ? 'Pause' : 'Resume'}</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              {uniqueLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={selectedHost}
              onChange={(e) => setSelectedHost(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Hosts</option>
              {uniqueHosts.map(host => (
                <option key={host} value={host}>{host}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600">
            {isLive ? 'Live stream active' : 'Stream paused'} • {filteredLogs.length} entries
          </span>
        </div>
      </div>

      {/* Log Entries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className={`px-2 py-1 text-xs font-medium rounded border ${getLevelColor(log.level)}`}>
                  {log.level}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-sm font-medium text-gray-900">{log.host}</span>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                    <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                      {log.source}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-mono">{log.message}</p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No logs match your current filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
