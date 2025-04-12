'use client';
import React, { useState } from 'react';
import HeaderSection from '../components/HeaderSection';
import { IoLanguage } from 'react-icons/io5';
import TranslateButton from '../components/TranslateButton';
import { Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from '@nextui-org/react';
import Image from 'next/image';

export default function TranslatorPage() {
  const [sourceText, setSourceText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('ar');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguageLabel, setSourceLanguageLabel] = useState('English');
  const [targetLanguageLabel, setTargetLanguageLabel] = useState('Arabic');

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
  // Find current source and target language objects
  const currentSourceLang =
    languages.find((lang) => lang.value === sourceLanguage) || languages[0];
  const currentTargetLang =
    languages.find((lang) => lang.value === targetLanguage) || languages[1];

  console.log(currentTargetLang);

  return (
    <div className="max-w-4xl mx-auto">
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
              className="w-full h-64 p-3 border border-gray-300 rounded-md focus:border-none text-white resize-none thin-scrollbar"
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
            <style jsx global>{`
              .thin-scrollbar::-webkit-scrollbar {
                width: 10px;
              }
              .thin-scrollbar::-webkit-scrollbar-track {
                background: #4b5563;
              }
              .thin-scrollbar::-webkit-scrollbar-thumb {
                background-color: #9ca3af;
                border-radius: 4px;
              }
            `}</style>
          </div>
          <div>
            <p className="font-bold text-large leading-5 line-clamp-1 text-white mb-1">
              Translated Text
            </p>
            <div className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-white resize-none thin-scrollbar overflow-auto">
              {translatedText}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-3">
            <p className="text-white mt-2 ml-5 font-bold">From:</p>

            <Dropdown className="bg-gray-700 border border-gray-300 rounded-md p-2 text-white">
              <DropdownTrigger>
                <button className="border border-gray-300 rounded-md p-2 text-white flex items-center gap-2">
                  <img
                    src={`https://flagcdn.com/w20/${currentSourceLang.country}.png`}
                    alt={`${currentSourceLang.label} flag`}
                    width={20}
                    height={15}
                    className="rounded-sm"
                  />
                  <span>{sourceLanguageLabel}</span>
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

            <p className="text-white mt-2 ml-8 font-bold">To:</p>

            <Dropdown className="bg-gray-700 border border-gray-300 rounded-md p-2 text-white">
              <DropdownTrigger>
                <button className="border border-gray-300 rounded-md p-2 text-white flex items-center gap-2">
                  <img
                    src={`https://flagcdn.com/w20/${currentTargetLang.country}.png`}
                    alt={`${currentTargetLang.label} flag`}
                    width={20}
                    height={15}
                    className="rounded-sm"
                  />
                  <span>{targetLanguageLabel}</span>
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
