'use client';
import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { MdRestore } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { motion } from 'framer-motion';
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

  const fetchTrashedDocuments = async () => {
    try {
      setIsLoading(true);

      // Get trashed documents from API
      const response = await fetch('/api/documents/trash');
      let apiTrashedDocuments: TrashedDocument[] = [];

      if (response.ok) {
        const data = await response.json();
        apiTrashedDocuments = data.documents;
      } else {
        console.error('Failed to fetch trashed documents:', await response.text());
      }

      // Get trashed documents from localStorage
      let localTrashedDocuments: TrashedDocument[] = [];
      try {
        const storedTrashedDocs = localStorage.getItem('trashedDocuments');
        if (storedTrashedDocs) {
          localTrashedDocuments = JSON.parse(storedTrashedDocs);

          // Filter out expired documents (older than 24 hours)
          const now = Date.now();
          const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
          localTrashedDocuments = localTrashedDocuments.filter(
            (doc) => doc.trashedAt && now - doc.trashedAt < twentyFourHoursInMs
          );

          // Update localStorage with filtered documents
          localStorage.setItem('trashedDocuments', JSON.stringify(localTrashedDocuments));
        }
      } catch (error) {
        console.error('Error parsing localStorage trashed documents:', error);
      }

      // Combine and deduplicate trashed documents by ID
      const allTrashedDocs = [...localTrashedDocuments, ...apiTrashedDocuments];
      const uniqueTrashedDocsMap = new Map();

      allTrashedDocs.forEach((doc) => {
        if (!uniqueTrashedDocsMap.has(doc.id)) {
          uniqueTrashedDocsMap.set(doc.id, doc);
        }
      });

      // Convert map back to array and sort by trashed date (newest first)
      const uniqueTrashedDocs = Array.from(uniqueTrashedDocsMap.values());
      uniqueTrashedDocs.sort((a, b) => {
        return (b.trashedAt || 0) - (a.trashedAt || 0);
      });

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

  // Auto-hide success message after 3 seconds
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

      // Restore via API
      const restoreResponse = await fetch(`/api/documents/trash?id=${id}`, {
        method: 'PUT',
      });

      if (restoreResponse.ok) {
        // Update UI: remove from trash
        setTrashedDocuments(trashedDocuments.filter((doc) => doc.id !== id));

        // Update localStorage: remove from trash
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

        // Update localStorage: add to active documents
        try {
          const { trashedAt, ...restoredDocument } = documentToRestore;
          const storedDocuments = localStorage.getItem('documents') || '[]';
          const parsedDocuments = JSON.parse(storedDocuments);
          parsedDocuments.unshift(restoredDocument);
          localStorage.setItem('documents', JSON.stringify(parsedDocuments));
        } catch (error) {
          console.error('Error updating localStorage documents:', error);
        }

        // Show success message
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
      // Get document title before deleting
      const documentToDelete = trashedDocuments.find((doc) => doc.id === id);
      const documentTitle = documentToDelete?.title || 'Document';

      // Delete from API trash
      const response = await fetch(`/api/documents/trash?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update UI
        setTrashedDocuments(trashedDocuments.filter((doc) => doc.id !== id));

        // Update localStorage
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

        // Show success message
        setSuccessMessage({
          text: `Document ID: ${documentToDelete?.id} permanently deleted.`,
          type: 'success',
        });
      } else {
        console.error('Failed to permanently delete document:', await response.text());
        setSuccessMessage({
          text: 'Failed to delete document. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error permanently deleting document:', error);
      setSuccessMessage({
        text: 'An error occurred while deleting the document.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-50">
        <AiOutlineLoading3Quarters className="animate-spin text-gray-400 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <HeaderSection
        inline
        className={'mb-5'}
        title={'Trash'}
        desc={'Documents will be permanently deleted after 24 hours.'}
        icon={<FiTrash2 className="w-10 h-10" />}
        key={'trash-header'}
      />

      {/* Success/Error Message Toast */}
      {successMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-opacity duration-300 ${
            successMessage.type === 'success'
              ? 'bg-green-100 border-l-4 border-green-500 text-green-700'
              : 'bg-red-100 border-l-4 border-red-500 text-red-700'
          }`}
        >
          <div className="flex items-center">
            <div className="py-1">
              <p className="font-medium">{successMessage.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trashedDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            className="bg-gray-700 rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-500">{doc.date}</div>
                <div className="text-xs text-red-400">
                  Expires in{' '}
                  {Math.ceil(24 - (Date.now() - (doc.trashedAt || 0)) / (60 * 60 * 1000))}{' '}
                  hours
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">{doc.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-3">{doc.content}</p>
            </div>

            <div className="flex items-center justify-between p-2 border-t border-gray-100">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-500">
                <span>{doc.wordCount}</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleRestoreFromTrash(doc.id)}
                  className="p-2 text-gray-500 hover:text-red-700"
                  title="Restore from trash"
                >
                  <MdRestore className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePermanentDelete(doc.id)}
                  className="p-2 text-gray-500 hover:text-red-700"
                  title="Delete permanently"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {trashedDocuments.length === 0 && (
        <div className="text-center py-50">
          <FiTrash2 className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-400">Trash is empty</h3>
          <p className="mt-1 text-sm text-gray-500">No documents in trash.</p>
        </div>
      )}
    </div>
  );
}
