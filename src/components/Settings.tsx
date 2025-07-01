
import React, { useState, useEffect } from 'react';
import { Save, TestTube, Check, AlertCircle } from 'lucide-react';
import { ConfigService, AppConfig } from '../services/configService';
import { GraylogService } from '../services/graylogService';
import { AIService } from '../services/aiService';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [config, setConfig] = useState<AppConfig>(ConfigService.loadConfig());
  const [testResults, setTestResults] = useState<{[key: string]: boolean | null}>({});
  const { toast } = useToast();

  useEffect(() => {
    const loadedConfig = ConfigService.loadConfig();
    setConfig(loadedConfig);
  }, []);

  const handleInputChange = (section: keyof AppConfig, field: string, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: keyof AppConfig, subsection: string, field: string, value: string | number | boolean) => {
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

  const testGraylogConnection = async () => {
    setTestResults(prev => ({ ...prev, graylog: null }));
    
    try {
      const graylogService = new GraylogService(config.graylog);
      const result = await graylogService.testConnection();
      setTestResults(prev => ({ ...prev, graylog: result }));
      
      toast({
        title: result ? "Connessione riuscita" : "Connessione fallita",
        description: result ? "Graylog è raggiungibile" : "Verifica URL e credenziali",
        variant: result ? "default" : "destructive"
      });
    } catch (error) {
      setTestResults(prev => ({ ...prev, graylog: false }));
      toast({
        title: "Errore di connessione",
        description: "Impossibile connettersi a Graylog",
        variant: "destructive"
      });
    }
  };

  const testOpenWebUIConnection = async () => {
    setTestResults(prev => ({ ...prev, openwebui: null }));
    
    try {
      const aiService = new AIService(config.openwebui);
      const result = await aiService.testConnection();
      setTestResults(prev => ({ ...prev, openwebui: result }));
      
      toast({
        title: result ? "Connessione AI riuscita" : "Connessione AI fallita",
        description: result ? "OpenWebUI è raggiungibile" : "Verifica URL e API key",
        variant: result ? "default" : "destructive"
      });
    } catch (error) {
      setTestResults(prev => ({ ...prev, openwebui: false }));
      toast({
        title: "Errore connessione AI",
        description: "Impossibile connettersi a OpenWebUI",
        variant: "destructive"
      });
    }
  };

  const saveConfig = () => {
    try {
      ConfigService.saveConfig(config);
      toast({
        title: "Configurazione salvata",
        description: "Le impostazioni sono state salvate con successo",
      });
    } catch (error) {
      toast({
        title: "Errore salvataggio",
        description: "Impossibile salvare la configurazione",
        variant: "destructive"
      });
    }
  };

  const TestButton = ({ service, label, onTest }: { service: string; label: string; onTest: () => void }) => (
    <button
      onClick={onTest}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurazione</h1>
          <p className="text-gray-600">Configura le connessioni ai servizi esterni e le regole di notifica</p>
        </div>

        <div className="space-y-8">
          {/* Graylog Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Connessione Graylog</h2>
              <TestButton service="graylog" label="Connessione" onTest={testGraylogConnection} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Server</label>
                <input
                  type="url"
                  value={config.graylog.url}
                  onChange={(e) => handleInputChange('graylog', 'url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="http://localhost:9000"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">API Token (opzionale)</label>
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
              <h2 className="text-xl font-semibold text-gray-900">Analisi AI (OpenWebUI)</h2>
              <TestButton service="openwebui" label="AI" onTest={testOpenWebUIConnection} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL OpenWebUI</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modello AI</label>
                <select
                  value={config.openwebui.model}
                  onChange={(e) => handleInputChange('openwebui', 'model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="llama3.1">Llama 3.1</option>
                  <option value="llama3.2">Llama 3.2</option>
                  <option value="mistral">Mistral</option>
                  <option value="codellama">CodeLlama</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lingua AI</label>
                <select
                  value={config.openwebui.language}
                  onChange={(e) => handleInputChange('openwebui', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="italian">Italiano</option>
                  <option value="english">English</option>
                  <option value="spanish">Español</option>
                  <option value="french">Français</option>
                  <option value="german">Deutsch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Impostazioni Notifiche</h2>
            
            {/* Telegram Settings */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Notifiche Telegram</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notifications.telegram.enabled}
                    onChange={(e) => handleNestedInputChange('notifications', 'telegram', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Abilita</span>
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
                    placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chat ID</label>
                  <input
                    type="text"
                    value={config.notifications.telegram.chatId}
                    onChange={(e) => handleNestedInputChange('notifications', 'telegram', 'chatId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="-1001234567890"
                  />
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Notifiche Email</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notifications.email.enabled}
                    onChange={(e) => handleNestedInputChange('notifications', 'email', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Abilita</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destinatari (separati da virgola)</label>
                  <input
                    type="text"
                    value={config.notifications.email.recipients}
                    onChange={(e) => handleNestedInputChange('notifications', 'email', 'recipients', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@company.com, security@company.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Rules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Soglie di Alert</h2>
            
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
              <span>Salva Configurazione</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
