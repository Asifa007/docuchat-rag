// src/components/ChatArea.jsx
// Main chat interface with message bubbles, typing indicator, and input

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, FileText, ChevronDown, Sparkles, User } from 'lucide-react';
import MessageBubble from './MessageBubble';

const MAX_CHARS = 500;

export default function ChatArea({ messages, isGenerating, documentName, onSend }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!showScrollBtn) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, showScrollBtn]);

  // Detect if user scrolled up
  const handleScroll = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBtn(false);
  };

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isGenerating || input.length > MAX_CHARS) return;
    onSend(input.trim());
    setInput('');
    inputRef.current?.focus();
  }, [input, isGenerating, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charsLeft = MAX_CHARS - input.length;
  const isOverLimit = charsLeft < 0;

  return (
    <div className="flex flex-col h-full relative">

      {/* Chat header */}
      <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor: '#1a1a2e', background: 'rgba(13,13,20,0.8)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)' }}>
            <FileText size={14} style={{ color: '#8b85ff' }} />
          </div>
          <div>
            <p className="text-sm font-display font-600 text-white truncate max-w-xs">{documentName}</p>
            <p className="text-xs" style={{ color: '#3a3a5a' }}>
              {messages.length} messages · RAG Mode
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 text-xs font-mono"
          style={{ color: '#00d4aa' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: '#00d4aa', boxShadow: '0 0 6px #00d4aa' }} />
          {isGenerating ? 'Thinking...' : 'Ready'}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={messagesRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

        {messages.length === 0 && (
          <EmptyState documentName={documentName} />
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} message={msg} index={i} />
        ))}

        {/* Typing indicator */}
        {isGenerating && (
          <div className="flex items-start gap-3 msg-ai">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)' }}>
              <Sparkles size={14} style={{ color: '#8b85ff' }} />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(42,42,69,0.6)' }}>
              <div className="flex items-center gap-1">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span className="text-xs font-mono ml-1" style={{ color: '#3a3a5a' }}>
                Searching document...
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 w-9 h-9 rounded-xl flex items-center justify-center
            shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(108,99,255,0.9)', border: '1px solid rgba(139,133,255,0.4)' }}>
          <ChevronDown size={16} className="text-white" />
        </button>
      )}

      {/* Input area */}
      <div className="px-6 py-4 flex-shrink-0 border-t" style={{ borderColor: '#1a1a2e' }}>
        <div className="relative">
          <div className="flex items-end gap-3 p-3 rounded-2xl transition-all duration-200"
            style={{
              background: 'rgba(18,18,30,0.95)',
              border: `1px solid ${input.length > 0 ? 'rgba(108,99,255,0.4)' : '#2a2a45'}`,
              boxShadow: input.length > 0 ? '0 0 20px rgba(108,99,255,0.1)' : 'none',
            }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your document..."
              rows={1}
              disabled={isGenerating}
              className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed"
              style={{
                color: '#e8e8f0',
                minHeight: '24px',
                maxHeight: '120px',
                fontFamily: '"DM Sans", sans-serif',
              }}
            />

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Char counter */}
              <span className={`text-xs font-mono ${isOverLimit ? 'text-ember' : ''}`}
                style={{ color: isOverLimit ? '#ff6b6b' : charsLeft < 50 ? '#ffd93d' : '#3a3a5a' }}>
                {charsLeft}
              </span>

              {/* Send button */}
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isGenerating || isOverLimit}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  transition-all duration-200 hover:scale-105 active:scale-95
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: input.trim() && !isGenerating && !isOverLimit
                    ? 'linear-gradient(135deg, #6c63ff, #4a43cc)'
                    : '#1a1a2e',
                  border: '1px solid rgba(108,99,255,0.3)',
                  boxShadow: input.trim() && !isGenerating ? '0 0 16px rgba(108,99,255,0.4)' : 'none',
                }}>
                {isGenerating
                  ? <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: '#6c63ff', borderTopColor: 'transparent' }} />
                  : <Send size={14} className="text-white" style={{ transform: 'rotate(0deg)' }} />
                }
              </button>
            </div>
          </div>

          {/* Hint */}
          <p className="text-xs mt-2 text-center" style={{ color: '#2a2a45' }}>
            Press <kbd className="font-mono px-1 py-0.5 rounded text-xs"
              style={{ background: '#1a1a2e', border: '1px solid #2a2a45' }}>Enter</kbd> to send ·{' '}
            <kbd className="font-mono px-1 py-0.5 rounded text-xs"
              style={{ background: '#1a1a2e', border: '1px solid #2a2a45' }}>Shift+Enter</kbd> for newline
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ documentName }) {
  const SUGGESTED = [
    'What is this document about?',
    'Summarize the key points',
    'What are the main conclusions?',
    'List the important dates mentioned',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 animate-float"
        style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)' }}>
        <Sparkles size={24} style={{ color: '#6c63ff' }} />
      </div>
      <h3 className="font-display font-600 text-white text-lg mb-2">
        Document Ready
      </h3>
      <p className="text-sm mb-8 max-w-sm" style={{ color: '#6666aa' }}>
        Ask me anything about <strong style={{ color: '#8b85ff' }}>{documentName}</strong>.
        I'll answer strictly from its contents.
      </p>

      <div className="grid grid-cols-2 gap-2 max-w-sm w-full">
        {SUGGESTED.map((q) => (
          <div key={q} className="text-left px-3 py-2.5 rounded-xl text-xs cursor-default"
            style={{
              background: 'rgba(18,18,30,0.8)',
              border: '1px solid #1a1a2e',
              color: '#6666aa',
            }}>
            "{q}"
          </div>
        ))}
      </div>
    </div>
  );
}
