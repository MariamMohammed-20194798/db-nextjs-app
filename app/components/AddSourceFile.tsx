import React, { useState, useRef, useCallback } from 'react';
import { BsCloudUpload } from 'react-icons/bs';
import SummarizeButton from './SummarizeButton';

interface AddSourceFileProps {
  onFilesAdded: (files: File[]) => void;
  maxSizeMB?: number;
  allowedFileTypes?: string[];
}

const AddSourceFile: React.FC<AddSourceFileProps> = ({
  onFilesAdded,
  maxSizeMB = 20,
  allowedFileTypes = ['txt'],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return [];

      const validFiles: File[] = [];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      Array.from(fileList).forEach((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const isValidType = allowedFileTypes.includes(extension);
        const isValidSize = file.size <= maxSizeBytes;

        if (isValidType && isValidSize) {
          validFiles.push(file);
        }
      });

      return validFiles;
    },
    [allowedFileTypes, maxSizeMB]
  );

  const processFile = async (file: File) => {
    try {
      setFileError(null);
      setUploadedFile(file);
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

      // Only process txt files
      if (file.type === 'text/plain' || fileExtension === 'txt') {
        const text = await file.text();
        setFileContent(text);
      } else {
        throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to process file');
      setFileContent('');
    }
  };

  // Helper function to handle API responses
  const handleApiResponse = async (response: Response) => {
    let responseData;

    try {
      responseData = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error(
        `Server error: Could not parse response from server. Status: ${response.status} ${response.statusText}`
      );
    }

    if (!response.ok) {
      throw new Error(
        responseData.error || `Failed to extract content: ${response.statusText}`
      );
    }

    if (responseData.content) {
      // Check if we have a "no content" message
      if (
        responseData.content === 'No text content could be extracted from this PDF.' ||
        responseData.content.includes('No text content could be extracted')
      ) {
        throw new Error(
          'This PDF does not contain extractable text. It may contain only images or scanned content.'
        );
      }
      return responseData;
    } else {
      throw new Error('No content extracted from file');
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
        await processFile(validFiles[0]);
      } else if (e.dataTransfer.files.length > 0) {
        setFileError('Please upload a valid file type and size');
      }
    },
    [onFilesAdded, validateFiles]
  );

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const validFiles = validateFiles(e.target.files);
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
        await processFile(validFiles[0]);
      } else if (e.target.files && e.target.files.length > 0) {
        setFileError('Please upload a valid file type and size');
      }
      // Reset the input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesAdded, validateFiles]
  );

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className="w-full">
      <div
        ref={dropRef}
        className={`border-2 border-dashed rounded-md p-8 transition-colors flex flex-col items-center justify-center cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-900/10' : 'dark:border-blue-500'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <BsCloudUpload
          className="h-12 w-12 text-blue-500 mb-2"
          style={{ fontSize: '3rem' }}
        />
        <p className="text-white font-medium">Drag and Drop Here</p>
        <p className="text-gray-400 text-sm">Max Size: {maxSizeMB}MB</p>
        <p className="text-gray-400 text-sm mt-1">Only .txt files allowed</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept={allowedFileTypes.map((type) => `.${type}`).join(',')}
        onChange={handleFileInputChange}
      />

      {fileError && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
          {fileError}
        </div>
      )}

      {uploadedFile && (
        <>
          <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded-md">
            <p className="text-sm text-black font-medium">{uploadedFile.name}</p>
            <p className="text-xs text-gray-500 mb-2">
              {(uploadedFile.size / 1024).toFixed(2)} KB •{' '}
              {uploadedFile.type || 'Unknown type'}
            </p>
          </div>
          <SummarizeButton content={fileContent} type="file" isDisabled={!fileContent} />
        </>
      )}
    </div>
  );
};

export default AddSourceFile;
