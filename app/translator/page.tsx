'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import HeaderSection from '../components/HeaderSection';
import { IoLanguage } from 'react-icons/io5';
import { MdSwapHoriz } from 'react-icons/md';
import { IoVolumeHigh, IoPauseSharp } from 'react-icons/io5';
import { Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from '@nextui-org/react';

export default function TranslatorPage() {
  const [sourceText, setSourceText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('ar');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguageLabel, setSourceLanguageLabel] = useState('English');
  const [targetLanguageLabel, setTargetLanguageLabel] = useState('Arabic');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationTimeout, setTranslationTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [savingToHistory, setSavingToHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSourceSpeaking, setIsSourceSpeaking] = useState(false);
  const [isTargetSpeaking, setIsTargetSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice mapping for different languages (ElevenLabs voice IDs)
  const languageVoiceMap: Record<string, string> = {
    en: 'EXAVITQu4vr4xnSDxMaL', // Default English voice ID
    es: 'pNInz6obpgDQGcFmaJgB', // Spanish voice ID
    fr: 'jBpfuIE2acCO8z3wKNLl', // French voice ID
    de: 'AZnzlk1XvdvUeBnXmlld', // German voice ID
    it: 'Yko7PKHZNXotIFUBG7I9', // Italian voice ID
    ar: 'pNInz6obpgDQGcFmaJgB', // Arabic voice ID
    ja: 'pNInz6obpgDQGcFmaJgB', // Japanese voice ID
    zh: 'pNInz6obpgDQGcFmaJgB', // Chinese voice ID
    pt: 'pNInz6obpgDQGcFmaJgB', // Portuguese voice ID
    ru: 'pNInz6obpgDQGcFmaJgB', // Russian voice ID
    tr: 'pNInz6obpgDQGcFmaJgB', // Turkish voice ID
    // Add more language and voice ID mappings as needed
    // You can find voice IDs in ElevenLabs dashboard
  };

  const languages = [
    { value: 'en', label: 'English', country: 'us' },
    { value: 'ar', label: 'Arabic', country: 'sa' },
    { value: 'es', label: 'Spanish', country: 'es' },
    { value: 'fr', label: 'French', country: 'fr' },
    { value: 'de', label: 'German', country: 'de' },
    { value: 'it', label: 'Italian', country: 'it' },
    { value: 'ja', label: 'Japanese', country: 'jp' },
    { value: 'zh', label: 'Chinese', country: 'cn' },
    { value: 'pt', label: 'Portuguese', country: 'pt' },
    { value: 'ru', label: 'Russian', country: 'ru' },
    { value: 'tr', label: 'Turkish', country: 'tr' },
  ];

  // Track displayed languages in tab order
  const [sourceTabLanguages, setSourceTabLanguages] = useState(['en', 'ar', 'es']);
  const [targetTabLanguages, setTargetTabLanguages] = useState(['en', 'ar', 'es']);

  // Find current source and target language objects
  const currentSourceLang =
    languages.find((lang) => lang.value === sourceLanguage) || languages[0];
  const currentTargetLang =
    languages.find((lang) => lang.value === targetLanguage) || languages[1];

  // Update tab languages when a language is selected from dropdown
  const updateSourceLanguage = (langValue: string, langLabel: string) => {
    setSourceLanguage(langValue);
    setSourceLanguageLabel(langLabel);

    // Update displayed tab languages in order
    if (!sourceTabLanguages.includes(langValue)) {
      const newTabLanguages = [...sourceTabLanguages];
      newTabLanguages.pop(); // Remove the last tab
      newTabLanguages.unshift(langValue); // Add new language at the beginning
      setSourceTabLanguages(newTabLanguages);
    }
  };

  const updateTargetLanguage = (langValue: string, langLabel: string) => {
    setTargetLanguage(langValue);
    setTargetLanguageLabel(langLabel);

    // Update displayed tab languages in order
    if (!targetTabLanguages.includes(langValue)) {
      const newTabLanguages = [...targetTabLanguages];
      newTabLanguages.pop(); // Remove the last tab
      newTabLanguages.unshift(langValue); // Add new language at the beginning
      setTargetTabLanguages(newTabLanguages);
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    const tempLabel = sourceLanguageLabel;
    const tempText = sourceText;

    setSourceLanguage(targetLanguage);
    setSourceLanguageLabel(targetLanguageLabel);
    setSourceText(translatedText);

    setTargetLanguage(tempLang);
    setTargetLanguageLabel(tempLabel);
    setTranslatedText(tempText);

    // Also swap the tab languages
    setSourceTabLanguages([
      targetLanguage,
      ...sourceTabLanguages.filter((lang) => lang !== targetLanguage).slice(0, 2),
    ]);
    setTargetTabLanguages([
      sourceLanguage,
      ...targetTabLanguages.filter((lang) => lang !== sourceLanguage).slice(0, 2),
    ]);
  };

  // Text-to-speech function
  const speakText = async (text: string, isSource: boolean) => {
    if (!text.trim()) return;

    // If audio is already playing, stop it
    if ((isSource && isSourceSpeaking) || (!isSource && isTargetSpeaking)) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;

        if (isSource) {
          setIsSourceSpeaking(false);
        } else {
          setIsTargetSpeaking(false);
        }
        return;
      }
    }

    try {
      if (isSource) {
        setIsSourceSpeaking(true);
      } else {
        setIsTargetSpeaking(true);
      }

      // Get the language for voice selection
      const language = isSource ? sourceLanguage : targetLanguage;

      // Get the voice ID based on language, or use English as fallback
      const voiceId = languageVoiceMap[language] || languageVoiceMap['en'];

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voiceId: voiceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        if (isSource) {
          setIsSourceSpeaking(false);
        } else {
          setIsTargetSpeaking(false);
        }
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        if (isSource) {
          setIsSourceSpeaking(false);
        } else {
          setIsTargetSpeaking(false);
        }
        URL.revokeObjectURL(audioUrl);
        setError('Error playing audio');
      };

      audio.play();
    } catch (err) {
      console.error('Text-to-speech error:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert text to speech');
      if (isSource) {
        setIsSourceSpeaking(false);
      } else {
        setIsTargetSpeaking(false);
      }
    }
  };

  // Debounce function for translation
  const debounceTranslation = useCallback(
    (text: string) => {
      if (translationTimeout) {
        clearTimeout(translationTimeout);
      }

      if (!text.trim()) {
        setTranslatedText('');
        return;
      }

      const timeout = setTimeout(async () => {
        setIsTranslating(true);
        try {
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: text,
              type: 'text',
              sourceLanguage,
              targetLanguage,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Translation failed');
          }

          const data = await response.json();
          setTranslatedText(data.translation);
        } catch (error) {
          console.error('Translation error:', error);
        } finally {
          setIsTranslating(false);
        }
      }, 800); // 800ms delay to avoid too frequent API calls

      setTranslationTimeout(timeout);
    },
    [sourceLanguage, targetLanguage]
  );

  // Auto-translate when text, source language, or target language changes
  useEffect(() => {
    if (sourceText.trim()) {
      debounceTranslation(sourceText);
    } else {
      setTranslatedText('');
    }

    // Cleanup
    return () => {
      if (translationTimeout) {
        clearTimeout(translationTimeout);
      }
    };
  }, [sourceText, sourceLanguage, targetLanguage, debounceTranslation]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Maximum number of versions to keep
  const MAX_VERSIONS = 9;

  // Save translated text to history
  const handleSaveToHistory = async () => {
    if (!translatedText) return;

    setSavingToHistory(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Generate a title from the first line of the translation or first few words
      const title =
        `Translation to ${targetLanguageLabel}: ` +
        (translatedText.split('\n')[0].substring(0, 40) ||
          translatedText.split(' ').slice(0, 5).join(' ') + '...');

      const response = await fetch('/api/history', {
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
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving to history:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred while saving to history'
      );
    } finally {
      setSavingToHistory(false);
    }
  };

  // Function to format date as "Apr 15" style
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <HeaderSection
        inline
        className={'mb-5'}
        title="Translator"
        desc="Translate your text between different languages."
        icon={<IoLanguage className="w-10 h-10" />}
        key={'translator-header'}
      />

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6">
        <div className="flex justify-between mb-2">
          {/* Source language selection */}
          <div className="flex items-center">
            <div className="flex border-b-2 border-gray-200 dark:border-gray-600">
              {sourceTabLanguages.map((langCode) => {
                const lang = languages.find((l) => l.value === langCode);
                if (!lang) return null;
                return (
                  <button
                    key={`source-tab-${lang.value}`}
                    className={`px-4 py-2 text-sm font-medium ${
                      sourceLanguage === lang.value
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-0.5'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                    onClick={() => updateSourceLanguage(lang.value, lang.label)}
                  >
                    {lang.label}
                  </button>
                );
              })}
              <Dropdown className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white">
                <DropdownTrigger>
                  <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Source Languages">
                  {languages
                    .filter((lang) => !sourceTabLanguages.includes(lang.value))
                    .map((language) => (
                      <DropdownItem
                        className="hover:bg-gray-100 dark:hover:bg-gray-600"
                        key={`source-${language.value}`}
                        onClick={() =>
                          updateSourceLanguage(language.value, language.label)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/w20/${language.country}.png`}
                            alt={`${language.label} flag`}
                            width={20}
                            height={15}
                            className="rounded-sm"
                          />
                          <span>{language.label}</span>
                        </div>
                      </DropdownItem>
                    ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwapLanguages}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            aria-label="Swap languages"
            title="Swap languages"
          >
            <MdSwapHoriz className="w-6 h-6" />
          </button>

          {/* Target language selection */}
          <div className="flex items-center">
            <div className="flex border-b-2 border-gray-200 dark:border-gray-600">
              {targetTabLanguages.map((langCode) => {
                const lang = languages.find((l) => l.value === langCode);
                if (!lang) return null;
                return (
                  <button
                    key={`target-tab-${lang.value}`}
                    className={`px-4 py-2 text-sm font-medium ${
                      targetLanguage === lang.value
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-0.5'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                    onClick={() => updateTargetLanguage(lang.value, lang.label)}
                  >
                    {lang.label}
                  </button>
                );
              })}
              <Dropdown className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white">
                <DropdownTrigger>
                  <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Target Languages">
                  {languages
                    .filter((lang) => !targetTabLanguages.includes(lang.value))
                    .map((language) => (
                      <DropdownItem
                        className="hover:bg-gray-100 dark:hover:bg-gray-600"
                        key={`target-${language.value}`}
                        onClick={() =>
                          updateTargetLanguage(language.value, language.label)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/w20/${language.country}.png`}
                            alt={`${language.label} flag`}
                            width={20}
                            height={15}
                            className="rounded-sm"
                          />
                          <span>{language.label}</span>
                        </div>
                      </DropdownItem>
                    ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <div className="relative">
              <textarea
                className="w-full h-84 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none thin-scrollbar"
                //placeholder="Enter Content to Translate..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
              />
              {sourceText.trim() && (
                <button
                  onClick={() => speakText(sourceText, true)}
                  disabled={false}
                  className={`absolute bottom-4 right-4 p-2 rounded-full ${
                    isSourceSpeaking
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
                  } transition-colors`}
                  aria-label={isSourceSpeaking ? 'Stop audio' : 'Listen to source text'}
                  title={
                    isSourceSpeaking
                      ? 'Stop audio'
                      : `Listen to source text (${sourceLanguageLabel} voice)`
                  }
                >
                  {isSourceSpeaking ? (
                    <IoPauseSharp className="w-5 h-5" />
                  ) : (
                    <IoVolumeHigh className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {sourceText.length}/5,000
              </span>
            </div>
          </div>
          <div>
            <div className="relative w-full h-84 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none thin-scrollbar overflow-auto">
              {isTranslating ? (
                <div className="flex items-center justify-center h-full text-gray-500">
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
                </div>
              ) : (
                <>
                  {translatedText}
                  {translatedText.trim() && (
                    <button
                      onClick={() => speakText(translatedText, false)}
                      disabled={false}
                      className={`absolute bottom-2 right-2 p-2 rounded-full ${
                        isTargetSpeaking
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
                      } transition-colors`}
                      aria-label={
                        isTargetSpeaking ? 'Stop audio' : 'Listen to translated text'
                      }
                      title={
                        isTargetSpeaking
                          ? 'Stop audio'
                          : `Listen to translated text (${targetLanguageLabel} voice)`
                      }
                    >
                      {isTargetSpeaking ? (
                        <IoPauseSharp className="w-5 h-5" />
                      ) : (
                        <IoVolumeHigh className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Translation
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          {sourceText.trim() && translatedText && !isTranslating && (
            <button
              onClick={handleSaveToHistory}
              disabled={savingToHistory}
              className={`px-4 py-2 rounded-md text-sm ${
                saveSuccess
                  ? 'dark:bg-blue-400 text-white cursor-default'
                  : savingToHistory
                  ? 'bg-gray-400 text-white cursor-wait'
                  : 'dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
              }`}
            >
              {saveSuccess
                ? 'Saved to History! 🎉'
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
          </div>
        )}

        <style jsx global>{`
          .thin-scrollbar::-webkit-scrollbar {
            width: 10px;
          }
          .thin-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .thin-scrollbar::-webkit-scrollbar-thumb {
            background-color: #888;
            border-radius: 4px;
          }
          @media (prefers-color-scheme: dark) {
            .thin-scrollbar::-webkit-scrollbar-track {
              background: #374151;
            }
            .thin-scrollbar::-webkit-scrollbar-thumb {
              background-color: #6b7280;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
