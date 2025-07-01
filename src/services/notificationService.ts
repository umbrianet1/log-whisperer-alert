
import { NotificationRule } from './configService';

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
  rules: NotificationRule[];
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  host: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  aiSuggestion: string;
  logContent?: string;
}

export class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  private getMatchingRules(logContent: string): NotificationRule[] {
    return this.config.rules.filter(rule => 
      rule.enabled && logContent.includes(rule.matchString)
    );
  }

  async sendTelegramNotification(alert: AlertNotification, telegramConfig: TelegramConfig): Promise<boolean> {
    if (!telegramConfig.enabled || !telegramConfig.botToken) {
      return false;
    }

    const replyInstructions = `

💬 *Puoi rispondere a questo messaggio per interagire con l'AI*
L'AI processerà la tua risposta e fornirà assistenza aggiuntiva.

🔗 Alert ID: \`${alert.id}\``;

    const message = `
🚨 *LogGuard AI Alert*

*Level:* ${alert.level.toUpperCase()}
*Host:* ${alert.host}
*Time:* ${alert.timestamp}

*Issue:* ${alert.message}

🤖 *AI Suggestion:*
${alert.aiSuggestion}${replyInstructions}
    `.trim();

    try {
      const response = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramConfig.chatId,
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

  async sendEmailNotification(alert: AlertNotification, recipients: string): Promise<boolean> {
    const replyInstructions = `
    
=== RISPONDI A QUESTA EMAIL PER INTERAGIRE CON L'AI ===
L'AI processerà la tua risposta e fornirà assistenza aggiuntiva.
Alert ID: ${alert.id}
=====================================================
    `;

    console.log('Email notification would be sent:', {
      to: recipients,
      subject: `LogGuard AI Alert - ${alert.level.toUpperCase()} on ${alert.host}`,
      body: `
        Alert Details:
        - Level: ${alert.level.toUpperCase()}
        - Host: ${alert.host}  
        - Timestamp: ${alert.timestamp}
        - Message: ${alert.message}
        
        AI Suggestion:
        ${alert.aiSuggestion}${replyInstructions}
      `
    });

    return true;
  }

  async sendAlert(alert: AlertNotification): Promise<void> {
    const promises: Promise<boolean>[] = [];
    const logContent = alert.logContent || alert.message;

    // Notifiche globali
    if (this.config.telegram.enabled) {
      promises.push(this.sendTelegramNotification(alert, this.config.telegram));
    }

    if (this.config.email.enabled) {
      promises.push(this.sendEmailNotification(alert, this.config.email.recipients));
    }

    // Notifiche condizionali basate su regole
    const matchingRules = this.getMatchingRules(logContent);
    
    for (const rule of matchingRules) {
      if (rule.telegram?.enabled && rule.telegram.botToken) {
        promises.push(this.sendTelegramNotification(alert, rule.telegram));
      }
      
      if (rule.email?.enabled && rule.email.recipients) {
        promises.push(this.sendEmailNotification(alert, rule.email.recipients));
      }
    }

    await Promise.all(promises);
  }
}
