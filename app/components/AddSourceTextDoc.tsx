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
        className="w-full p-4 text-base border border-gray-200 rounded-md outline-none"
        placeholder="Document Name"
      />
      <textarea
        className="w-full p-3 border border-gray-200 rounded mb-4 text-black outline-none resize-none"
        value={docText}
        onChange={(e) => setDocText(e.target.value)}
        placeholder="Document Content"
        rows={4}
      />

      <SummarizeButton content={docText} type="text" isDisabled={!docText.trim()} />
    </div>
  );
};

export default AddSourceTextDoc;
