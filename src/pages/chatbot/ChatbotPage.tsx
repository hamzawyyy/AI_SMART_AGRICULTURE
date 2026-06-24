import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { chatApi } from '../../api/chatApi';
import type { ChatMessage } from '../../api/chatApi';

// ── tiny id helper ──────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// ── Icons (inline SVG to keep zero deps) ───────────────────
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /><line x1="12" y1="3" x2="12" y2="1" /><line x1="8" y1="15" x2="8" y2="17" /><line x1="16" y1="15" x2="16" y2="17" />
  </svg>
);
const TranslateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
  </svg>
);
const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

// ── Suggested prompts ───────────────────────────────────────
const SUGGESTIONS = {
  ar: [
    'كيف أكتشف مرض اللفحة في الطماطم؟',
    'ما هي معايير تصدير الفراولة للسوق الأوروبية؟',
    'كيف أحسّن جودة محصول البرتقال؟',
    'ما هي درجة الحرارة المثالية لتخزين المحاصيل؟',
  ],
  en: [
    'How to detect blight disease in tomatoes?',
    'What are strawberry export standards for the EU?',
    'How to improve orange crop quality?',
    'What is the ideal storage temperature for crops?',
  ],
};

// ── Typing indicator ────────────────────────────────────────
const TypingDots: React.FC = () => (
  <div style={{ display: 'flex', gap: '4px', padding: '4px 0', alignItems: 'center' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: '50%',
        background: 'var(--emerald)',
        animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        display: 'block',
      }} />
    ))}
    <style>{`
      @keyframes typingBounce {
        0%,60%,100%{transform:translateY(0);opacity:.4}
        30%{transform:translateY(-6px);opacity:1}
      }
    `}</style>
  </div>
);

