// src/hooks/useStatus.js
// Polls the backend status endpoint to show Ollama connectivity

import { useState, useEffect, useCallback } from 'react';
import { getStatus } from '../utils/api';

export const useStatus = (pollInterval = 8000) => {
  const [status, setStatus] = useState({
    ollama_connected: false,
    document_loaded: false,
    document_name: '',
    chunk_count: 0,
    loading: true,
  });

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getStatus();
      setStatus({ ...data, loading: false });
    } catch {
      setStatus((prev) => ({
        ...prev,
        ollama_connected: false,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(timer);
  }, [fetchStatus, pollInterval]);

  return { status, refetch: fetchStatus };
};
