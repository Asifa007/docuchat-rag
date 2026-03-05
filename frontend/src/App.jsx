
// src/App.jsx
import { useState, useCallback } from "react";
import { uploadDocument, queryDocument, clearDocument } from "./utils/api";
import { useStatus } from "./hooks/useStatus";
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import UploadPanel from "./components/UploadPanel";

export default function App() {
  const { status, refetch } = useStatus(6000);

  const [phase, setPhase] = useState("landing");
  const [documentName, setDocumentName] = useState("");
  const [chunkCount, setChunkCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadError, setUploadError] = useState("");

  const handleStartUpload = () => setPhase("upload");

  const handleFileUpload = useCallback(async (file) => {
    setUploadStatus("uploading");
    setUploadProgress(0);
    setUploadError("");

    try {
      const result = await uploadDocument(file, (pct) => {
        setUploadProgress(pct);
        if (pct === 100) setUploadStatus("processing");
      });

      const docName = result.document_name || result.filename || "Document";
      const chunks = result.chunks || result.chunk_count || 0;

      setDocumentName(docName);
      setChunkCount(chunks);
      setUploadStatus("done");

      setMessages([
        {
          id: Date.now(),
          role: "ai",
          text: `📄 I've read ${docName} and indexed ${chunks} chunks into memory.`,
          timestamp: new Date(),
        },
      ]);

      await refetch();
      setTimeout(() => setPhase("chat"), 1200);
    } catch (err) {
      setUploadStatus("error");
      setUploadError(
        err.response?.data?.detail ||
        "Upload failed. Please check the backend service."
      );
    }
  }, [refetch]);

  const handleSendMessage = useCallback(async (question) => {
    if (!question.trim() || isGenerating) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      text: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const result = await queryDocument(question);

      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: result.answer || "No answer returned.",
        sources: result.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: "⚠️ " + (err.response?.data?.detail || "Something went wrong. Please try again."),
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
      setDocumentName("");
      setChunkCount(0);
      setPhase("upload");
      setUploadStatus("idle");
      setUploadProgress(0);
      await refetch();
    } catch (err) {
      console.error("Clear failed:", err);
    }
  }, [refetch]);

  if (phase === "landing") {
    return <LandingPage status={status} onGetStarted={handleStartUpload} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        status={status}
        documentName={documentName}
        chunkCount={chunkCount}
        messageCount={messages.length}
        phase={phase}
        onClear={handleClearChat}
        onNewUpload={() => handleClearChat()}
      />

      <main className="flex-1 flex flex-col">
        {phase === "upload" ? (
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

