// src/components/MessageBubble.jsx
// Individual chat message bubble with source citations

import { useState } from 'react';
import { User, Sparkles, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function MessageBubble({ message, index }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';

  // Format AI text with basic markdown-like rendering
  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e8e8f0">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="font-family:JetBrains Mono,monospace;background:rgba(108,99,255,0.1);padding:1px 4px;border-radius:4px;font-size:0.85em;color:#8b85ff">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  if (isUser) {
    return (
      <div className="flex justify-end msg-user">
        <div className="flex items-end gap-2 max-w-[75%]">
          <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed"
            style={{
              background: 'linear-gradient(135deg, #6c63ff, #4a43cc)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(108,99,255,0.25)',
            }}>
            {message.text}
          </div>
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.3)' }}>
            <User size={12} style={{ color: '#8b85ff' }} />
          </div>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex items-start gap-3 msg-ai">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: message.isError ? 'rgba(255,107,107,0.15)' : 'rgba(108,99,255,0.15)',
          border: `1px solid ${message.isError ? 'rgba(255,107,107,0.3)' : 'rgba(108,99,255,0.3)'}`,
        }}>
        <Sparkles size={13} style={{ color: message.isError ? '#ff6b6b' : '#8b85ff' }} />
      </div>

      {/* Bubble + Sources */}
      <div className="flex flex-col gap-2 max-w-[80%]">
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
          style={{
            background: message.isError ? 'rgba(255,107,107,0.06)' : 'rgba(26,26,46,0.9)',
            border: `1px solid ${message.isError ? 'rgba(255,107,107,0.2)' : 'rgba(42,42,69,0.6)'}`,
            color: message.isError ? '#ff6b6b' : '#d8d8e8',
          }}
          dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
        />

        {/* Source citations toggle */}
        {message.sources && message.sources.length > 0 && (
          <div>
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1.5 text-xs transition-all hover:opacity-80"
              style={{ color: '#6666aa' }}>
              <FileText size={11} />
              {showSources ? 'Hide' : 'Show'} {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
              {showSources ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>

            {showSources && (
              <div className="mt-2 space-y-1.5 animate-fade-in">
                {message.sources.map((src, i) => (
                  <div key={i}
                    className="px-3 py-2 rounded-xl text-xs leading-relaxed"
                    style={{
                      background: 'rgba(18,18,30,0.8)',
                      border: '1px solid rgba(108,99,255,0.1)',
                      color: '#4a4a6a',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.7rem',
                    }}>
                    <span style={{ color: '#3a3a5a' }}>chunk {i + 1}: </span>
                    {src}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs pl-1" style={{ color: '#2a2a45' }}>
          {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
