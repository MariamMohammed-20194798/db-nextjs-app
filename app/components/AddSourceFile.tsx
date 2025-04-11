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
  allowedFileTypes = ['txt', 'pdf', 'docx', 'doc', 'csv', 'xlsx'],
}) => {
  const [description, setDescription] = useState('');
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

      // For text files, read content directly
      if (file.type === 'text/plain' || fileExtension === 'txt') {
        console.log('Processing text file');
        const text = await file.text();
        setFileContent(text);
      }
      // For CSV files, read as text
      else if (fileExtension === 'csv') {
        console.log('Processing CSV file');
        const text = await file.text();
        setFileContent(text);
      }
      // For PDF, DOCX, and other files, we need to send the file to be processed server-side
      else {
        console.log(`Processing ${fileExtension} file`);
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('/api/extract-content', {
            method: 'POST',
            body: formData,
          });

          let errorData;
          let responseData;

          // Safe response parsing
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
              responseData.content ===
                'No text content could be extracted from this PDF.' ||
              responseData.content.includes('No text content could be extracted')
            ) {
              throw new Error(
                'This PDF does not contain extractable text. It may contain only images or scanned content.'
              );
            }
            setFileContent(responseData.content);
          } else {
            throw new Error('No content extracted from file');
          }
        } catch (extractError) {
          console.error('Error extracting file content:', extractError);
          setFileError(
            extractError instanceof Error
              ? extractError.message
              : 'Failed to extract file content'
          );
          setFileContent(`Unable to extract content from: ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to process file');
      setFileContent('');
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
          isDragging ? 'border-blue-500 bg-blue-900/10' : 'dark:border-pink-800'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <BsCloudUpload
          className="h-12 w-12 text-white mb-2"
          style={{ fontSize: '3rem' }}
        />
        <p className="text-white font-medium">Drag and Drop Here</p>
        <p className="text-gray-400 text-sm">Max Size: {maxSizeMB}MB</p>
        <p className="text-gray-400 text-sm mt-1">
          Only {allowedFileTypes.join(', ')} Files
        </p>
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
