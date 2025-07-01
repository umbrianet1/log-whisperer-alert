
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Server, 
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Bell,
  Play,
  Pause
} from 'lucide-react';
import { useLogMonitor } from '../hooks/useLogMonitor';
import { useToast } from '@/hooks/use-toast';

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
  const { alerts, isMonitoring, startMonitoring, stopMonitoring } = useLogMonitor();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    hostsMonitored: 15,
    uptime: '99.8%'
  });

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.level === 'critical').length
    }));
  }, [alerts]);

  const handleToggleMonitoring = async () => {
    if (isMonitoring) {
      stopMonitoring();
      toast({
        title: "Monitoraggio fermato",
        description: "Il monitoraggio dei log è stato interrotto",
      });
    } else {
      try {
        await startMonitoring();
        toast({
          title: "Monitoraggio avviato",
          description: "Il monitoraggio dei log è ora attivo",
        });
      } catch (error) {
        toast({
          title: "Errore avvio monitoraggio",
          description: "Verifica la configurazione nei Settings",
          variant: "destructive"
        });
      }
    }
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

  const updateAlertStatus = (alertId: string, status: 'acknowledged' | 'resolved') => {
    // In un'implementazione reale, questo aggiornerebbe il database
    console.log(`Alert ${alertId} marked as ${status}`);
    toast({
      title: "Alert aggiornato",
      description: `Alert contrassegnato come ${status}`,
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">LogGuard AI Dashboard</h1>
            <p className="text-gray-600">Analisi intelligente dei log in tempo reale</p>
          </div>
          <button
            onClick={handleToggleMonitoring}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isMonitoring
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMonitoring ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isMonitoring ? 'Ferma Monitoraggio' : 'Avvia Monitoraggio'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alert Totali</p>
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
              <p className="text-sm font-medium text-gray-600">Alert Critici</p>
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
              <p className="text-sm font-medium text-gray-600">Host Monitorati</p>
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
              <p className="text-sm font-medium text-gray-600">Uptime Sistema</p>
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
            <h2 className="text-xl font-semibold text-gray-900">Alert Rilevati dall'AI</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{isMonitoring ? 'Monitoraggio attivo' : 'Monitoraggio fermo'}</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun alert rilevato</h3>
              <p className="text-gray-500">
                {isMonitoring 
                  ? "Il sistema sta monitorando i log. Gli alert appariranno qui quando rilevati."
                  : "Avvia il monitoraggio per iniziare a rilevare anomalie nei log."
                }
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg border ${getLevelColor(alert.level)}`}>
                    {getLevelIcon(alert.level)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">{alert.host}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString('it-IT')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={alert.status}
                          onChange={(e) => updateAlertStatus(alert.id, e.target.value as 'acknowledged' | 'resolved')}
                          className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${
                            alert.status === 'new' ? 'bg-red-100 text-red-800' :
                            alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          <option value="new">Nuovo</option>
                          <option value="acknowledged">Riconosciuto</option>
                          <option value="resolved">Risolto</option>
                        </select>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{alert.message}</p>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-blue-900 mb-1">Suggerimento AI</p>
                          <p className="text-sm text-blue-800">{alert.aiSuggestion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
