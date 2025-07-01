
import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, Pause, RefreshCw } from 'lucide-react';
import { GraylogService } from '../services/graylogService';
import { ConfigService } from '../services/configService';

interface LogEntry {
  id: string;
  timestamp: string;
  host: string;
  level: string;
  message: string;
  source: string;
}

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedHost, setSelectedHost] = useState('all');
  const [graylogService, setGraylogService] = useState<GraylogService | null>(null);
  const [stopStreaming, setStopStreaming] = useState<(() => void) | null>(null);

  useEffect(() => {
    const config = ConfigService.loadConfig();
    const service = new GraylogService(config.graylog);
    setGraylogService(service);
  }, []);

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

  const startLiveStreaming = async () => {
    if (!graylogService) return;

    try {
      const connected = await graylogService.testConnection();
      if (!connected) {
        console.error('Cannot connect to Graylog');
        return;
      }

      setIsLive(true);
      const stopFn = await graylogService.streamMessages((message) => {
        const logEntry: LogEntry = {
          id: message._id,
          timestamp: message.timestamp,
          host: message.host,
          level: message.level.toString(),
          message: message.message,
          source: message.source
        };
        
        setLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Keep only 50 logs
      });
      
      setStopStreaming(() => stopFn);
    } catch (error) {
      console.error('Failed to start streaming:', error);
    }
  };

  const stopLiveStreaming = () => {
    if (stopStreaming) {
      stopStreaming();
      setStopStreaming(null);
    }
    setIsLive(false);
  };

  const refreshLogs = async () => {
    if (!graylogService) return;

    try {
      const messages = await graylogService.searchMessages('*', 3600); // 1 ora in secondi
      const logEntries: LogEntry[] = messages.map(message => ({
        id: message._id,
        timestamp: message.timestamp,
        host: message.host,
        level: message.level.toString(),
        message: message.message,
        source: message.source
      }));
      
      setLogs(logEntries);
    } catch (error) {
      console.error('Failed to refresh logs:', error);
    }
  };

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
              onClick={isLive ? stopLiveStreaming : startLiveStreaming}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isLive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isLive ? 'Pause' : 'Start'}</span>
            </button>
            
            <button 
              onClick={refreshLogs}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
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
            {isLive ? 'Live stream active' : 'Stream stopped'} • {filteredLogs.length} entries
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
              <p>No logs available. Configure Graylog connection in Settings and click Start.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
