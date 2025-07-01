
interface EmailConfig {
  enabled: boolean;
  smtp: string;
  port: number;
  username: string;
  password: string;
  recipients: string;
}

interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

interface NotificationConfig {
  email: EmailConfig;
  telegram: TelegramConfig;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  host: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  aiSuggestion: string;
}

export class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  async sendTelegramNotification(alert: AlertNotification): Promise<boolean> {
    if (!this.config.telegram.enabled || !this.config.telegram.botToken) {
      return false;
    }

    const message = `
🚨 *LogGuard AI Alert*

*Level:* ${alert.level.toUpperCase()}
*Host:* ${alert.host}
*Time:* ${alert.timestamp}

*Issue:* ${alert.message}

🤖 *AI Suggestion:*
${alert.aiSuggestion}
    `.trim();

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.config.telegram.chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      return false;
    }
  }

  async sendEmailNotification(alert: AlertNotification): Promise<boolean> {
    if (!this.config.email.enabled) {
      return false;
    }

    // Per l'email, in un ambiente reale useresti un servizio backend
    // Qui simuliamo con un webhook o servizio esterno come EmailJS
    console.log('Email notification would be sent:', {
      to: this.config.email.recipients,
      subject: `LogGuard AI Alert - ${alert.level.toUpperCase()} on ${alert.host}`,
      body: `
        Alert Details:
        - Level: ${alert.level.toUpperCase()}
        - Host: ${alert.host}
        - Timestamp: ${alert.timestamp}
        - Message: ${alert.message}
        
        AI Suggestion:
        ${alert.aiSuggestion}
      `
    });

    return true; // Simulazione successo
  }

  async sendAlert(alert: AlertNotification): Promise<void> {
    const promises = [];

    if (this.config.telegram.enabled) {
      promises.push(this.sendTelegramNotification(alert));
    }

    if (this.config.email.enabled) {
      promises.push(this.sendEmailNotification(alert));
    }

    await Promise.all(promises);
  }
}
