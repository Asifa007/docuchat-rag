// src/components/Sidebar.jsx

import { FileText, MessageSquare, Database, Trash2, Plus } from 'lucide-react';

export default function Sidebar({
  status,
  documentName,
  chunkCount,
  messageCount,
  phase,
  onClear,
  onNewUpload,
}) {
  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col relative z-10 border-r"
      style={{ background: 'rgba(13,13,20,0.95)', borderColor: '#1a1a2e' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: '#1a1a2e' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4aa)' }}
          >
            <MessageSquare size={14} className="text-white" />
          </div>
          <div>
            <span className="font-display font-700 text-white text-sm tracking-tight">
              DocuChat
            </span>
            <p className="text-xs" style={{ color: '#3a3a5a' }}>
              AI Document Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-4 border-b" style={{ borderColor: '#1a1a2e' }}>
        <p
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: '#3a3a5a' }}
        >
          System Status
        </p>

        <StatusRow
          label="Document Loaded"
          ok={status.document_loaded}
          icon={FileText}
        />

        <StatusRow
          label="Vector Index Ready"
          ok={status.document_loaded}
          icon={Database}
        />
      </div>

      {/* Document info */}
      {documentName && (
        <div className="px-4 py-4 border-b" style={{ borderColor: '#1a1a2e' }}>
          <p
            className="text-xs font-mono uppercase tracking-widest mb-3"
            style={{ color: '#3a3a5a' }}
          >
            Active Document
          </p>

          <div
            className="rounded-xl p-3"
            style={{
              background: 'rgba(108,99,255,0.08)',
              border: '1px solid rgba(108,99,255,0.15)',
            }}
          >
            <div className="flex items-start gap-2">
              <FileText
                size={14}
                className="mt-0.5 flex-shrink-0"
                style={{ color: '#6c63ff' }}
              />
              <div className="min-w-0">
                <p className="text-xs font-body text-white truncate font-500">
                  {documentName}
                </p>
                <p className="text-xs mt-1" style={{ color: '#6666aa' }}>
                  {chunkCount} chunks indexed
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {phase === 'chat' && (
        <div className="px-4 py-4 border-b" style={{ borderColor: '#1a1a2e' }}>
          <p
            className="text-xs font-mono uppercase tracking-widest mb-3"
            style={{ color: '#3a3a5a' }}
          >
            Session Stats
          </p>

          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Messages" value={messageCount} color="#6c63ff" />
            <StatCard label="Chunks" value={chunkCount} color="#00d4aa" />
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div
        className="px-4 py-4 space-y-2 border-t"
        style={{ borderColor: '#1a1a2e' }}
      >
        <button
          onClick={onNewUpload}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-body transition-all hover:scale-[1.02] active:scale-95"
          style={{
            background: 'rgba(108,99,255,0.1)',
            border: '1px solid rgba(108,99,255,0.2)',
            color: '#8b85ff',
          }}
        >
          <Plus size={13} />
          New Document
        </button>

        {documentName && (
          <button
            onClick={onClear}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-body transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: 'rgba(255,107,107,0.08)',
              border: '1px solid rgba(255,107,107,0.2)',
              color: '#ff6b6b',
            }}
          >
            <Trash2 size={13} />
            Clear & Reset
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <p
          className="text-xs text-center"
          style={{ color: '#2a2a45' }}
        >
          Developed by <span style={{ color: '#6c63ff' }}>Asifa Firdhouse</span>
        </p>
      </div>
    </aside>
  );
}

function StatusRow({ label, ok, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <Icon size={12} style={{ color: ok ? '#00d4aa' : '#3a3a5a' }} />
        <span
          className="text-xs font-body"
          style={{ color: ok ? '#8888aa' : '#3a3a5a' }}
        >
          {label}
        </span>
      </div>

      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: ok ? '#00d4aa' : '#2a2a45',
          boxShadow: ok ? '0 0 6px #00d4aa' : 'none',
        }}
      />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: 'rgba(26,26,46,0.6)',
        border: '1px solid #2a2a45',
      }}
    >
      <p className="font-display font-700 text-lg" style={{ color }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: '#3a3a5a' }}>
        {label}
      </p>
    </div>
  );
}