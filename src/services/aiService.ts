
interface OpenWebUIConfig {
  url: string;
  apiKey: string;
  model: string;
}

export interface LogAnalysisResult {
  isAnomalous: boolean;
  severity: 'critical' | 'warning' | 'info';
  summary: string;
  suggestion: string;
  confidence: number;
}

export class AIService {
  private config: OpenWebUIConfig;

  constructor(config: OpenWebUIConfig) {
    this.config = config;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.url}/api/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('OpenWebUI connection test failed:', error);
      return false;
    }
  }

  async analyzeLog(logMessage: string, host: string, timestamp: string): Promise<LogAnalysisResult> {
    const prompt = `
Analyze this log message for potential security issues, errors, or anomalies:

Host: ${host}
Timestamp: ${timestamp}
Log: ${logMessage}

Please provide:
1. Is this anomalous or concerning? (yes/no)
2. Severity level (critical/warning/info)
3. Brief summary of the issue
4. Specific remediation steps or commands
5. Confidence level (0-100)

Format your response as JSON with keys: isAnomalous, severity, summary, suggestion, confidence
    `.trim();

    try {
      const response = await fetch(`${this.config.url}/api/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a cybersecurity expert analyzing log files. Respond only with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      try {
        return JSON.parse(aiResponse);
      } catch (parseError) {
        // Fallback se la risposta non è JSON valido
        return {
          isAnomalous: logMessage.toLowerCase().includes('error') || logMessage.toLowerCase().includes('failed'),
          severity: 'warning' as const,
          summary: 'Log analysis completed with basic pattern matching',
          suggestion: 'Review the log manually for potential issues',
          confidence: 50
        };
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      return {
        isAnomalous: false,
        severity: 'info' as const,
        summary: 'Unable to analyze log with AI',
        suggestion: 'Manual review recommended',
        confidence: 0
      };
    }
  }
}
