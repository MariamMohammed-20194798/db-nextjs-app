'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { IoMdChatbubbles } from 'react-icons/io';
import HeaderSection from '../components/HeaderSection';
import ChatInterface from './components/ChatInterface';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

interface Document {
  id: string;
  title: string;
  type: string;
  created_at?: string;
  word_count?: number;
  content?: string;
}

function ChatbotPageContent() {
  const searchParams = useSearchParams();
  const urlDocumentId = searchParams.get('documentId');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);

      try {
        const response = await fetch('/api/documents');
        const data = await response.json();

        if (response.ok) {
          setDocuments(data.documents);
        } else {
          console.error('Failed to fetch documents:', data.error);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoading(false);
      }

      if (urlDocumentId) {
        setSelectedDocId(urlDocumentId);
      }
    };

    fetchDocuments();
  }, [urlDocumentId]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <HeaderSection
        inline
        className="mb-2"
        title="AI Chatbot"
        desc="Ask questions about your documents and summaries from a streamlined, mobile-friendly chat workspace."
        icon={<IoMdChatbubbles className="h-7 w-7" />}
        key="chatbot-header"
      />

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex h-[calc(85vh-80px)] min-h-[320px] flex-col rounded-[24px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-900/80">
          <h3 className="mb-3 px-2 text-lg font-semibold text-slate-900 dark:text-white">
            Your Content
          </h3>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sky-500"></div>
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto pr-1"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 156, 156, 0.3) transparent',
              }}
            >
              {documents.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                  <p>No documents found.</p>
                  <p className="mt-2">Upload or summarize content first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full rounded-[18px] border p-3 text-left transition ${
                        selectedDocId === doc.id
                          ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-500/10 dark:text-sky-300'
                          : 'border-transparent bg-slate-50 hover:border-slate-200 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:border-slate-700 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="mb-1 font-medium text-slate-900 dark:text-white">
                        {doc.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {doc.created_at && <span>{formatDate(doc.created_at)}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex h-[calc(85vh-80px)] min-h-[320px] flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/90 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-900/80">
          {!selectedDocId ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
              <IoMdChatbubbles className="mb-4 h-16 w-16 opacity-50" />
              <h3 className="mb-2 text-xl font-medium text-slate-900 dark:text-white">
                Select a document to start chatting
              </h3>
              <p>Choose content from the sidebar to ask questions about it.</p>
            </div>
          ) : (
            <ChatInterface documentId={selectedDocId} />
          )}
        </div>
      </div>
    </div>
  );
}

function ChatbotPageFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <HeaderSection
        inline
        className="mb-2"
        title="AI Chatbot"
        desc="Ask questions about your documents and summaries"
        icon={<IoMdChatbubbles className="h-7 w-7" />}
        key="chatbot-header"
      />
      <div className="flex h-[calc(85vh-80px)] items-center justify-center rounded-[24px] border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80">
        <motion.div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sky-500" />
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <Suspense fallback={<ChatbotPageFallback />}>
      <ChatbotPageContent />
    </Suspense>
  );
}
