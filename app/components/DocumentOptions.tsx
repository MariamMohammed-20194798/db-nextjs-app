import React, { useState } from 'react';
import SummarizeButton from './SummarizeButton';
import TranslateButton from './TranslateButton';

interface DocumentOptionsProps {
  content: string;
  type: 'text' | 'file' | 'url';
  isDisabled?: boolean;
}

const DocumentOptions: React.FC<DocumentOptionsProps> = ({
  content,
  type,
  isDisabled = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<'summarize' | 'translate'>(
    'summarize'
  );

  return (
    <div className="w-full mt-4">
      <div className="flex gap-2 mb-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setSelectedOption('summarize')}
          className={`py-2 px-4 rounded-t-md transition-colors ${
            selectedOption === 'summarize'
              ? 'bg-pink-800 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Summarize
        </button>
        <button
          onClick={() => setSelectedOption('translate')}
          className={`py-2 px-4 rounded-t-md transition-colors ${
            selectedOption === 'translate'
              ? 'bg-pink-800 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Translate
        </button>
      </div>

      <div className="p-1">
        {selectedOption === 'summarize' ? (
          <SummarizeButton content={content} type={type} isDisabled={isDisabled} />
        ) : (
          <TranslateButton content={content} type={type} isDisabled={isDisabled} />
        )}
      </div>
    </div>
  );
};

export default DocumentOptions;
