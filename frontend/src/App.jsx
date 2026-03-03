// src/App.jsx
// DocuChat — Offline AI Document Intelligence Platform
// Main application component

import { useState, useEffect, useRef, useCallback } from 'react';
import { uploadDocument, queryDocument, clearDocument } from './utils/api';
import { useStatus } from './hooks/useStatus';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import UploadPanel from './components/UploadPanel';

export default function App() {
  const { status, refetch } = useStatus(6000);

  // App state
  const [phase, setPhase] = useState('landing'); // landing | upload | chat
  const [documentName, setDocumentName] = useState('');
  const [chunkCount, setChunkCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | processing | done | error
  const [uploadError, setUploadError] = useState('');

  const handleStartUpload = () => setPhase('upload');

  const handleFileUpload = useCallback(async (file) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError('');

    try {
      const result = await uploadDocument(file, (pct) => {
        setUploadProgress(pct);
        if (pct === 100) setUploadStatus('processing');
      });

      setDocumentName(result.document_name);
      setChunkCount(result.chunks);
      setUploadStatus('done');
      setMessages([{
        id: Date.now(),
        role: 'ai',
        text: `📄 I've read **${result.document_name}** and indexed **${result.chunks} chunks** into my memory. Ask me anything about this document!`,
        timestamp: new Date(),
      }]);

      await refetch();
      setTimeout(() => setPhase('chat'), 1200);

    } catch (err) {
      setUploadStatus('error');
      setUploadError(err.response?.data?.detail || 'Upload failed. Check that Ollama is running.');
    }
  }, [refetch]);

  const handleSendMessage = useCallback(async (question) => {
    if (!question.trim() || isGenerating) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const result = await queryDocument(question);
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: result.answer,
        sources: result.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: '⚠️ ' + (err.response?.data?.detail || 'Something went wrong. Please try again.'),
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const handleClearChat = useCallback(async () => {
    try {
      await clearDocument();
      setMessages([]);
      setDocumentName('');
      setChunkCount(0);
      setPhase('upload');
      setUploadStatus('idle');
      setUploadProgress(0);
      await refetch();
    } catch (err) {
      console.error('Clear failed:', err);
    }
  }, [refetch]);

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  if (phase === 'landing') {
    return (
      <LandingPage
        status={status}
        onGetStarted={handleStartUpload}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--void)' }}>
      {/* Background layers */}
      <div className="fixed inset-0 dot-grid opacity-40 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #6c63ff, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #00d4aa, transparent 70%)' }} />
      </div>

      {/* Sidebar */}
      <Sidebar
        status={status}
        documentName={documentName}
        chunkCount={chunkCount}
        messageCount={messages.length}
        phase={phase}
        onClear={handleClearChat}
        onNewUpload={() => { handleClearChat(); }}
      />

      {/* Main area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {phase === 'upload' ? (
          <UploadPanel
            status={status}
            uploadStatus={uploadStatus}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
            onFileUpload={handleFileUpload}
          />
        ) : (
          <ChatArea
            messages={messages}
            isGenerating={isGenerating}
            documentName={documentName}
            onSend={handleSendMessage}
          />
        )}
      </main>
    </div>
  );
}
