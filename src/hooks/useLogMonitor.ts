
import { useState, useEffect, useCallback } from 'react';
import { GraylogService } from '../services/graylogService';
import { AIService } from '../services/aiService';
import { NotificationService } from '../services/notificationService';
import { ConfigService } from '../services/configService';

interface Alert {
  id: string;
  timestamp: string;
  host: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  aiSuggestion: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

export const useLogMonitor = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [services, setServices] = useState<{
    graylog?: GraylogService;
    ai?: AIService;
    notification?: NotificationService;
  }>({});

  const initializeServices = useCallback(() => {
    const config = ConfigService.loadConfig();
    
    const graylogService = new GraylogService(config.graylog);
    const aiService = new AIService(config.openwebui);
    const notificationService = new NotificationService(config.notifications);

    setServices({
      graylog: graylogService,
      ai: aiService,
      notification: notificationService
    });
  }, []);

  const startMonitoring = useCallback(async () => {
    if (!services.graylog || !services.ai || !services.notification) {
      console.error('Services not initialized');
      return;
    }

    setIsMonitoring(true);

    // Test delle connessioni
    const graylogConnected = await services.graylog.testConnection();
    const aiConnected = await services.ai.testConnection();

    if (!graylogConnected) {
      console.error('Graylog connection failed');
      setIsMonitoring(false);
      return;
    }

    if (!aiConnected) {
      console.warn('AI service connection failed, using fallback analysis');
    }

    // Avvia il monitoraggio
    const stopStreaming = await services.graylog.streamMessages(async (message) => {
      try {
        const analysis = await services.ai!.analyzeLog(
          message.full_message,
          message.host,
          message.timestamp
        );

        if (analysis.isAnomalous && analysis.confidence > 70) {
          const alert: Alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            host: message.host,
            level: analysis.severity,
            message: analysis.summary,
            aiSuggestion: analysis.suggestion,
            status: 'new'
          };

          setAlerts(prev => [alert, ...prev]);

          // Invia notifica
          await services.notification!.sendAlert({
            id: alert.id,
            timestamp: alert.timestamp,
            host: alert.host,
            level: alert.level,
            message: alert.message,
            aiSuggestion: alert.aiSuggestion
          });
        }
      } catch (error) {
        console.error('Error processing log message:', error);
      }
    });

    // Salva la funzione per fermare il monitoraggio
    return stopStreaming;
  }, [services]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    // In un'implementazione reale, chiameresti la funzione di stop qui
  }, []);

  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  return {
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    initializeServices
  };
};
