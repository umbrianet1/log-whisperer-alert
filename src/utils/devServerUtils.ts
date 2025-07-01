
export const showRestartNotification = () => {
  console.log('🔄 Per applicare le modifiche al proxy di Graylog, riavvia il server di sviluppo');
  console.log('💡 Suggerimento: Usa Ctrl+C per fermare il server, poi riavvia con npm run dev');
  
  // In un ambiente di produzione, questo non sarebbe necessario
  if (import.meta.env.DEV) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    notification.innerHTML = `
      <strong>⚠️ Riavvio necessario</strong><br>
      Riavvia il server per applicare le modifiche al proxy Graylog
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 8000);
  }
};
