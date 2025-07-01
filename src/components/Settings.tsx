import React, { useState, useEffect } from 'react';
import { Save, TestTube, Check, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { ConfigService, AppConfig, NotificationRule } from '../services/configService';
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

  const addNotificationRule = () => {
    const newRule: NotificationRule = {
      id: `rule_${Date.now()}`,
      name: `Regola ${config.notifications.rules.length + 1}`,
      enabled: true,
      matchString: '',
      email: {
        enabled: false,
        recipients: ''
      },
      telegram: {
        enabled: false,
        botToken: '',
        chatId: ''
      }
    };

    setConfig(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        rules: [...prev.notifications.rules, newRule]
      }
    }));
  };

  const removeNotificationRule = (ruleId: string) => {
    setConfig(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        rules: prev.notifications.rules.filter(rule => rule.id !== ruleId)
      }
    }));
  };

  const updateNotificationRule = (ruleId: string, updates: Partial<NotificationRule>) => {
    setConfig(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        rules: prev.notifications.rules.map(rule =>
          rule.id === ruleId ? { ...rule, ...updates } : rule
        )
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
            
            {/* Global Telegram Settings */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Notifiche Telegram Globali</h3>
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

            {/* Global Email Settings */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Notifiche Email Globali</h3>
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

            {/* Notification Rules */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Regole di Notifica Condizionali</h3>
                <button
                  onClick={addNotificationRule}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi Regola</span>
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Crea regole per inviare notifiche specifiche quando i log contengono determinate stringhe (es. IP, hostname, errori specifici)
              </p>

              {config.notifications.rules.map((rule) => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => updateNotificationRule(rule.id, { name: e.target.value })}
                        className="font-medium px-2 py-1 border border-gray-300 rounded"
                        placeholder="Nome regola"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => updateNotificationRule(rule.id, { enabled: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Attiva</span>
                      </label>
                    </div>
                    <button
                      onClick={() => removeNotificationRule(rule.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stringa da cercare nei log</label>
                    <input
                      type="text"
                      value={rule.matchString}
                      onChange={(e) => updateNotificationRule(rule.id, { matchString: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. 192.168.1.1, ERROR, failed login, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rule Telegram Settings */}
                    <div>
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={rule.telegram?.enabled || false}
                          onChange={(e) => updateNotificationRule(rule.id, { 
                            telegram: { ...rule.telegram, enabled: e.target.checked, botToken: rule.telegram?.botToken || '', chatId: rule.telegram?.chatId || '' }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Telegram</span>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="password"
                          value={rule.telegram?.botToken || ''}
                          onChange={(e) => updateNotificationRule(rule.id, { 
                            telegram: { ...rule.telegram, enabled: rule.telegram?.enabled || false, botToken: e.target.value, chatId: rule.telegram?.chatId || '' }
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Bot Token"
                        />
                        <input
                          type="text"
                          value={rule.telegram?.chatId || ''}
                          onChange={(e) => updateNotificationRule(rule.id, { 
                            telegram: { ...rule.telegram, enabled: rule.telegram?.enabled || false, botToken: rule.telegram?.botToken || '', chatId: e.target.value }
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Chat ID"
                        />
                      </div>
                    </div>

                    {/* Rule Email Settings */}
                    <div>
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={rule.email?.enabled || false}
                          onChange={(e) => updateNotificationRule(rule.id, { 
                            email: { enabled: e.target.checked, recipients: rule.email?.recipients || '' }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Email</span>
                      </div>
                      <input
                        type="text"
                        value={rule.email?.recipients || ''}
                        onChange={(e) => updateNotificationRule(rule.id, { 
                          email: { enabled: rule.email?.enabled || false, recipients: e.target.value }
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="email1@example.com, email2@example.com"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {config.notifications.rules.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <p>Nessuna regola configurata</p>
                  <p className="text-sm">Aggiungi regole per notifiche condizionali basate sul contenuto dei log</p>
                </div>
              )}
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
