const BASE_URL = 'https://stash-collapse-snowbound.ngrok-free.dev';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: 'ar' | 'en';
}

export interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    sessionId: string;
    intent?: string;
    confidence?: number;
    sources?: string[];
  };
  message?: string;
}

export interface TranslateResponse {
  success: boolean;
  data: {
    translatedText: string;
    detectedLanguage: 'ar' | 'en';
    targetLanguage: 'ar' | 'en';
  };
}

export const chatApi = {
  sendMessage: async (
    content: string,
    sessionId: string,
    language: 'ar' | 'en' = 'ar'
  ): Promise<ChatResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      return {
        success: true,
        data: {
          message: data.message,
          sessionId,
          intent: data.intent,
          confidence: data.confidence,
          sources: [],
        },
      };
    } catch (err) {
      return {
        success: false,
        data: {
          message: language === 'ar'
            ? 'عذرًا، حدث خطأ في الاتصال. حاول مرة أخرى.'
            : 'Sorry, connection error. Please try again.',
          sessionId,
        },
      };
    }
  },

  translateText: async (
    text: string,
    targetLanguage: 'ar' | 'en'
  ): Promise<TranslateResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: targetLanguage === 'en'
            ? `Translate to English: ${text}`
            : `ترجم للعربية: ${text}`,
        }),
      });
      const data = await res.json();
      return {
        success: true,
        data: {
          translatedText: data.message,
          detectedLanguage: targetLanguage === 'en' ? 'ar' : 'en',
          targetLanguage,
        },
      };
    } catch (err) {
      return {
        success: false,
        data: {
          translatedText: text,
          detectedLanguage: targetLanguage === 'en' ? 'ar' : 'en',
          targetLanguage,
        },
      };
    }
  },

  createSession: async (): Promise<{ sessionId: string }> => {
    return { sessionId: `session_${Date.now()}` };
  },

  getChatHistory: async (): Promise<ChatMessage[]> => {
    return [];
  },
};