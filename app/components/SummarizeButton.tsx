import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCopy, FiSave, FiMessageCircle } from 'react-icons/fi';
// Maximum number of versions to keep
const MAX_VERSIONS = 9;

interface SummarizeButtonProps {
  content: string;
  type: 'text' | 'file' | 'url';
  isDisabled?: boolean;
}

const SummarizeButton: React.FC<SummarizeButtonProps> = ({
  content,
  type,
  isDisabled = false,
}) => {
  const router = useRouter();
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [savingToHistory, setSavingToHistory] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleSummarize = async () => {
    if (!content || isDisabled) return;

    setLoading(true);
    setError(null);
    setSummary('');
    setSaveSuccess(false);
    setSavedDocumentId(null);
    setShowSummary(true);

    try {
      console.log(
        `Sending ${type} content for summarization:`,
        type === 'text' ? content.substring(0, 50) + '...' : content
      );

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize content');
      }

      if (!data.summary) {
        throw new Error('No summary was generated');
      }

      setSummary(data.summary);
    } catch (err) {
      console.error('Error during summarization:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred during summarization'
      );
    } finally {
      setLoading(false);
    }
  };

  const closeSummary = () => {
    setShowSummary(false);
    setSaveSuccess(false);
  };

  const handleSaveToHistory = async () => {
    if (!summary) return;

    setSavingToHistory(true);
    setSaveSuccess(false);

    try {
      // Generate a title from the first line of the summary or first few words
      const firstLine = summary.split('\n')[0];
      let titleText = firstLine.includes(',')
        ? firstLine.split(',')[0].trim()
        : firstLine.split(' ').slice(0, 5).join(' ');

      // Ensure title isn't too long
      if (titleText.length > 40) {
        titleText = titleText.substring(0, 40) + '...';
      }

      const title = `Summarized: ${titleText}`;

      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: summary,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save to history');
      }

      // Store the newly created document in local storage for persistence
      if (data.document) {
        // Set the saved document ID for the chat button
        setSavedDocumentId(data.document.id);

        // Get existing documents or initialize empty array
        const existingDocuments = JSON.parse(localStorage.getItem('documents') || '[]');

        // Format the document to match the VersionDocument structure
        const formattedDocument = {
          id: data.document.id,
          title: data.document.title,
          content: data.document.content,
          date: formatDate(data.document.created_at),
          wordCount: data.document.word_count,
        };

        // Add new document to the beginning of the array
        existingDocuments.unshift(formattedDocument);

        // Limit to MAX_VERSIONS
        if (existingDocuments.length > MAX_VERSIONS) {
          existingDocuments.splice(MAX_VERSIONS);
        }

        // Save back to localStorage
        localStorage.setItem('documents', JSON.stringify(existingDocuments));

        // Trigger events to notify other components
        localStorage.setItem('documentSaved', Date.now().toString());

        // Dispatch custom event for same-tab updates
        const event = new Event('documentSaved');
        window.dispatchEvent(event);
      }

      setSaveSuccess(true);
    } catch (err) {
      console.error('Error saving to history:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred while saving to history'
      );
    } finally {
      setSavingToHistory(false);
    }
  };

  const handleChatWithSummary = async () => {
    // If we don't have a saved document ID yet, save it to Supabase first
    if (!savedDocumentId) {
      try {
        // Save as temporary document
        const response = await fetch('/api/temp-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Temporary Summary',
            content: summary,
            type: 'summary',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save temporary document');
        }

        // Navigate to chatbot with temporary document ID
        router.push(`/chatbot?documentId=${data.document.id}`);
      } catch (error) {
        console.error('Error saving temporary document:', error);
        setError('Failed to create chat session. Please try again.');
      }
    } else {
      // Navigate to chatbot with saved document ID
      router.push(`/chatbot?documentId=${savedDocumentId}`);
    }
  };

  const handleCopyToClipboard = () => {
    if (!summary) return;

    navigator.clipboard
      .writeText(summary)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy content: ', err);
      });
  };

  // Function to format date as "Apr 15" style
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }

  return (
    <div className="w-full">
      <button
        onClick={handleSummarize}
        disabled={isDisabled || loading}
        className={`mt-4 w-full py-2 px-4 rounded-md transition-colors ${
          isDisabled
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : loading
            ? 'bg-gray-400 text-white cursor-wait'
            : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
        }`}
      >
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-400 rounded">
          {error}
        </div>
      )}

      {/* Inline Summary Section */}
      {showSummary && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Summary
          </h3>

          <div className="relative w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[100px] mb-3">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[100px] text-gray-500">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Generating summary...</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{summary}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyToClipboard}
              disabled={!summary || loading}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                !summary || loading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : copySuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
              }`}
            >
              <FiCopy className="mr-1" />
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleSaveToHistory}
              disabled={!summary || loading || savingToHistory}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                !summary || loading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : savingToHistory
                  ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                  : saveSuccess
                  ? 'bg-blue-500 dark:bg-blue-400 text-white'
                  : 'bg-gray-200 dark:bg-blue-500 hover:bg-gray-300 text-black'
              }`}
            >
              <FiSave className="mr-1" />
              {savingToHistory ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save to History'}
            </button>
            <button
              onClick={handleChatWithSummary}
              disabled={!summary || loading}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                !summary || loading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-black'
              }`}
            >
              <FiMessageCircle className="mr-1" />
              Chat with AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarizeButton;
