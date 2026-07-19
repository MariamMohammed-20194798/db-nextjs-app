'use client';
import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { MdRestore } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import HeaderSection from '../components/HeaderSection';

interface TrashedDocument {
  id: string;
  title: string;
  content: string;
  date: string;
  wordCount: number;
  trashedAt?: number;
}

interface SuccessMessage {
  text: string;
  type: 'success' | 'error';
}

export default function TrashPage() {
  const [trashedDocuments, setTrashedDocuments] = useState<TrashedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<TrashedDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTrashedDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trash');
      let apiTrashedDocuments: TrashedDocument[] = [];

      if (response.ok) {
        const data = await response.json();
        apiTrashedDocuments = data.documents;
      } else {
        console.error('Failed to fetch trashed documents:', await response.text());
      }

      let localTrashedDocuments: TrashedDocument[] = [];
      try {
        const storedTrashedDocs = localStorage.getItem('trashedDocuments');
        if (storedTrashedDocs) {
          localTrashedDocuments = JSON.parse(storedTrashedDocs);
          const now = Date.now();
          const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
          localTrashedDocuments = localTrashedDocuments.filter(
            (doc) => doc.trashedAt && now - doc.trashedAt < twentyFourHoursInMs
          );
          localStorage.setItem('trashedDocuments', JSON.stringify(localTrashedDocuments));
        }
      } catch (error) {
        console.error('Error parsing localStorage trashed documents:', error);
      }

      const allTrashedDocs = [...localTrashedDocuments, ...apiTrashedDocuments];
      const uniqueTrashedDocsMap = new Map();

      allTrashedDocs.forEach((doc) => {
        if (!uniqueTrashedDocsMap.has(doc.id)) {
          uniqueTrashedDocsMap.set(doc.id, doc);
        }
      });

      const uniqueTrashedDocs = Array.from(uniqueTrashedDocsMap.values());
      uniqueTrashedDocs.sort((a, b) => (b.trashedAt || 0) - (a.trashedAt || 0));
      setTrashedDocuments(uniqueTrashedDocs);
    } catch (error) {
      console.error('Error fetching trashed documents:', error);
      setTrashedDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedDocuments();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleRestoreFromTrash = async (id: string) => {
    try {
      const documentToRestore = trashedDocuments.find((doc) => doc.id === id);
      if (!documentToRestore) {
        throw new Error('Document not found in trash');
      }

      const restoreResponse = await fetch(`/api/trash?id=${id}`, {
        method: 'PUT',
      });

      if (restoreResponse.ok) {
        setTrashedDocuments(trashedDocuments.filter((doc) => doc.id !== id));

        try {
          const storedTrashedDocs = localStorage.getItem('trashedDocuments');
          if (storedTrashedDocs) {
            const parsedTrashedDocs = JSON.parse(storedTrashedDocs);
            const updatedTrashedDocs = parsedTrashedDocs.filter(
              (doc: TrashedDocument) => doc.id !== id
            );
            localStorage.setItem('trashedDocuments', JSON.stringify(updatedTrashedDocs));
          }
        } catch (error) {
          console.error('Error updating localStorage trash:', error);
        }

        try {
          const { trashedAt, ...restoredDocument } = documentToRestore;
          const storedDocuments = localStorage.getItem('documents') || '[]';
          const parsedDocuments = JSON.parse(storedDocuments);
          parsedDocuments.unshift(restoredDocument);
          localStorage.setItem('documents', JSON.stringify(parsedDocuments));
        } catch (error) {
          console.error('Error updating localStorage documents:', error);
        }

        setSuccessMessage({
          text: `Document ID: ${documentToRestore.id} restored successfully.`,
          type: 'success',
        });
      } else {
        console.error('Failed to restore document:', await restoreResponse.text());
        setSuccessMessage({
          text: 'Failed to restore document. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error restoring document from trash:', error);
      setSuccessMessage({
        text: 'An error occurred while restoring the document.',
        type: 'error',
      });
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      const documentToDelete = trashedDocuments.find((doc) => doc.id === id);

      try {
        const storedTrashedDocs = localStorage.getItem('trashedDocuments');
        if (storedTrashedDocs) {
          const parsedTrashedDocs = JSON.parse(storedTrashedDocs);
          const updatedTrashedDocs = parsedTrashedDocs.filter(
            (doc: TrashedDocument) => doc.id !== id
          );
          localStorage.setItem('trashedDocuments', JSON.stringify(updatedTrashedDocs));
        }
      } catch (error) {
        console.error('Error updating localStorage trash:', error);
      }

      const response = await fetch(`/api/trash?id=${id}`, {
        method: 'DELETE',
      });

      setTrashedDocuments(trashedDocuments.filter((doc) => doc.id !== id));

      setSuccessMessage({
        text: `Document ID: ${documentToDelete?.id} permanently deleted.`,
        type: 'success',
      });

      if (!response.ok) {
        console.error('API delete failed:', await response.text());
      }
    } catch (error) {
      console.error('Error permanently deleting document:', error);
      setSuccessMessage({
        text: 'An error occurred while deleting the document.',
        type: 'error',
      });
    }
  };

  const openDocumentModal = (document: TrashedDocument) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  if (isLoading) {
    return (
      <div className="mt-50 flex items-center justify-center">
        <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <HeaderSection
        inline
        className="mb-2"
        title="Trash"
        desc="Recover or remove files before they are permanently deleted after 24 hours."
        icon={<FiTrash2 className="h-7 w-7" />}
        key="trash-header"
      />

      {successMessage && (
        <div
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-2xl border p-4 shadow-lg transition-opacity duration-300 ${
            successMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          <p className="font-medium">{successMessage.text}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {trashedDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            className="cursor-pointer overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/90 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_-22px_rgba(59,130,246,0.45)] dark:border-slate-800/80 dark:bg-slate-900/80"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            onClick={() => openDocumentModal(doc)}
          >
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{doc.date}</span>
                <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] text-red-600 dark:bg-red-950/40 dark:text-red-300">
                  Expires in {Math.ceil(24 - (Date.now() - (doc.trashedAt || 0)) / (60 * 60 * 1000))}h
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{doc.title}</h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3">{doc.content}</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/80 p-3 dark:border-slate-800/80">
              <div className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {doc.wordCount}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestoreFromTrash(doc.id);
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  title="Restore from trash"
                >
                  <MdRestore className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePermanentDelete(doc.id);
                  }}
                  className="rounded-2xl border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300"
                  title="Delete permanently"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {trashedDocuments.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-12 text-center dark:border-slate-800/80 dark:bg-slate-950/40">
          <FiTrash2 className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-2 text-lg font-medium text-slate-700 dark:text-slate-300">Trash is empty</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No documents in trash.</p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && selectedDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800/80 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 p-4 dark:border-slate-800/80">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedDocument.title}</h2>
                <button
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>{selectedDocument.date}</span>
                  <span>{selectedDocument.wordCount} words</span>
                </div>
                <div className="whitespace-pre-wrap rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200">
                  {selectedDocument.content}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200/80 p-4 dark:border-slate-800/80">
                <button
                  onClick={() => {
                    handleRestoreFromTrash(selectedDocument.id);
                    closeModal();
                  }}
                  className="min-h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <MdRestore className="mr-2 inline h-4 w-4" />
                  Restore
                </button>
                <button
                  onClick={() => {
                    handlePermanentDelete(selectedDocument.id);
                    closeModal();
                  }}
                  className="min-h-11 rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  <FiTrash2 className="mr-2 inline h-4 w-4" />
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
