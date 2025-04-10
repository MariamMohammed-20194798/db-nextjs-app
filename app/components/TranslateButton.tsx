import React, { useState } from 'react';

interface TranslateButtonProps {
  content: string;
  type: 'text' | 'file' | 'url';
  isDisabled?: boolean;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({
  content,
  type,
  isDisabled = false,
}) => {
  const [translation, setTranslation] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('spanish');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [savingToHistory, setSavingToHistory] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleTranslate = async () => {
    if (!content || isDisabled) return;

    setLoading(true);
    setError(null);
    setTranslation('');
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to translate content');
      }

      if (!data.translation) {
        throw new Error('No translation was generated');
      }

      setTranslation(data.translation);
      setShowTranslation(true);
    } catch (err) {
      console.error('Error during translation:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred during translation'
      );
    } finally {
      setLoading(false);
    }
  };

  const closeTranslation = () => {
    setShowTranslation(false);
    setSaveSuccess(false);
  };

  const handleSaveToHistory = async () => {
    if (!translation) return;

    setSavingToHistory(true);
    setSaveSuccess(false);

    try {
      // Generate a title from the first line of the translation or first few words
      const title =
        `Translation to ${targetLanguage}: ` +
        (translation.split('\n')[0].substring(0, 40) ||
          translation.split(' ').slice(0, 5).join(' ') + '...');

      const response = await fetch('/api/documents/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: translation,
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
    <div className="w-full">
      <div className="flex gap-2 mb-2">
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="arabic">Arabic</option>
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
          <option value="german">German</option>
          <option value="italian">Italian</option>
          <option value="portuguese">Portuguese</option>
          <option value="chinese">Chinese</option>
          <option value="japanese">Japanese</option>
          <option value="russian">Russian</option>
        </select>

        <button
          onClick={handleTranslate}
          disabled={isDisabled || !content || loading}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            isDisabled || !content
              ? 'bg-gray-300 cursor-not-allowed'
              : loading
              ? 'bg-gray-500'
              : 'bg-pink-800 hover:bg-pink-700 text-white'
          }`}
        >
          {loading ? 'Translating...' : 'Translate Content'}
        </button>
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

      {showTranslation && translation && (
        <>
          <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-md relative">
            <button
              onClick={closeTranslation}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="font-medium mb-2">Translation ({targetLanguage}):</h3>
            <p className="text-sm">{translation}</p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveToHistory}
              disabled={savingToHistory}
              className={`px-4 py-1.5 rounded text-sm ${
                saveSuccess
                  ? 'bg-green-600 text-white cursor-default'
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
          </div>
        </>
      )}
    </div>
  );
};

export default TranslateButton;
