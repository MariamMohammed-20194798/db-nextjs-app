import React from 'react';
import { Textarea } from '@heroui/input';
import { Button } from '@heroui/button';
import SummarizeButton from './SummarizeButton';

const AddSourceUrl = () => {
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
        placeholder="URL"
      />
      <SummarizeButton content={docName} type="url" isDisabled={!docName.trim()} />
    </div>
  );
};

export default AddSourceUrl;
