'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import HeaderSection from '../components/HeaderSection';
import { IoLanguage } from 'react-icons/io5';
import { MdSwapHoriz } from 'react-icons/md';
import { IoVolumeHigh, IoPauseSharp } from 'react-icons/io5';
import { Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from '@nextui-org/react';
import { FiCopy, FiSave, FiMessageCircle } from 'react-icons/fi';

export default function TranslatorPage() {
  const [sourceText, setSourceText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('ar');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguageLabel, setSourceLanguageLabel] = useState('English');
  const [targetLanguageLabel, setTargetLanguageLabel] = useState('Arabic');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationTimeout, setTranslationTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [savingToHistory, setSavingToHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSourceSpeaking, setIsSourceSpeaking] = useState(false);
  const [isTargetSpeaking, setIsTargetSpeaking] = useState(false);
  const [summarizedText, setSummarizedText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSummarySuccess, setSaveSummarySuccess] = useState(false);
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
        setError(null);
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
          setError(
            error instanceof Error
              ? error.message
              : 'Translation failed. Please try again.',
          );
        } finally {
          setIsTranslating(false);
        }
      }, 800); // 800ms delay to avoid too frequent API calls

      setTranslationTimeout(timeout);
    },
    [sourceLanguage, targetLanguage],
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
        err instanceof Error ? err.message : 'An error occurred while saving to history',
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

  // Add a new function to handle summarization
  const handleSummarize = async (textToSummarize: string, languageLabel: string) => {
    if (!textToSummarize.trim()) return;

    setIsSummarizing(true);
    setShowSummary(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: textToSummarize,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Summarization failed');
      }

      const data = await response.json();
      setSummarizedText(data.summary);
    } catch (err) {
      console.error('Summarization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to summarize text');
      setSummarizedText('');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Function to copy the summary to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summarizedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      setError('Failed to copy to clipboard');
    }
  };

  // Function to save summary to history
  const saveSummaryToHistory = async () => {
    if (!summarizedText) return;

    try {
      // Generate a title from the first line of the summary or first few words
      const title =
        `Summary of ${targetLanguageLabel} Translation: ` +
        (summarizedText.split('\n')[0].substring(0, 40) ||
          summarizedText.split(' ').slice(0, 5).join(' ') + '...');

      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: summarizedText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save summary to history');
      }

      // Handle successful save
      if (data.document) {
        // Get existing documents or initialize empty array
        const existingDocuments = JSON.parse(localStorage.getItem('documents') || '[]');

        // Format the document
        const formattedDocument = {
          id: data.document.id,
          title: data.document.title,
          content: data.document.content,
          date: formatDate(data.document.created_at),
          wordCount: data.document.word_count,
        };

        // Add to documents
        existingDocuments.unshift(formattedDocument);
        if (existingDocuments.length > MAX_VERSIONS) {
          existingDocuments.splice(MAX_VERSIONS);
        }

        localStorage.setItem('documents', JSON.stringify(existingDocuments));
        localStorage.setItem('documentSaved', Date.now().toString());
        const event = new Event('documentSaved');
        window.dispatchEvent(event);
      }

      setSaveSummarySuccess(true);
      setTimeout(() => {
        setSaveSummarySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error saving summary to history:', err);
      setError(err instanceof Error ? err.message : 'Failed to save summary');
    }
  };

  // Function to open chat with the summary
  const openChatWithSummary = () => {
    if (!summarizedText) return;

    // Store summary in localStorage for the chat page to access
    localStorage.setItem('chatContent', summarizedText);

    // Navigate to chat page
    window.location.href = '/chatbot';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <HeaderSection
        inline
        className="mb-2"
        title="Translator"
        desc="Translate your text between different languages with polished controls and responsive layouts."
        icon={<IoLanguage className="h-7 w-7" />}
        key="translator-header"
      />

      <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-900/80 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {/* Source language selection */}
          <div className="flex min-w-0 items-center">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto border-b-2 border-slate-200 pb-1 dark:border-slate-700">
              {sourceTabLanguages.map((langCode) => {
                const lang = languages.find((l) => l.value === langCode);
                if (!lang) return null;
                return (
                  <button
                    key={`source-tab-${lang.value}`}
                    className={`rounded-full px-3 py-2 text-sm font-medium ${
                      sourceLanguage === lang.value
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
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
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition hover:border-slate-300 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Swap languages"
            title="Swap languages"
          >
            <MdSwapHoriz className="w-6 h-6" />
          </button>

          {/* Target language selection */}
          <div className="flex min-w-0 items-center">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto border-b-2 border-slate-200 pb-1 dark:border-slate-700">
              {targetTabLanguages.map((langCode) => {
                const lang = languages.find((l) => l.value === langCode);
                if (!lang) return null;
                return (
                  <button
                    key={`target-tab-${lang.value}`}
                    className={`rounded-full px-3 py-2 text-sm font-medium ${
                      targetLanguage === lang.value
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
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

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <div className="relative">
              <textarea
                className="h-80 w-full resize-none rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
            <div className="mt-2 flex justify-end">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {sourceText.length}/5,000
              </span>
            </div>
          </div>
          <div>
            <div className="relative h-80 w-full overflow-auto rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 shadow-inner dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
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
            <div className="mt-2 flex justify-end">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Translation
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {sourceText.trim() && translatedText && !isTranslating && (
            <>
              <Dropdown className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white">
                <DropdownTrigger>
                  <button
                    disabled={isSummarizing}
                    className={`min-h-11 rounded-2xl px-4 py-2 text-sm font-medium ${
                      isSummarizing
                        ? 'bg-gray-400 text-white cursor-wait'
                        : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white'
                    }`}
                  >
                    {isSummarizing ? 'Summarizing...' : 'Summarize'}
                  </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Summarize Options">
                  <DropdownItem
                    key="source"
                    className="hover:bg-gray-100 dark:hover:bg-gray-600 mb-2"
                    onClick={() => handleSummarize(sourceText, sourceLanguageLabel)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{sourceLanguageLabel}</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="target"
                    className="hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSummarize(translatedText, targetLanguageLabel)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{targetLanguageLabel}</span>
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <button
                onClick={handleSaveToHistory}
                disabled={savingToHistory}
                className={`min-h-11 rounded-2xl px-4 py-2 text-sm font-medium ${
                  saveSuccess
                    ? 'bg-blue-500 dark:bg-blue-400 text-white cursor-default'
                    : savingToHistory
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
                }`}
              >
                {saveSuccess
                  ? 'Saved to History! 🎉'
                  : savingToHistory
                    ? 'Saving...'
                    : 'Save to History'}
              </button>
            </>
          )}
        </div>

        {/* Summary Section */}
        {showSummary && (
          <div className="mt-6 rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Summary
            </h3>

            <div className="relative mb-3 min-h-[120px] w-full rounded-[20px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-900 shadow-inner dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              {isSummarizing ? (
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
                <p>{summarizedText}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!summarizedText || isSummarizing}
                className={`flex min-h-11 items-center rounded-2xl px-3 py-2 text-sm font-medium ${
                  copySuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white'
                }`}
              >
                <FiCopy className="mr-1" />
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>

              <button
                onClick={saveSummaryToHistory}
                disabled={!summarizedText || isSummarizing}
                className={`flex min-h-11 items-center rounded-2xl px-3 py-2 text-sm font-medium ${
                  saveSummarySuccess
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white'
                }`}
              >
                <FiSave className="mr-1" />
                {saveSummarySuccess ? 'Saved!' : 'Save to History'}
              </button>

              <button
                onClick={openChatWithSummary}
                disabled={!summarizedText || isSummarizing}
                className="flex min-h-11 items-center rounded-2xl bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              >
                <FiMessageCircle className="mr-1" />
                Chat
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
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
