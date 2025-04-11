'use client';
import React, { useState } from 'react';
import HeaderSection from '../components/HeaderSection';
import { IoLanguage } from 'react-icons/io5';
import TranslateButton from '../components/TranslateButton';
import { Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from '@nextui-org/react';

export default function TranslatorPage() {
  const [sourceText, setSourceText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguageLabel, setSourceLanguageLabel] = useState('English');
  const [targetLanguageLabel, setTargetLanguageLabel] = useState('Spanish');

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'tr', label: 'Turkish' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6">
      <HeaderSection
        inline
        className={'mb-5'}
        title="Translator"
        desc="Translate your text between different languages."
        icon={<IoLanguage className="w-10 h-10" />}
        key={'translator-header'}
      />

      <div className="bg-gray-700 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-large leading-5 line-clamp-1 text-white mb-1">
              Source Text
            </p>
            <textarea
              className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-white resize-none"
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </div>
          <div>
            <p className="font-bold text-large leading-5 line-clamp-1 text-white mb-1">
              Translated Text
            </p>
            <div className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-white resize-none">
              {translatedText}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-10">
            <Dropdown className="bg-gray-700 border border-gray-300 rounded-md p-2 text-white">
              <DropdownTrigger>
                <button className="border border-gray-300 rounded-md p-2 text-white">
                  {sourceLanguageLabel}
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Source Languages">
                {languages.map((language) => (
                  <DropdownItem
                    className="hover:bg-gray-600"
                    key={`source-${language.value}`}
                    onClick={() => {
                      setSourceLanguage(language.value);
                      setSourceLanguageLabel(language.label);
                    }}
                  >
                    {language.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown className="bg-gray-700 border border-gray-300 rounded-md p-2 text-white">
              <DropdownTrigger>
                <button className="border border-gray-300 rounded-md p-2 text-white">
                  {targetLanguageLabel}
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Target Languages">
                {languages.map((language) => (
                  <DropdownItem
                    className="hover:bg-gray-600"
                    key={`target-${language.value}`}
                    onClick={() => {
                      setTargetLanguage(language.value);
                      setTargetLanguageLabel(language.label);
                    }}
                  >
                    {language.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <TranslateButton
            content={sourceText}
            type="text"
            isDisabled={!sourceText.trim()}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onTranslate={setTranslatedText}
          />
        </div>
      </div>
    </div>
  );
}
