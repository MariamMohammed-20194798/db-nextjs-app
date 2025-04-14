import React, { useState } from 'react';

// Maximum number of versions to keep
const MAX_VERSIONS = 9;

interface TranslateButtonProps {
  content: string;
  type: 'text' | 'file' | 'url';
  isDisabled?: boolean;
  sourceLanguage?: string;
  targetLanguage?: string;
  onTranslate?: (translatedText: string) => void;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({
  content,
  type,
  isDisabled = false,
  sourceLanguage = 'en',
  targetLanguage = 'es',
  onTranslate,
}) => {
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [savingToHistory, setSavingToHistory] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleTranslate = async () => {
    if (!content.trim() || isDisabled) return;

    setIsLoading(true);
    setError(null);
    setTranslatedText('');
    setSaveSuccess(false);

    try {
      console.log(
        `Sending ${type} content for translation:`,
        type === 'text' ? content.substring(0, 50) + '...' : content
      );

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type,
          targetLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.translation);
      setShowTranslation(true);
      onTranslate?.(data.translation);
    } catch (error) {
      console.error('Translation error:', error);
      setError(
        error instanceof Error ? error.message : 'Translation failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const closeTranslation = () => {
    setShowTranslation(false);
    setSaveSuccess(false);
  };

  const handleSaveToHistory = async () => {
    if (!translatedText) return;

    setSavingToHistory(true);
    setSaveSuccess(false);

    try {
      // Generate a title from the first line of the translation or first few words
      const firstLine = translatedText.split('\n')[0];
      const title =
        `Translation to ${targetLanguage}` +
        '/\n' +
        (firstLine.includes(',')
          ? firstLine.split(',')[0].trim()
          : firstLine.split(' ').slice(0, 5).join(' ') + '...');

      const response = await fetch('/api/documents/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: translatedText,
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleTranslate}
          disabled={isDisabled || isLoading}
          className={`px-4 py-2 rounded-md transition-colors ${
            isDisabled || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'dark:bg-pink-900 hover:bg-pink-700 text-white'
          }`}
        >
          {isLoading ? 'Translating...' : 'Translate'}
        </button>
        {showTranslation && translatedText && (
          <button
            onClick={handleSaveToHistory}
            disabled={savingToHistory}
            className={`px-4 py-2 rounded-md text-sm ${
              saveSuccess
                ? 'bg-green-800 text-white cursor-default'
                : savingToHistory
                ? 'bg-gray-400 text-white cursor-wait'
                : 'bg-pink-800 hover:bg-pink-700 text-white'
            }`}
          >
            {saveSuccess
              ? 'Saved to History.'
              : savingToHistory
              ? 'Saving...'
              : 'Save to History'}
          </button>
        )}
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-800 rounded">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <p className="text-xs mt-1">
            Please check if your API key is valid and properly configured.
          </p>
        </div>
      )}
    </div>
  );
};

export default TranslateButton;
