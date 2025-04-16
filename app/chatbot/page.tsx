'use client';
import React, { useState, useEffect } from 'react';
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

export default function ChatbotPage() {
  const searchParams = useSearchParams();
  const urlDocumentId = searchParams.get('documentId');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Format date to a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Fetch user's documents and summaries
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);

      try {
        // Fetch documents from the API
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

      // Set selected document from URL if provided
      if (urlDocumentId) {
        setSelectedDocId(urlDocumentId);
      }
    };

    fetchDocuments();
  }, [urlDocumentId]);

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        layout
        className="flex-shrink-0 w-full flex justify-between gap-10 mb-6"
      >
        <HeaderSection
          inline
          className={'mb-5'}
          title="AI Chatbot"
          desc="Ask questions about your documents and summaries"
          icon={<IoMdChatbubbles className="w-10 h-10" />}
          key={'chatbot-header'}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-500 p-2 rounded-lg shadow h-[calc(90vh-80px)] flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            Your Content
          </h3>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 156, 156, 0.3) transparent',
              }}
            >
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No documents found.</p>
                  <p className="mt-2 text-sm">Upload or summarize content first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-2 rounded-xl cursor-pointer ${
                        selectedDocId === doc.id
                          ? 'dark:bg-blue-900 border-4 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {doc.title}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{doc.type}</span>
                        {doc.created_at && <span>{formatDate(doc.created_at)}</span>}
                      </div>
                      {doc.word_count && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {doc.word_count.toLocaleString()} words
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-[calc(90vh-80px)]">
          {!selectedDocId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400">
              <IoMdChatbubbles className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">
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
