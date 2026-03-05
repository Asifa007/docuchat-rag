// src/utils/api.js
// Centralized API calls to the DocuChat FastAPI backend

import axios from "axios";

// Production backend URL
const BASE_URL = "https://docuchat-backend-qsf2.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, // allow time for LLM responses
});

/**
 * Check backend + model status
 */
export const getStatus = async () => {
  const { data } = await api.get("/status");
  return data;
};

/**
 * Upload a PDF document for processing
 * @param {File} file
 * @param {Function} onProgress
 */
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
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
 * @param {string} question
 */
export const queryDocument = async (question) => {
  const { data } = await api.post("/query", { question });
  return data;
};

/**
 * Clear current document
 */
export const clearDocument = async () => {
  const { data } = await api.delete("/clear");
  return data;
};