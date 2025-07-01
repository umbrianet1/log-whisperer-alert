
import { AIService } from './aiService';
import { ConfigService } from './configService';
import { WebhookService, IncomingMessage, AIResponse } from './webhookService';
import { NotificationService } from './notificationService';

export class AIResponseService {
  private aiService: AIService;
  private notificationService: NotificationService;

  constructor() {
    const config = ConfigService.loadConfig();
    this.aiService = new AIService(config.openwebui);
    this.notificationService = new NotificationService(config.notifications);
  }

  async processIncomingMessage(message: IncomingMessage): Promise<AIResponse | null> {
    try {
      const prompt = this.buildResponsePrompt(message);
      
      // Usa l'AI per generare una risposta
      const response = await fetch(`${ConfigService.loadConfig().openwebui.url}/api/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ConfigService.loadConfig().openwebui.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: ConfigService.loadConfig().openwebui.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      const aiResponseObj: AIResponse = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        alertId: message.relatedAlertId || 'unknown',
        userMessage: message.message,
        aiResponse: aiResponse,
        confidence: 85
      };

      WebhookService.saveAIResponse(aiResponseObj);
      
      // Invia la risposta dell'AI attraverso il canale originale
      await this.sendAIResponse(message, aiResponse);
      
      return aiResponseObj;
    } catch (error) {
      console.error('Failed to process incoming message:', error);
      return null;
    }
  }

  private buildResponsePrompt(message: IncomingMessage): string {
    const language = ConfigService.loadConfig().openwebui.language;
    
    const languageInstructions = {
      'italian': 'Rispondi sempre in italiano.',
      'english': 'Always respond in English.',
      'spanish': 'Responde siempre en español.',
      'french': 'Réponds toujours en français.',
      'german': 'Antworte immer auf Deutsch.'
    };

    const langInstruction = languageInstructions[language as keyof typeof languageInstructions] || languageInstructions['english'];

    return `
${langInstruction}

Sei un assistente AI specializzato in cybersecurity che aiuta gli amministratori di sistema.

Messaggio ricevuto da: ${message.sender}
Canale: ${message.source}
Timestamp: ${message.timestamp}
${message.relatedAlertId ? `Alert correlato: ${message.relatedAlertId}` : ''}

Messaggio dell'utente:
"${message.message}"

Fornisci una risposta utile e professionale. Se l'utente chiede informazioni tecniche, fornisci dettagli specifici e comandi quando appropriato.
    `.trim();
  }

  private getSystemPrompt(): string {
    const language = ConfigService.loadConfig().openwebui.language;
    
    const systemPrompts = {
      'italian': 'Sei un esperto di cybersecurity e amministrazione di sistema. Fornisci sempre risposte precise, professionali e utili in italiano.',
      'english': 'You are a cybersecurity and system administration expert. Always provide precise, professional, and helpful responses in English.',
      'spanish': 'Eres un experto en ciberseguridad y administración de sistemas. Siempre proporciona respuestas precisas, profesionales y útiles en español.',
      'french': 'Tu es un expert en cybersécurité et administration système. Fournis toujours des réponses précises, professionnelles et utiles en français.',
      'german': 'Du bist ein Experte für Cybersicherheit und Systemadministration. Gib immer präzise, professionelle und hilfreiche Antworten auf Deutsch.'
    };

    return systemPrompts[language as keyof typeof systemPrompts] || systemPrompts['english'];
  }

  private async sendAIResponse(originalMessage: IncomingMessage, aiResponse: string): Promise<void> {
    try {
      if (originalMessage.source === 'telegram') {
        // In un ambiente reale, invieresti la risposta via Telegram
        console.log(`AI Response to Telegram ${originalMessage.sender}:`, aiResponse);
      } else if (originalMessage.source === 'email') {
        // In un ambiente reale, invieresti la risposta via email
        console.log(`AI Response to Email ${originalMessage.sender}:`, aiResponse);
      }
    } catch (error) {
      console.error('Failed to send AI response:', error);
    }
  }
}
