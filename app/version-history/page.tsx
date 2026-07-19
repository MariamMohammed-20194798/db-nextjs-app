'use client';
import React, { useState, useEffect } from 'react';
import { IoDocumentText } from 'react-icons/io5';
import { FiDownload, FiTrash2, FiLayers } from 'react-icons/fi';
import { MdHistory, MdTranslate } from 'react-icons/md';
import { BsFileEarmarkText } from 'react-icons/bs';
import { AiOutlineLoading3Quarters, AiOutlineFileAdd } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import HeaderSection from '../components/HeaderSection';

const MAX_VERSIONS = 12;
const DOCUMENT_TYPES = ['All', 'Translator', 'Summarize', 'Generate'];

interface VersionDocument {
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

export default function VersionHistoryPage() {
  const [documents, setDocuments] = useState<VersionDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<VersionDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<VersionDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/history');
      let apiDocuments: VersionDocument[] = [];

      if (response.ok) {
        const data = await response.json();
        apiDocuments = data.documents;
      } else {
        console.error('Failed to fetch documents:', await response.text());
      }

      let localStorageDocuments: VersionDocument[] = [];
      try {
        const storedDocuments = localStorage.getItem('documents');
        if (storedDocuments) {
          localStorageDocuments = JSON.parse(storedDocuments);
        }
      } catch (error) {
        console.error('Error parsing localStorage documents:', error);
      }

      const allDocuments = [...localStorageDocuments, ...apiDocuments];
      const uniqueDocumentsMap = new Map();

      allDocuments.forEach((doc) => {
        if (!uniqueDocumentsMap.has(doc.id)) {
          uniqueDocumentsMap.set(doc.id, doc);
        }
      });

      const uniqueDocuments = Array.from(uniqueDocumentsMap.values());
      uniqueDocuments.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      const limitedDocuments = uniqueDocuments.slice(0, MAX_VERSIONS);

      try {
        localStorage.setItem('documents', JSON.stringify(limitedDocuments));
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }

      setDocuments(limitedDocuments);
      filterDocuments(limitedDocuments, activeFilter);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const detectDocumentType = (document: VersionDocument): string => {
    const title = document.title.toLowerCase();

    if (title.startsWith('summarized:') || title.includes('summarized:')) {
      return 'Summarize';
    } else if (title.startsWith('translation to') || title.startsWith('translator:')) {
      return 'Translator';
    } else if (title.startsWith('generate:')) {
      return 'Generate';
    }

    if (title.includes('summarize') || title.includes('summary') || title.includes('summarized')) {
      return 'Summarize';
    } else if (title.includes('translate') || title.includes('translator') || title.includes('translation')) {
      return 'Translator';
    } else if (title.includes('generate') || title.includes('created') || title.includes('creation')) {
      return 'Generate';
    }

    return 'Other';
  };

  const filterDocuments = (docs: VersionDocument[], filterType: string) => {
    if (filterType === 'All') {
      setFilteredDocuments(docs);
    } else {
      setFilteredDocuments(docs.filter((doc) => detectDocumentType(doc) === filterType));
    }
  };

  const handleFilterChange = (filterType: string) => {
    setActiveFilter(filterType);
    filterDocuments(documents, filterType);
  };

  useEffect(() => {
    fetchDocuments();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'documentSaved') {
        fetchDocuments();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const handleCustomEvent = () => fetchDocuments();
    window.addEventListener('documentSaved', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('documentSaved', handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    filterDocuments(documents, activeFilter);
  }, [activeFilter]);

  const getTypeBadgeColor = (type: string): string => {
    switch (type) {
      case 'Summarize':
        return 'bg-emerald-600';
      case 'Translator':
        return 'bg-sky-600';
      case 'Generate':
        return 'bg-violet-600';
      default:
        return 'bg-slate-600';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const documentToTrash = documents.find((doc) => doc.id === id);
      if (!documentToTrash) {
        throw new Error('Document not found');
      }

      const trashedDocument = {
        ...documentToTrash,
        trashedAt: Date.now(),
      };

      const trashResponse = await fetch('/api/trash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document: trashedDocument }),
      });

      if (trashResponse.ok) {
        try {
          const storedTrashedDocs = localStorage.getItem('trashedDocuments') || '[]';
          const parsedTrashedDocs = JSON.parse(storedTrashedDocs);
          parsedTrashedDocs.push(trashedDocument);
          localStorage.setItem('trashedDocuments', JSON.stringify(parsedTrashedDocs));
        } catch (error) {
          console.error('Error updating localStorage trash:', error);
        }

        const updatedDocuments = documents.filter((doc) => doc.id !== id);
        setDocuments(updatedDocuments);
        setFilteredDocuments(filteredDocuments.filter((doc) => doc.id !== id));

        try {
          const storedDocuments = localStorage.getItem('documents');
          if (storedDocuments) {
            const parsedDocuments = JSON.parse(storedDocuments);
            const updatedDocuments = parsedDocuments.filter(
              (doc: VersionDocument) => doc.id !== id
            );
            localStorage.setItem('documents', JSON.stringify(updatedDocuments));
          }
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }

        setSuccessMessage({
          text: `Document ${trashedDocument.id} moved to trash.`,
          type: 'success',
        });
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error('Failed to add document to trash:', await trashResponse.text());
        setSuccessMessage({
          text: 'Failed to move document to trash.',
          type: 'error',
        });
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error moving document to trash:', error);
      setSuccessMessage({
        text: 'Error moving document to trash.',
        type: 'error',
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleDownload = (document: VersionDocument) => {
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = global.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '-')}.txt`;
    global.document.body.appendChild(a);
    a.click();
    global.document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessMessage({
      text: `Document ${document.id} downloaded successfully.`,
      type: 'success',
    });
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDocumentClick = (document: VersionDocument) => {
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
        title="Version History"
        desc="Manage and review your saved documents from a calmer, more focused workspace."
        icon={<MdHistory className="h-7 w-7" />}
        key="kb-header"
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

      <div className="flex flex-wrap gap-2">
        {DOCUMENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${
              activeFilter === type
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {type === 'All' ? <FiLayers className="h-4 w-4" /> : null}
            {type === 'Translator' ? <MdTranslate className="h-4 w-4" /> : null}
            {type === 'Summarize' ? <BsFileEarmarkText className="h-4 w-4" /> : null}
            {type === 'Generate' ? <AiOutlineFileAdd className="h-4 w-4" /> : null}
            {type}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            className="cursor-pointer overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/90 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_-22px_rgba(59,130,246,0.45)] dark:border-slate-800/80 dark:bg-slate-900/80"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            onClick={() => handleDocumentClick(doc)}
          >
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{doc.date}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {doc.wordCount} words
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                {doc.title}
              </h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3">
                {doc.content}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/80 p-3 dark:border-slate-800/80">
              <div className="flex items-center justify-center rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {doc.wordCount}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(doc);
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  title="Download"
                >
                  <FiDownload className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                  className="rounded-2xl border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300"
                  title="Move to Trash"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-12 text-center dark:border-slate-800/80 dark:bg-slate-950/40">
          <IoDocumentText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-lg font-medium text-slate-700 dark:text-slate-300">
            No documents found
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {documents.length > 0
              ? `No documents match the "${activeFilter}" filter.`
              : "You haven't saved any documents yet."}
          </p>
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
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedDocument.title}
                </h2>
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
                  <span>{selectedDocument?.date}</span>
                  <div className="flex items-center gap-2">
                    {selectedDocument && detectDocumentType(selectedDocument) !== 'Other' && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium text-white ${getTypeBadgeColor(
                          detectDocumentType(selectedDocument)
                        )}`}
                      >
                        {detectDocumentType(selectedDocument)}
                      </span>
                    )}
                    <span>{selectedDocument?.wordCount} words</span>
                  </div>
                </div>
                <div className="whitespace-pre-wrap rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200">
                  {selectedDocument?.content}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200/80 p-4 dark:border-slate-800/80">
                <button
                  onClick={() => {
                    if (selectedDocument) {
                      handleDownload(selectedDocument);
                      closeModal();
                    }
                  }}
                  className="min-h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <FiDownload className="mr-2 inline h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    if (selectedDocument) {
                      handleDelete(selectedDocument.id);
                      closeModal();
                    }
                  }}
                  className="min-h-11 rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  <FiTrash2 className="mr-2 inline h-4 w-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