// ── Message bubble ──────────────────────────────────────────
const MessageBubble: React.FC<{ msg: ChatMessage; ar: boolean }> = ({ msg, ar }) => {
  const isBot = msg.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const time = new Date(msg.timestamp).toLocaleTimeString(ar ? 'ar-EG' : 'en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: isBot ? 'row' : 'row-reverse',
      gap: 10,
      alignItems: 'flex-end',
      marginBottom: 16,
    }}>
      {/* Avatar */}
      {isBot && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #10b981, #22d3ee)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
        }}>
          <BotIcon />
        </div>
      )}

      {/* Bubble */}
      <div style={{ maxWidth: '72%' }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: isBot ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
          background: isBot
            ? 'var(--bg-card)'
            : 'linear-gradient(135deg, #10b981, #059669)',
          border: isBot ? '1px solid var(--border)' : 'none',
          color: isBot ? 'var(--text-primary)' : '#fff',
          fontSize: 14,
          lineHeight: 1.65,
          wordBreak: 'break-word',
        }}>
         <span dangerouslySetInnerHTML={{
  __html: msg.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}} />
        </div>

        {/* Meta row */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 4, alignItems: 'center',
          justifyContent: isBot ? 'flex-start' : 'flex-end',
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{time}</span>
          {isBot && (
            <button onClick={copy} title={ar ? 'نسخ' : 'Copy'}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center',
                transition: 'color .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--emerald)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {copied ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : <CopyIcon />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main page ───────────────────────────────────────────────
export const ChatbotPage: React.FC = () => {
  const { language, user } = useApp();
  const ar = language === 'ar';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [translateMode, setTranslateMode] = useState(false);
  const [translateTarget, setTranslateTarget] = useState<'ar' | 'en'>('en');
  const [charCount, setCharCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 1000;

  // init session + welcome message
  useEffect(() => {
    (async () => {
      const { sessionId: sid } = await chatApi.createSession();
      setSessionId(sid);
      const welcome: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: ar
          ? `مرحبًا ${user?.name || ''}! 👋 أنا مساعدك الزراعي الذكي. يمكنني مساعدتك في:\n• كشف أمراض المحاصيل\n• تقييم جودة المنتجات\n• توصيات التصدير (EU / Gulf / Local)\n• تحليل البيئة الزراعية\n\nكيف يمكنني مساعدتك اليوم؟`
          : `Hello ${user?.name || ''}! 👋 I'm your smart agricultural assistant. I can help with:\n• Crop disease detection\n• Quality assessment\n• Export recommendations (EU / Gulf / Local)\n• Environmental analysis\n\nHow can I help you today?`,
        timestamp: new Date().toISOString(),
        language,
      };
      setMessages([welcome]);
    })();
  }, []);

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setCharCount(e.target.value.length);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = {
      id: uid(), role: 'user', content, timestamp: new Date().toISOString(), language,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setCharCount(0);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      if (translateMode) {
        const res = await chatApi.translateText(content, translateTarget);
        if (res.success) {
          const botMsg: ChatMessage = {
            id: uid(), role: 'assistant',
            content: res.data.translatedText,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, botMsg]);
        }
      } else {
        const res = await chatApi.sendMessage(content, sessionId, language);
        if (res.success) {
          const botMsg: ChatMessage = {
            id: uid(), role: 'assistant',
            content: res.data.message,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, botMsg]);
        }
      }
    } catch {
      const errMsg: ChatMessage = {
        id: uid(), role: 'assistant',
        content: ar ? 'عذرًا، حدث خطأ. حاول مرة أخرى.' : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, language, translateMode, translateTarget, ar]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([]);
    chatApi.createSession().then(({ sessionId: sid }) => setSessionId(sid));
  };

  const suggestions = SUGGESTIONS[language] || SUGGESTIONS.ar;

  // ── render ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', overflow: 'hidden' }}>

      {/* ── Header bar ── */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, background: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #10b981, #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 0 16px rgba(16,185,129,0.35)',
          }}>
            <BotIcon />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {ar ? 'المساعد الزراعي الذكي' : 'Smart Agri Assistant'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald)', display: 'block' }} />
              <span style={{ fontSize: 12, color: 'var(--emerald)' }}>
                {ar ? 'متصل — مدعوم بـ AraBERT + LLM' : 'Online — Powered by AraBERT + LLM'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Translate toggle */}
          <button
            onClick={() => setTranslateMode(p => !p)}
            title={ar ? 'وضع الترجمة' : 'Translate mode'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, border: '1px solid',
              borderColor: translateMode ? 'var(--cyan)' : 'var(--border)',
              background: translateMode ? 'rgba(34,211,238,0.1)' : 'transparent',
              color: translateMode ? 'var(--cyan)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
            }}
          >
            <TranslateIcon />
            {ar ? 'ترجمة' : 'Translate'}
          </button>

          {/* Lang switch for translate */}
          {translateMode && (
            <button
              onClick={() => setTranslateTarget(p => p === 'ar' ? 'en' : 'ar')}
              style={{
                padding: '6px 12px', borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)', fontSize: 12,
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              {translateTarget === 'ar' ? '→ العربية' : '→ English'}
            </button>
          )}

          {/* Clear */}
          <button
            onClick={clearChat}
            title={ar ? 'محادثة جديدة' : 'New chat'}
            style={{
              padding: '6px 10px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 24px',
        background: 'var(--bg-base)',
      }}>
        {/* Suggestions (show only when no user messages) */}
        {messages.length <= 1 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.05em' }}>
              {ar ? 'اقتراحات' : 'SUGGESTIONS'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  style={{
                    padding: '8px 14px', borderRadius: 20,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    fontSize: 13, cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--emerald)';
                    e.currentTarget.style.color = 'var(--emerald)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} ar={ar} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #10b981, #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            }}>
              <BotIcon />
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: '4px 18px 18px 18px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ── */}
      <div style={{
        padding: '16px 24px', borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        {translateMode && (
          <div style={{
            marginBottom: 10, padding: '6px 12px', borderRadius: 8,
            background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)',
            fontSize: 12, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <TranslateIcon />
            {ar
              ? `وضع الترجمة: الترجمة إلى ${translateTarget === 'ar' ? 'العربية' : 'الإنجليزية'}`
              : `Translate mode: → ${translateTarget === 'ar' ? 'Arabic' : 'English'}`
            }
          </div>
        )}

        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16, padding: '10px 14px',
          transition: 'border-color .2s',
        }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--emerald)')}
          onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_CHARS}
            placeholder={
              translateMode
                ? (ar ? 'اكتب النص للترجمة...' : 'Enter text to translate...')
                : (ar ? 'اسألني عن محاصيلك... (Enter للإرسال، Shift+Enter لسطر جديد)' : 'Ask about your crops... (Enter to send, Shift+Enter for new line)')
            }
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              resize: 'none', color: 'var(--text-primary)', fontSize: 14,
              lineHeight: 1.6, fontFamily: 'inherit',
              minHeight: 24, maxHeight: 120, overflow: 'auto',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {charCount > 0 && (
              <span style={{ fontSize: 10, color: charCount > MAX_CHARS * 0.9 ? 'var(--rose)' : 'var(--text-muted)' }}>
                {charCount}/{MAX_CHARS}
              </span>
            )}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none',
                background: input.trim() && !isLoading
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'var(--bg-base)',
                color: input.trim() && !isLoading ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all .2s', flexShrink: 0,
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
          {ar
            ? 'المساعد قد يرتكب أخطاء. تحقق دائمًا من التوصيات الزراعية المهمة.'
            : 'The assistant may make mistakes. Always verify important agricultural recommendations.'}
        </p>
      </div>
    </div>
  );
};

export default ChatbotPage;
