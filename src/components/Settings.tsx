
import React, { useState } from 'react';
import { Save, TestTube, Check, AlertCircle } from 'lucide-react';

const Settings = () => {
  const [config, setConfig] = useState({
    graylog: {
      url: 'https://graylog.example.com:9000',
      username: 'admin',
      password: '',
      apiToken: ''
    },
    openwebui: {
      url: 'http://localhost:3000',
      apiKey: '',
      model: 'llama3.1'
    },
    notifications: {
      email: {
        enabled: true,
        smtp: 'smtp.gmail.com',
        port: 587,
        username: 'alerts@company.com',
        password: '',
        recipients: 'admin@company.com, security@company.com'
      },
      telegram: {
        enabled: true,
        botToken: '',
        chatId: ''
      }
    },
    alertRules: {
      cpuThreshold: 85,
      memoryThreshold: 90,
      diskThreshold: 95,
      failedLoginsThreshold: 10
    }
  });

  const [testResults, setTestResults] = useState<{[key: string]: boolean | null}>({});

  const handleInputChange = (section: string, field: string, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const testConnection = async (service: string) => {
    setTestResults(prev => ({ ...prev, [service]: null }));
    
    // Simulate API test
    setTimeout(() => {
      setTestResults(prev => ({ 
        ...prev, 
        [service]: Math.random() > 0.3 // 70% success rate for demo
      }));
    }, 2000);
  };

  const saveConfig = () => {
    console.log('Saving configuration:', config);
    // Here you would save to backend
    alert('Configuration saved successfully!');
  };

  const TestButton = ({ service, label }: { service: string; label: string }) => (
    <button
      onClick={() => testConnection(service)}
      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <TestTube className="w-4 h-4" />
      <span>Test {label}</span>
      {testResults[service] === true && <Check className="w-4 h-4 text-green-400" />}
      {testResults[service] === false && <AlertCircle className="w-4 h-4 text-red-400" />}
    </button>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuration</h1>
          <p className="text-gray-600">Configure your monitoring and notification settings</p>
        </div>

        <div className="space-y-8">
          {/* Graylog Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Graylog Connection</h2>
              <TestButton service="graylog" label="Connection" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Server URL</label>
                <input
                  type="url"
                  value={config.graylog.url}
                  onChange={(e) => handleInputChange('graylog', 'url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://graylog.example.com:9000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={config.graylog.username}
                  onChange={(e) => handleInputChange('graylog', 'username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={config.graylog.password}
                  onChange={(e) => handleInputChange('graylog', 'password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Token</label>
                <input
                  type="password"
                  value={config.graylog.apiToken}
                  onChange={(e) => handleInputChange('graylog', 'apiToken', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* OpenWebUI Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">OpenWebUI AI Analysis</h2>
              <TestButton service="openwebui" label="AI Connection" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OpenWebUI URL</label>
                <input
                  type="url"
                  value={config.openwebui.url}
                  onChange={(e) => handleInputChange('openwebui', 'url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="http://localhost:3000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={config.openwebui.apiKey}
                  onChange={(e) => handleInputChange('openwebui', 'apiKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                <select
                  value={config.openwebui.model}
                  onChange={(e) => handleInputChange('openwebui', 'model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="llama3.1">Llama 3.1</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude">Claude</option>
                  <option value="mistral">Mistral</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
            
            {/* Email Settings */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Email Notifications</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notifications.email.enabled}
                    onChange={(e) => handleNestedInputChange('notifications', 'email', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                  <input
                    type="text"
                    value={config.notifications.email.smtp}
                    onChange={(e) => handleNestedInputChange('notifications', 'email', 'smtp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                  <input
                    type="number"
                    value={config.notifications.email.port}
                    onChange={(e) => handleNestedInputChange('notifications', 'email', 'port', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipients (comma separated)</label>
                  <input
                    type="text"
                    value={config.notifications.email.recipients}
                    onChange={(e) => handleNestedInputChange('notifications', 'email', 'recipients', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Telegram Settings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Telegram Notifications</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notifications.telegram.enabled}
                    onChange={(e) => handleNestedInputChange('notifications', 'telegram', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token</label>
                  <input
                    type="password"
                    value={config.notifications.telegram.botToken}
                    onChange={(e) => handleNestedInputChange('notifications', 'telegram', 'botToken', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chat ID</label>
                  <input
                    type="text"
                    value={config.notifications.telegram.chatId}
                    onChange={(e) => handleNestedInputChange('notifications', 'telegram', 'chatId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Rules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Alert Thresholds</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CPU Usage (%)</label>
                <input
                  type="number"
                  value={config.alertRules.cpuThreshold}
                  onChange={(e) => handleInputChange('alertRules', 'cpuThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Memory Usage (%)</label>
                <input
                  type="number"
                  value={config.alertRules.memoryThreshold}
                  onChange={(e) => handleInputChange('alertRules', 'memoryThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disk Usage (%)</label>
                <input
                  type="number"
                  value={config.alertRules.diskThreshold}
                  onChange={(e) => handleInputChange('alertRules', 'diskThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Failed Logins</label>
                <input
                  type="number"
                  value={config.alertRules.failedLoginsThreshold}
                  onChange={(e) => handleInputChange('alertRules', 'failedLoginsThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
