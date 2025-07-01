
export const showRestartNotification = () => {
  console.log('🔄 Per applicare le modifiche al proxy di Graylog, riavvia il server di sviluppo');
  console.log('💡 Suggerimento: Ferma il server (Ctrl+C) e riavvia con:');
  console.log('   VITE_GRAYLOG_URL="http://192.168.1.136:9000" npm run dev');
  
  // In un ambiente di produzione, questo non sarebbe necessario
  if (import.meta.env.DEV) {
    const graylogUrl = localStorage.getItem('graylog_proxy_url') || 'http://localhost:9000';
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 400px;
      line-height: 1.4;
    `;
    notification.innerHTML = `
      <div style="margin-bottom: 8px;"><strong>⚠️ Riavvio necessario</strong></div>
      <div style="margin-bottom: 8px;">Per applicare l'URL Graylog, riavvia con:</div>
      <code style="background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px; display: block; font-size: 12px; word-break: break-all;">
        VITE_GRAYLOG_URL="${graylogUrl}" npm run dev
      </code>
    `;
    
    document.body.appendChild(notification);
    
    // Rimuovi dopo 15 secondi per dare tempo di leggere
    setTimeout(() => {
      notification.remove();
    }, 15000);
  }
};
