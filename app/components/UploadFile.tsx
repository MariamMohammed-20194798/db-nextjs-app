'use client';
import { useState, useCallback } from 'react';
import { Card, CardBody, Button, Input } from '@nextui-org/react';
import { Upload } from 'lucide-react';
import { GrDocumentText } from 'react-icons/gr';

interface UploadFileProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

export default function UploadFile({
  onFileSelect,
  accept = '*',
  maxSize = 5 * 1024 * 1024, // 5MB default
}: UploadFileProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File) => {
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return false;
    }
    if (accept !== '*' && !file.type.match(accept)) {
      setError('Invalid file type');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        onFileSelect?.(file);
      }
    },
    [onFileSelect, accept, maxSize]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect?.(file);
      }
    },
    [onFileSelect, accept, maxSize]
  );

  return (
    <Card
      className={`w-full max-w-md p-4 ${isDragging ? 'border-primary' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardBody className="flex flex-col items-center justify-center gap-4">
        <Upload className="w-12 h-12 text-primary" />
        <div className="text-center">
          <p className="text-lg font-medium">Drag and drop your file here</p>
          <p className="text-sm text-gray-500">or</p>
        </div>
        <Input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <Button as="label" htmlFor="file-upload" color="primary" variant="flat">
          Browse Files
        </Button>
        {error && <p className="text-danger text-sm">{error}</p>}
      </CardBody>
    </Card>
  );
}
