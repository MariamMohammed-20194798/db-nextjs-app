import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  const handleSummarize = async () => {
    if (!content || isDisabled) return;

    setLoading(true);
    setError(null);
    setSummary('');
    setSaveSuccess(false);
    setSavedDocumentId(null);

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
      setShowSummary(true);
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
      const title = firstLine.includes(',')
        ? firstLine.split(',')[0].trim()
        : firstLine.split(' ').slice(0, 5).join(' ');

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

      // Set the saved document ID for the chat button
      if (data.document) {
        setSavedDocumentId(data.document.id);
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

  return (
    <div className="w-full">
      <button
        onClick={handleSummarize}
        disabled={isDisabled || !content || loading}
        className={`mt-4 w-full py-2 px-4 rounded-md transition-colors ${
          isDisabled || !content
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : loading
            ? 'bg-gray-500'
            : 'dark:bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        {loading ? 'Summarizing...' : 'Summarize Content'}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-800 rounded">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <p className="text-xs mt-1">
            Please check if your OpenAI API key is valid and properly configured.
          </p>
        </div>
      )}

      {showSummary && summary && (
        <>
          <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-md relative">
            <button
              onClick={closeSummary}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="font-medium mb-2 text-black">Summary:</h3>
            <p className="text-sm text-black">{summary}</p>
          </div>
          <div className="mt-4 flex justify-between">
            <button
              onClick={handleChatWithSummary}
              className="px-4 py-1.5 rounded text-sm dark:bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105"
            >
              Chat with this Summary
            </button>

            <button
              onClick={handleSaveToHistory}
              disabled={savingToHistory}
              className={`px-4 py-1.5 rounded text-sm dark:bg-transparent border ${
                saveSuccess
                  ? 'text-blue-500 border-blue-500 cursor-default'
                  : savingToHistory
                  ? 'text-blue-500 cursor-wait'
                  : 'text-blue-500 border-blue-500 hover:scale-105'
              }`}
            >
              {saveSuccess
                ? 'Saved to History! 🎉'
                : savingToHistory
                ? 'Saving...'
                : 'Save to History'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SummarizeButton;
