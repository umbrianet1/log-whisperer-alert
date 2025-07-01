
import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Server,
  TrendingUp,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  // Dati reali che verranno popolati dal servizio Graylog
  const stats = [
    {
      title: 'Host Monitorati',
      value: '0',
      change: '+0%',
      icon: Server,
      color: 'text-blue-600'
    },
    {
      title: 'Eventi Oggi',
      value: '0',
      change: '+0%',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Alert Attivi',
      value: '0',
      change: '0%',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Minacce Bloccate',
      value: '0',
      change: '+0%',
      icon: Shield,
      color: 'text-purple-600'
    }
  ];

  // Dati vuoti per i grafici - verranno popolati dai servizi reali
  const logData = [];
  const alertData = [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard LogGuard AI</h1>
          <p className="text-gray-600">Panoramica del sistema di monitoraggio in tempo reale</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} rispetto a ieri
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Log Events Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Eventi Log (24h)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={logData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="events" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Nessun dato disponibile - Configurare connessione Graylog</p>
              </div>
            </div>
          </div>

          {/* Security Alerts Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert di Sicurezza</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={alertData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="warning" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Nessun dato disponibile - Sistema in attesa di configurazione</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Visualizza Log Live</span>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium">Gestisci Alert</span>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium">Conversazioni AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
