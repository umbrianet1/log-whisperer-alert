
import React, { useState, useEffect } from 'react';
import { MessageSquare, Bot, User, Clock, Mail, Send, Trash2 } from 'lucide-react';
import { WebhookService, IncomingMessage, AIResponse } from '../services/webhookService';
import { AIResponseService } from '../services/aiResponseService';
import { useToast } from '@/hooks/use-toast';

const AIConversations = () => {
  const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>([]);
  const [aiResponses, setAIResponses] = useState<AIResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [testSource, setTestSource] = useState<'email' | 'telegram'>('telegram');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Ricarica ogni 5 secondi
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setIncomingMessages(WebhookService.getIncomingMessages());
    setAIResponses(WebhookService.getAIResponses());
  };

  const processMessage = async (message: IncomingMessage) => {
    setIsProcessing(message.id);
    try {
      const aiResponseService = new AIResponseService();
      const response = await aiResponseService.processIncomingMessage(message);
      
      if (response) {
        loadData();
        toast({
          title: "Messaggio processato",
          description: "L'AI ha generato una risposta"
        });
      } else {
        toast({
          title: "Errore",
          description: "Impossibile processare il messaggio",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Errore AI",
        description: "Errore nel processamento del messaggio",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const sendTestMessage = () => {
    if (!testMessage.trim()) return;

    if (testSource === 'telegram') {
      WebhookService.simulateTelegramWebhook(testMessage, '@testuser');
    } else {
      WebhookService.simulateEmailWebhook(testMessage, 'test@example.com');
    }

    setTestMessage('');
    loadData();
    toast({
      title: "Messaggio di test inviato",
      description: `Messaggio simulato via ${testSource}`
    });
  };

  const clearAllData = () => {
    localStorage.removeItem('logguard-ai-responses');
    localStorage.removeItem('logguard-incoming-messages');
    loadData();
    toast({
      title: "Dati cancellati",
      description: "Tutti i messaggi e le risposte sono stati eliminati"
    });
  };

  const getRelatedResponses = (messageId: string): AIResponse[] => {
    return aiResponses.filter(response => response.alertId === messageId);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversazioni AI</h1>
            <p className="text-gray-600">Gestisci le risposte AI agli allarmi ricevuti via email e Telegram</p>
          </div>
          
          <button
            onClick={clearAllData}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Pulisci tutto</span>
          </button>
        </div>
      </div>

      {/* Test Message Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Messaggi</h2>
        <div className="flex items-center space-x-4">
          <select
            value={testSource}
            onChange={(e) => setTestSource(e.target.value as 'email' | 'telegram')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="telegram">Telegram</option>
            <option value="email">Email</option>
          </select>
          
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Scrivi un messaggio di test..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
          />
          
          <button
            onClick={sendTestMessage}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Invia</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incoming Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Messaggi in Arrivo</h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                {incomingMessages.length}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {incomingMessages.map((message) => (
              <div key={message.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {message.source === 'email' ? (
                      <Mail className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Send className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900">{message.sender}</span>
                  </div>
                  
                  <button
                    onClick={() => processMessage(message)}
                    disabled={isProcessing === message.id}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Bot className="w-3 h-3" />
                    <span>{isProcessing === message.id ? 'Processando...' : 'Processa'}</span>
                  </button>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{message.message}</p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(message.timestamp).toLocaleString()}</span>
                  </span>
                  {message.relatedAlertId && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Alert: {message.relatedAlertId.slice(-8)}
                    </span>
                  )}
                </div>
                
                {getRelatedResponses(message.id).length > 0 && (
                  <div className="mt-2 text-xs text-green-600">
                    ✓ Processato dall'AI
                  </div>
                )}
              </div>
            ))}
            
            {incomingMessages.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>Nessun messaggio ricevuto</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Responses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Risposte AI</h2>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                {aiResponses.length}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {aiResponses.map((response) => (
              <div key={response.id} className="p-4">
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Utente:</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6 bg-gray-50 p-2 rounded">
                    {response.userMessage}
                  </p>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">AI:</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {response.confidence}% fiducia
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 ml-6 bg-green-50 p-2 rounded">
                    {response.aiResponse}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(response.timestamp).toLocaleString()}</span>
                  </span>
                </div>
              </div>
            ))}
            
            {aiResponses.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>Nessuna risposta AI generata</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConversations;
