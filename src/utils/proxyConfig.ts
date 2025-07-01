
import { ConfigService } from '../services/configService';

export const updateGraylogProxy = () => {
  const config = ConfigService.loadConfig();
  
  // Imposta la variabile d'ambiente per il proxy
  if (typeof window !== 'undefined' && config.graylog.url) {
    // Per l'ambiente di sviluppo, possiamo utilizzare sessionStorage
    // per comunicare l'URL al proxy (anche se non è la soluzione ideale)
    sessionStorage.setItem('graylog_proxy_url', config.graylog.url);
  }
};

export const getGraylogProxyUrl = (): string => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('graylog_proxy_url') || 'http://localhost:9000';
  }
  return 'http://localhost:9000';
};
