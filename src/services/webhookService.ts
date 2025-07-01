
interface IncomingMessage {
  id: string;
  timestamp: string;
  source: 'email' | 'telegram';
  sender: string;
  message: string;
  relatedAlertId?: string;
}

interface AIResponse {
  id: string;
  timestamp: string;
  alertId: string;
  userMessage: string;
  aiResponse: string;
  confidence: number;
}

export class WebhookService {
  private static readonly RESPONSES_KEY = 'logguard-ai-responses';
  private static readonly MESSAGES_KEY = 'logguard-incoming-messages';

  static saveIncomingMessage(message: IncomingMessage): void {
    try {
      const stored = localStorage.getItem(this.MESSAGES_KEY);
      const messages: IncomingMessage[] = stored ? JSON.parse(stored) : [];
      messages.unshift(message);
      // Mantieni solo gli ultimi 100 messaggi
      if (messages.length > 100) {
        messages.splice(100);
      }
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save incoming message:', error);
    }
  }

  static getIncomingMessages(): IncomingMessage[] {
    try {
      const stored = localStorage.getItem(this.MESSAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load incoming messages:', error);
      return [];
    }
  }

  static saveAIResponse(response: AIResponse): void {
    try {
      const stored = localStorage.getItem(this.RESPONSES_KEY);
      const responses: AIResponse[] = stored ? JSON.parse(stored) : [];
      responses.unshift(response);
      // Mantieni solo le ultime 50 risposte
      if (responses.length > 50) {
        responses.splice(50);
      }
      localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(responses));
    } catch (error) {
      console.error('Failed to save AI response:', error);
    }
  }

  static getAIResponses(): AIResponse[] {
    try {
      const stored = localStorage.getItem(this.RESPONSES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load AI responses:', error);
      return [];
    }
  }

  // Simula la ricezione di messaggi Telegram (in un ambiente reale useresti un webhook)
  static simulateTelegramWebhook(message: string, chatId: string, alertId?: string): void {
    const incomingMessage: IncomingMessage = {
      id: `tg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      source: 'telegram',
      sender: chatId,
      message: message,
      relatedAlertId: alertId
    };
    
    this.saveIncomingMessage(incomingMessage);
    console.log('Telegram message received:', incomingMessage);
  }

  // Simula la ricezione di email (in un ambiente reale useresti un webhook)
  static simulateEmailWebhook(message: string, sender: string, alertId?: string): void {
    const incomingMessage: IncomingMessage = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      source: 'email',
      sender: sender,
      message: message,
      relatedAlertId: alertId
    };
    
    this.saveIncomingMessage(incomingMessage);
    console.log('Email message received:', incomingMessage);
  }
}

export type { IncomingMessage, AIResponse };
