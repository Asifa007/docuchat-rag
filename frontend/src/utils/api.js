// src/utils/api.js
// Centralized API calls to the DocuChat FastAPI backend

import axios from 'axios';

const BASE_URL = '/api';  // proxied by Vite → http://localhost:8000

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,  // 2 min for LLM responses
});

/**
 * Check backend + Ollama status
 */
export const getStatus = async () => {
  const { data } = await api.get('/status');
  return data;
};

/**
 * Upload a PDF document for processing
 * @param {File} file - PDF file object
 * @param {Function} onProgress - Upload progress callback (0-100)
 */
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        const pct = Math.round((event.loaded / event.total) * 100);
        onProgress(pct);
      }
    },
  });
  return data;
};

/**
 * Query the RAG pipeline
 * @param {string} question - User's question
 */
export const queryDocument = async (question) => {
  const { data } = await api.post('/query', { question });
  return data;
};

/**
 * Clear the current document and reset state
 */
export const clearDocument = async () => {
  const { data } = await api.delete('/clear');
  return data;
};
