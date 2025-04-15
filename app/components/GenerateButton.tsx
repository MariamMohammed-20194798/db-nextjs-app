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
      // Generate a title from content type and topic
      const title = `${
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

        // Add new document to the beginning of the array
        existingDocuments.unshift(data.document);

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

  return (
    <div className="w-full">
      <button
        onClick={handleGenerate}
        disabled={isDisabled || !contentType || !topic || loading}
        className={`mt-4 w-full py-2 px-4 rounded-md transition-colors ${
          isDisabled || !contentType || !topic
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : loading
            ? 'bg-gray-500'
            : 'dark:bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {loading ? 'Generating...' : 'Generate Content'}
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

      {showContent && generatedContent && (
        <>
          <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-md relative">
            <button
              onClick={closeContent}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="font-medium mb-2 text-black">Generated {contentType}:</h3>
            <div className="text-sm text-black whitespace-pre-line">
              {generatedContent}
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <button
              id="copy-button"
              onClick={handleCopyToClipboard}
              className="px-4 py-1.5 rounded text-sm dark:bg-transparent border text-blue-500 border-blue-500 hover:scale-105"
            >
              Copy to Clipboard
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

export default GenerateButton;
