'use client';
import React, { useState, useEffect } from 'react';
import { IoDocumentText } from 'react-icons/io5';
import { FiDownload, FiTrash2, FiX, FiFilter, FiLayers } from 'react-icons/fi';
import { MdHistory, MdTranslate } from 'react-icons/md';
import { BsFileEarmarkText } from 'react-icons/bs';
import { AiOutlineLoading3Quarters, AiOutlineFileAdd } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import HeaderSection from '../components/HeaderSection';

// Maximum number of versions to keep
const MAX_VERSIONS = 12;

// Document types for filtering
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

      // Get active documents from API
      const response = await fetch('/api/history');
      let apiDocuments: VersionDocument[] = [];

      if (response.ok) {
        const data = await response.json();
        apiDocuments = data.documents;
      } else {
        console.error('Failed to fetch documents:', await response.text());
      }

      // Get documents from localStorage
      let localStorageDocuments: VersionDocument[] = [];
      try {
        const storedDocuments = localStorage.getItem('documents');
        if (storedDocuments) {
          localStorageDocuments = JSON.parse(storedDocuments);
        }
      } catch (error) {
        console.error('Error parsing localStorage documents:', error);
      }

      // Combine and deduplicate documents by ID
      const allDocuments = [...localStorageDocuments, ...apiDocuments];
      const uniqueDocumentsMap = new Map();

      allDocuments.forEach((doc) => {
        // Only keep the first occurrence of each ID (newer documents from localStorage come first)
        if (!uniqueDocumentsMap.has(doc.id)) {
          uniqueDocumentsMap.set(doc.id, doc);
        }
      });

      // Convert map back to array and sort by date (newest first)
      const uniqueDocuments = Array.from(uniqueDocumentsMap.values());
      uniqueDocuments.sort((a, b) => {
        // Sort by ID as a fallback (higher ID = newer)
        return parseInt(b.id) - parseInt(a.id);
      });

      // Enforce the MAX_VERSIONS limit
      const limitedDocuments = uniqueDocuments.slice(0, MAX_VERSIONS);

      // Update localStorage to maintain the limit
      try {
        localStorage.setItem('documents', JSON.stringify(limitedDocuments));
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }

      setDocuments(limitedDocuments);
      // Apply initial filter
      filterDocuments(limitedDocuments, activeFilter);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to detect document type based on title
  const detectDocumentType = (document: VersionDocument): string => {
    const title = document.title.toLowerCase();

    // Check for exact prefixes first (prioritize these)
    if (title.startsWith('summarized:') || title.includes('summarized:')) {
      return 'Summarize';
    } else if (title.startsWith('translation to') || title.startsWith('translator:')) {
      return 'Translator';
    } else if (title.startsWith('generate:')) {
      return 'Generate';
    }

    // Fallback to more general keyword detection
    if (
      title.includes('summarize') ||
      title.includes('summary') ||
      title.includes('summarized')
    ) {
      return 'Summarize';
    } else if (
      title.includes('translate') ||
      title.includes('translator') ||
      title.includes('translation')
    ) {
      return 'Translator';
    } else if (
      title.includes('generate') ||
      title.includes('created') ||
      title.includes('creation')
    ) {
      return 'Generate';
    }

    return 'Other';
  };

  // Function to filter documents based on the selected type
  const filterDocuments = (docs: VersionDocument[], filterType: string) => {
    if (filterType === 'All') {
      setFilteredDocuments(docs);
    } else {
      setFilteredDocuments(docs.filter((doc) => detectDocumentType(doc) === filterType));
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType: string) => {
    setActiveFilter(filterType);
    filterDocuments(documents, filterType);
  };

  useEffect(() => {
    fetchDocuments();

    // Set up event listener for document saves
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'documentSaved') {
        fetchDocuments();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab updates
    const handleCustomEvent = () => fetchDocuments();
    window.addEventListener('documentSaved', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('documentSaved', handleCustomEvent);
    };
  }, []);

  // Apply filter when activeFilter changes
  useEffect(() => {
    filterDocuments(documents, activeFilter);
  }, [activeFilter]);

  // Function to get badge color based on document type
  const getTypeBadgeColor = (type: string): string => {
    switch (type) {
      case 'Summarize':
        return 'bg-green-600';
      case 'Translator':
        return 'bg-blue-600';
      case 'Generate':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Find the document to move to trash
      const documentToTrash = documents.find((doc) => doc.id === id);
      if (!documentToTrash) {
        throw new Error('Document not found');
      }

      // Add to trash with timestamp
      const trashedDocument = {
        ...documentToTrash,
        trashedAt: Date.now(),
      };

      // Send to API trash
      const trashResponse = await fetch('/api/trash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document: trashedDocument }),
      });

      if (trashResponse.ok) {
        // Add to localStorage trash
        try {
          const storedTrashedDocs = localStorage.getItem('trashedDocuments') || '[]';
          const parsedTrashedDocs = JSON.parse(storedTrashedDocs);
          parsedTrashedDocs.push(trashedDocument);
          localStorage.setItem('trashedDocuments', JSON.stringify(parsedTrashedDocs));
        } catch (error) {
          console.error('Error updating localStorage trash:', error);
        }

        // Remove from active documents
        const updatedDocuments = documents.filter((doc) => doc.id !== id);
        setDocuments(updatedDocuments);

        // Update filtered documents as well
        setFilteredDocuments(filteredDocuments.filter((doc) => doc.id !== id));

        // Remove from localStorage active documents
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

        // Show success message
        setSuccessMessage({
          text: `Document ${trashedDocument.id} moved to trash.`,
          type: 'success',
        });

        // Clear message after 3 seconds
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
    // Create a blob with the document content
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger the download
    const a = global.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '-')}.txt`;
    global.document.body.appendChild(a);
    a.click();

    // Clean up
    global.document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    setSuccessMessage({
      text: `Document ${document.id} downloaded successfully.`,
      type: 'success',
    });

    // Clear message after 3 seconds
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
      <div className="flex items-center justify-center mt-50">
        <AiOutlineLoading3Quarters className="animate-spin text-gray-400 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <HeaderSection
        inline
        className={'mb-5'}
        title="Version History"
        desc="Manage all your saved documents."
        icon={<MdHistory className="w-10 h-10" />}
        key={'kb-header'}
      />
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

      {/* Document type filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          key="All"
          onClick={() => handleFilterChange('All')}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            activeFilter === 'All'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <FiLayers className="w-4 h-4" /> All
        </button>
        <button
          key="Translator"
          onClick={() => handleFilterChange('Translator')}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            activeFilter === 'Translator'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <MdTranslate className="w-4 h-4" /> Translator
        </button>
        <button
          key="Summarize"
          onClick={() => handleFilterChange('Summarize')}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            activeFilter === 'Summarize'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <BsFileEarmarkText className="w-4 h-4" /> Summarize
        </button>
        <button
          key="Generate"
          onClick={() => handleFilterChange('Generate')}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            activeFilter === 'Generate'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <AiOutlineFileAdd className="w-4 h-4" /> Generate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-500 rounded-md overflow-hidden hover:outline-none hover:ring-2 hover:ring-blue-500 cursor-pointer shadow-sm hover:shadow-md"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            onClick={() => handleDocumentClick(doc)}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">{doc.date}</div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">
                {doc.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {doc.content}
              </p>
            </div>

            <div className="flex items-center justify-between p-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-500">
                <span>{doc.wordCount}</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(doc);
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500"
                  title="Download"
                >
                  <FiDownload />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500"
                  title="Move to Trash"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <IoDocumentText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-400">
            No documents found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {documents.length > 0
              ? `No documents match the "${activeFilter}" filter.`
              : "You haven't saved any documents yet."}
          </p>
        </div>
      )}

      {/* Document Modal */}
      <AnimatePresence>
        {isModalOpen && selectedDocument && (
          <div className="fixed inset-0 backdrop-blur-md bg-black/30 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-blue-800">
                <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-blue-800 rounded-full"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-grow">
                <div className="mb-4 flex justify-between text-sm text-gray-400">
                  <span>{selectedDocument?.date}</span>
                  <div className="flex items-center gap-2">
                    {selectedDocument &&
                      detectDocumentType(selectedDocument) !== 'Other' && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${getTypeBadgeColor(
                            detectDocumentType(selectedDocument)
                          )}`}
                        >
                          {detectDocumentType(selectedDocument)}
                        </span>
                      )}
                    <span>{selectedDocument?.wordCount} words</span>
                  </div>
                </div>
                <div className="whitespace-pre-wrap">{selectedDocument?.content}</div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-blue-800 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    if (selectedDocument) {
                      handleDownload(selectedDocument);
                      closeModal();
                    }
                  }}
                  className="flex items-center px-4 py-2  bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => {
                    if (selectedDocument) {
                      handleDelete(selectedDocument.id);
                      closeModal();
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
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
