import React, { useState } from 'react';
import GenerateButton from './GenerateButton';

const ContentGenerationForm: React.FC = () => {
  const [contentType, setContentType] = useState<string>('blog');
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<string>('professional');
  const [length, setLength] = useState<string>('medium');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');

  const contentTypes = [
    { value: 'blog', label: 'Blog Post' },
    { value: 'email', label: 'Email' },
    { value: 'report', label: 'Report' },
    { value: 'social', label: 'Social Media Post' },
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'persuasive', label: 'Persuasive' },
    { value: 'informative', label: 'Informative' },
  ];

  const lengths = [
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'long', label: 'Long' },
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <label className="block text-md font-medium dark:text-gray-400 mb-1">
          Content Type
        </label>
        <div className="flex flex-wrap gap-2">
          {contentTypes.map((type) => (
            <button
              key={type.value}
              className={`px-3 py-1 rounded-md text-sm ${
                contentType === type.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setContentType(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="topic"
          className="block text-md font-medium dark:text-gray-400 mb-1"
        >
          Topic or Subject
        </label>
        <input
          type="text"
          id="topic"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Enter the topic or subject"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block text-md font-medium dark:text-gray-400 mb-1">Tone</label>
        <div className="flex flex-wrap gap-2">
          {tones.map((t) => (
            <button
              key={t.value}
              className={`px-3 py-1 rounded-md text-sm ${
                tone === t.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setTone(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-md font-medium dark:text-gray-400 mb-1">
          Length
        </label>
        <div className="flex gap-2">
          {lengths.map((l) => (
            <button
              key={l.value}
              className={`px-3 py-1 rounded-md text-sm ${
                length === l.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setLength(l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="additional-info"
          className="block text-md font-medium dark:text-gray-400 mb-1"
        >
          Additional Requirements (Optional)
        </label>
        <textarea
          id="additional-info"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none h-20"
          placeholder="Add any specific requirements or details about the content you want"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
        ></textarea>
      </div>

      <GenerateButton
        contentType={contentType}
        topic={topic}
        tone={tone}
        length={length}
        additionalInfo={additionalInfo}
        isDisabled={!topic}
      />
    </div>
  );
};

export default ContentGenerationForm;
