import React, { useState } from 'react';

// Maximum number of versions to keep
const MAX_VERSIONS = 9;

interface GenerateButtonProps {
  contentType: string;
  topic: string;
  tone?: string;
  length?: string;
  additionalInfo?: string;
  isDisabled?: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  contentType,
  topic,
  tone,
  length,
  additionalInfo,
  isDisabled = false,
}) => {
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [savingToHistory, setSavingToHistory] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!contentType || !topic || isDisabled) return;

    setLoading(true);
    setError(null);
    setGeneratedContent('');
    setSaveSuccess(false);

    try {
      console.log(`Generating ${contentType} content about: ${topic}`);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          topic,
          tone,
          length,
          additionalInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      if (!data.generatedContent) {
        throw new Error('No content was generated');
      }

      setGeneratedContent(data.generatedContent);
      setShowContent(true);
    } catch (err) {
      console.error('Error during content generation:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred during content generation'
      );
    } finally {
      setLoading(false);
    }
  };

  const closeContent = () => {
    setShowContent(false);
    setSaveSuccess(false);
  };

  const handleSaveToHistory = async () => {
    if (!generatedContent) return;

    setSavingToHistory(true);
    setSaveSuccess(false);

    try {
      // Generate a title from content type and topic with prefix for better detection
      const title = `Generate: ${
        contentType.charAt(0).toUpperCase() + contentType.slice(1)
      } about ${topic}`;

      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: generatedContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save to history');
      }

      // Store the newly created document in local storage for persistence
      if (data.document) {
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

  const handleCopyToClipboard = () => {
    if (!generatedContent) return;

    navigator.clipboard
      .writeText(generatedContent)
      .then(() => {
        // Show brief feedback
        const copyButton = document.getElementById('copy-button');
        if (copyButton) {
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            copyButton.textContent = 'Copy to Clipboard';
          }, 2000);
        }
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
        onClick={handleGenerate}
        disabled={isDisabled || !contentType || !topic || loading}
        className={`mt-4 w-full py-2 px-4 rounded-md transition-colors ${
          isDisabled || !contentType || !topic
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : loading
            ? 'bg-gray-500 dark:bg-gray-600 text-white'
            : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
        }`}
      >
        {loading ? 'Generating...' : 'Generate Content'}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-400 rounded">
          {error}
        </div>
      )}

      {showContent && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg j font-semibold text-gray-800 dark:text-white">
                Generated {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
              </h2>
              <button
                onClick={closeContent}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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

            <div className="p-4 overflow-y-auto flex-1">
              <div className="p-4 rounded-md whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {generatedContent}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <div className="flex space-x-2">
                <button
                  id="copy-button"
                  onClick={handleCopyToClipboard}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={handleSaveToHistory}
                  disabled={savingToHistory}
                  className={`px-4 py-2 rounded transition-colors ${
                    savingToHistory
                      ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                      : saveSuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
                  }`}
                >
                  {savingToHistory
                    ? 'Saving...'
                    : saveSuccess
                    ? 'Saved!'
                    : 'Save to History'}
                </button>
              </div>
              <button
                onClick={closeContent}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateButton;
