import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import {
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoStatsChartOutline,
} from 'react-icons/io5';
import { motion } from 'framer-motion';

interface VersionDocument {
  id: string;
  title: string;
  content: string;
  date: string;
  wordCount: number;
  trashedAt?: number;
}

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: VersionDocument | null;
  onDownload: (document: VersionDocument) => void;
  onDelete: (id: string) => void;
}

const VersionModal: React.FC<VersionModalProps> = ({
  isOpen,
  onClose,
  document,
  onDownload,
  onDelete,
}) => {
  if (!document) return null;

  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        backdrop: 'bg-black/50 backdrop-blur-sm',
        base: 'border-gray-700 dark:border-gray-800 max-w-3xl rounded-lg',
        header: 'border-b border-gray-200 dark:border-gray-700 p-6',
        body: 'p-6',
        footer: 'border-t border-gray-200 dark:border-gray-700 p-4',
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn',
            },
          },
        },
        initial: { y: -20, opacity: 0 },
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col">
          <div className="flex items-center gap-2 text-gray-400 mt-5 ml-1">
            <IoCalendarOutline className="w-4 h-4" />
            <span className="text-xs">{document.date}</span>
          </div>
          <div className="text-xl font-semibold flex items-center gap-2 mt-2">
            <IoDocumentTextOutline className="w-5 h-5 text-blue-500" />
            {document.title}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="max-h-[100vh] overflow-y-auto">
            <div className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200 leading-relaxed">
              {document.content}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
            <IoStatsChartOutline className="w-4 h-4" />
            <span>
              Word count: <strong>{document.wordCount}</strong>
            </span>
          </div>
        </ModalBody>
        <ModalFooter className="flex mb-7">
          <Button
            color="danger"
            variant="light"
            onClick={() => onDelete(document.id)}
            className="font-medium text-blue-500 rounded-md bg-transparent border dark:border-blue-500 hover:scale-95 transition-all duration-300"
            startContent={<span className="i-lucide-trash-2 w-4 h-4" />}
          >
            Delete
          </Button>
          <Button
            color="primary"
            onClick={() => onDownload(document)}
            className="font-medium text-blue-500 rounded-md bg-transparent border dark:border-blue-500 hover:scale-95 transition-all duration-300"
            startContent={<span className="i-lucide-download w-4 h-4" />}
          >
            Download
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VersionModal;
