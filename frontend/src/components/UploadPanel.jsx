// src/components/UploadPanel.jsx
// Drag-and-drop PDF upload with progress bar and status

import { useState, useRef, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react';

const TIPS = [
  'Tip: Works best with text-based PDFs (not scanned images)',
  'Tip: Longer documents take more time to index',
  'Tip: Ask specific questions for better answers',
  'Tip: Answers are strictly generated from your document context',
];

export default function UploadPanel({
  uploadStatus,
  uploadProgress,
  uploadError,
  onFileUpload
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);
  const tipIndex = Math.floor(Math.random() * TIPS.length);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const isProcessing = uploadStatus === 'uploading' || uploadStatus === 'processing';
  const isDone = uploadStatus === 'done';
  const isError = uploadStatus === 'error';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto">

      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#6c63ff' }}>
          Step 1 of 2
        </p>
        <h2 className="font-display font-700 text-3xl text-white mb-3">
          Upload Your Document
        </h2>
        <p className="text-sm" style={{ color: '#6666aa' }}>
          Drop a PDF to begin. Secure and private.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`w-full max-w-lg relative rounded-3xl transition-all duration-300 cursor-pointer
          ${isDragging ? 'scale-[1.02]' : ''}
          ${isProcessing ? 'opacity-60 cursor-not-allowed' : 'hover:border-opacity-60'}`}
        style={{
          border: `2px dashed ${isDragging ? '#6c63ff' : '#2a2a45'}`,
          background: isDragging ? 'rgba(108,99,255,0.05)' : 'rgba(18,18,30,0.8)',
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && inputRef.current?.click()}>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing}
        />

        <div className="p-10 flex flex-col items-center text-center">

          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: 'rgba(26,26,46,0.8)',
              border: '1px solid #2a2a45',
            }}>
            {isProcessing ? (
              <Loader2 size={28} className="animate-spin" style={{ color: '#6c63ff' }} />
            ) : isDone ? (
              <CheckCircle size={28} style={{ color: '#00d4aa' }} />
            ) : (
              <Upload size={28} style={{ color: '#3a3a5a' }} />
            )}
          </div>

          {!isProcessing && !isDone && !isError && (
            <>
              <p className="font-display font-600 text-white text-lg mb-2">
                Drop your PDF here
              </p>
              <p className="text-sm mb-4" style={{ color: '#6666aa' }}>
                or <span style={{ color: '#8b85ff' }}>click to browse</span>
              </p>
              <p className="text-xs px-3 py-1.5 rounded-lg font-mono"
                style={{ background: 'rgba(26,26,46,0.8)', color: '#3a3a5a', border: '1px solid #2a2a45' }}>
                PDF only · Max 50MB
              </p>
            </>
          )}

          {isProcessing && (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-2" style={{ color: '#8888aa' }}>
                <span>
                  {uploadStatus === 'uploading'
                    ? 'Uploading...'
                    : 'Indexing document...'}
                </span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full rounded bg-[#1a1a2e]">
                <div
                  className="h-full rounded bg-gradient-to-r from-[#6c63ff] to-[#00d4aa]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs mt-3" style={{ color: '#3a3a5a' }}>
                Processing {selectedFile?.name}...
              </p>
            </div>
          )}

          {isDone && (
            <div className="text-center">
              <p className="font-600 text-sm" style={{ color: '#00d4aa' }}>
                ✓ Document ready!
              </p>
              <p className="text-xs mt-1" style={{ color: '#6666aa' }}>
                Launching chat...
              </p>
            </div>
          )}

          {isError && (
            <div className="w-full">
              <div className="flex items-start gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#ff6b6b' }} />
                <p className="text-xs" style={{ color: '#ff6b6b' }}>
                  {uploadError}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="mt-5 flex items-center gap-2 text-xs max-w-lg w-full px-4 py-2.5 rounded-xl"
        style={{ background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.1)', color: '#6666aa' }}>
        <Zap size={12} style={{ color: '#6c63ff' }} />
        {TIPS[tipIndex]}
      </div>

      {/* Footer credit */}
      <div className="mt-6 text-xs text-center" style={{ color: '#2a2a45' }}>
        Developed by Asifa Firdhouse
      </div>
    </div>
  );
}