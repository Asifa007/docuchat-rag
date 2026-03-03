// src/components/LandingPage.jsx

import { useState, useEffect } from 'react';
import {
  Zap,
  Shield,
  Cpu,
  Database,
  ArrowRight,
  FileText,
  Brain,
  MessageSquare
} from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Private & Secure',
    desc: 'Your documents are processed securely with full control over your data.',
    color: '#00d4aa',
  },
  {
    icon: Brain,
    title: 'RAG Architecture',
    desc: 'Retrieval-Augmented Generation with vector search for grounded answers.',
    color: '#6c63ff',
  },
  {
    icon: Zap,
    title: 'Accurate Responses',
    desc: 'Answers are generated strictly from your document context.',
    color: '#ffd93d',
  },
  {
    icon: Database,
    title: 'Vector Search',
    desc: 'High-speed semantic retrieval for precise document understanding.',
    color: '#ff6b6b',
  },
];

const ARCH_NODES = [
  { label: 'Your PDF', icon: FileText, color: '#8b85ff' },
  { label: 'FastAPI', icon: Cpu, color: '#00d4aa' },
  { label: 'LLM Engine', icon: Brain, color: '#6c63ff' },
  { label: 'Vector Index', icon: Database, color: '#ffd93d' },
];

export default function LandingPage({ onGetStarted }) {
  const [visible, setVisible] = useState(false);
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    setVisible(true);
    const timer = setInterval(() => {
      setActiveNode((n) => (n + 1) % ARCH_NODES.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ background: 'var(--void)' }}>

      {/* Background */}
      <div className="fixed inset-0 dot-grid opacity-30 pointer-events-none" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #6c63ff 0%, transparent 70%)' }}
      />

      {/* Top bar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4aa)' }}
          >
            <MessageSquare size={14} className="text-white" />
          </div>
          <span className="font-display font-700 text-lg tracking-tight text-white">
            DocuChat
          </span>
        </div>

        <span
          className="text-xs font-mono"
          style={{ color: '#3a3a5a' }}
        >
          Developed by <span style={{ color: '#6c63ff' }}>Asifa Firdhouse</span>
        </span>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center pt-24 pb-16 px-6">

        <div className="relative w-32 h-32 mb-10 flex items-center justify-center animate-float">
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #6c63ff, transparent)' }}
          />
          <div
            className="absolute w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,170,0.2))',
              border: '1px solid rgba(108,99,255,0.4)'
            }}
          >
            <FileText size={32} style={{ color: '#8b85ff' }} />
          </div>
        </div>

        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p
            className="text-xs font-mono tracking-widest uppercase mb-4"
            style={{ color: '#6c63ff' }}
          >
            AI · RAG · Vector Search
          </p>

          <h1
            className="font-display font-800 text-5xl md:text-7xl leading-none mb-6"
            style={{ letterSpacing: '-0.03em' }}
          >
            Chat with your{' '}
            <span className="gradient-text">Documents</span>
            <br />
            <span style={{ color: '#3a3a5a' }}>intelligently.</span>
          </h1>

          <p
            className="text-lg max-w-xl mx-auto mb-10"
            style={{ color: '#8888aa', lineHeight: 1.7 }}
          >
            Upload any PDF. Ask questions in natural language.
            Get answers sourced exclusively from your document.
          </p>
        </div>

        <div className={`flex gap-4 transition-all duration-700 delay-200
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          <button
            onClick={onGetStarted}
            className="btn-glow group flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-600 text-white
              transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6c63ff, #4a43cc)',
              boxShadow: '0 0 30px rgba(108,99,255,0.4)'
            }}
          >
            Start Chatting
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16 w-full">
        <p
          className="text-center text-xs font-mono tracking-widest uppercase mb-8"
          style={{ color: '#3a3a5a' }}
        >
          Architecture & Features
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-5 transition-all duration-300 hover:scale-105"
            >
              <div
                className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                style={{ background: `${f.color}18`, border: `1px solid ${f.color}40` }}
              >
                <f.icon size={18} style={{ color: f.color }} />
              </div>

              <h3 className="font-display font-600 text-sm text-white mb-2">
                {f.title}
              </h3>

              <p className="text-xs leading-relaxed" style={{ color: '#6666aa' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 w-full">
        <div className="glass rounded-3xl p-8">
          <p
            className="text-xs font-mono tracking-widest uppercase mb-6 text-center"
            style={{ color: '#6c63ff' }}
          >
            System Architecture
          </p>

          <div className="flex items-center justify-between relative">
            {ARCH_NODES.map((node, i) => (
              <div key={node.label} className="flex items-center">
                <div className={`flex flex-col items-center gap-2 transition-all duration-500
                  ${activeNode === i ? 'scale-110' : 'scale-100'}`}>

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500"
                    style={{
                      background: activeNode === i ? `${node.color}25` : 'rgba(26,26,46,0.8)',
                      border: `1px solid ${activeNode === i ? node.color : '#2a2a45'}`,
                    }}
                  >
                    <node.icon
                      size={20}
                      style={{ color: activeNode === i ? node.color : '#3a3a5a' }}
                    />
                  </div>

                  <span
                    className="text-xs font-mono"
                    style={{ color: activeNode === i ? node.color : '#3a3a5a' }}
                  >
                    {node.label}
                  </span>
                </div>

                {i < ARCH_NODES.length - 1 && (
                  <div className="flex-1 mx-2 flex items-center justify-center" style={{ minWidth: 32 }}>
                    <ArrowRight size={14} style={{ color: '#2a2a45' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}