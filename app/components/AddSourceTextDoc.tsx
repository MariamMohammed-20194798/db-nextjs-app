import React from 'react';
import { Textarea } from '@heroui/input';
import { Button } from '@heroui/button';
import SummarizeButton from './SummarizeButton';

const AddSourceTextDoc = () => {
  const [docText, setDocText] = React.useState('');
  const [docName, setDocName] = React.useState('');
  const [docDescription, setDocDesc] = React.useState('' as string);
  const [loading, setIsLoading] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <input
        value={docName}
        onChange={(e) => setDocName(e.target.value)}
        className="w-full p-4 text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none thin-scrollbar"
        placeholder="Document Name"
      />
      <textarea
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none thin-scrollbar"
        value={docText}
        onChange={(e) => setDocText(e.target.value)}
        placeholder="Document Content"
        rows={8}
      />
      <SummarizeButton content={docText} type="text" isDisabled={!docText.trim()} />
    </div>
  );
};

export default AddSourceTextDoc;
