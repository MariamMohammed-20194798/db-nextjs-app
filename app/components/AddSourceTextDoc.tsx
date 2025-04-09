import React from 'react';
import { Textarea } from '@heroui/input';
import { Button } from '@heroui/button';

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
        className="w-full p-4 text-base border border-gray-200 rounded-md"
        placeholder="Document Name"
      />

      <div className="flex flex-col gap-1">
        <input
          value={docDescription}
          onChange={(e) => setDocDesc(e.target.value)}
          className="w-full p-4 text-base border border-gray-200 rounded-md"
          placeholder="Description"
        />
      </div>

      <Textarea
        value={docText}
        onChange={(e) => setDocText(e.target.value)}
        className="w-full min-h-[200px] text-base border rounded-md"
        labelPlacement="outside"
        placeholder="Document Content"
      />

      <Button
        className="w-auto px-6 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        onClick={() => {
          setIsLoading(true);
          // Uncomment and implement addKBDocFromText function
          // addKBDocFromText().finally(() => setIsLoading(false));
        }}
        isLoading={loading}
      >
        + Add Doc
      </Button>
    </div>
  );
};

export default AddSourceTextDoc;
