'use client';
import React from 'react';
import Image from 'next/image';
import UploadFile from './components/UploadFile';
import HeaderSection from './components/HeaderSection';
import { IoDocumentText } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { CgClose, CgWebsite } from 'react-icons/cg';
import { FaFilePdf, FaQuestion } from 'react-icons/fa';
import { BsFileEarmarkText } from 'react-icons/bs';
import AddSourceTextDoc from './components/AddSourceTextDoc';
// Removed the import for Button from '@nextui-org/react' due to the error
export default function Home() {
  const sources = [
    {
      label: 'Text',
      icon: <BsFileEarmarkText className="w-4 h-4" />,
      description:
        "Our systems will scrape the URLs you provide and automatically add them to the agent's knowledge base.",
    },
    {
      label: 'File',
      icon: <FaFilePdf className="w-4 h-4" />,
      description:
        "Our systems will scrape the URLs you provide and automatically add them to the agent's knowledge base.",
    },
    {
      label: 'URL',
      icon: <CgWebsite className="w-4 h-4" />,
      description:
        "Our systems will scrape the URLs you provide and automatically add them to the agent's knowledge base.",
    },
  ];

  const [selectedSourceIndex, setSourceIndex] = React.useState(0);
  return (
    <div>
      <motion.div
        key="header-upload-vf-doc"
        layout
        className="flex-shrink-0 w-full flex justify-between gap-10 "
      >
        <HeaderSection
          inline
          className={'mb-5'}
          title="Add a data source"
          desc={`Select a data type to add and our systems will magically handle the rest.`}
          icon={<IoDocumentText className="w-10 h-10" />}
          key={'kb-header'}
        />
      </motion.div>
      <motion.div
        layout
        key={`add-vf-doc-controls`}
        className="flex-shrink-0 flex gap-6 mb-4"
      >
        {sources.map((source, index) => (
          <button
            className={`flex gap-2 justify-center items-center px-2 py-1 rounded-md transition-colors ${
              selectedSourceIndex === index
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            key={`kb_add_source_index_${index}`}
            onClick={() => setSourceIndex(index)}
          >
            {source.icon}
            {source.label}
          </button>
        ))}
      </motion.div>

      <motion.div key={'thing-vf-body-upload'} className="relative w-full h-full">
        <AnimatePresence>
          {selectedSourceIndex === 0 && (
            <motion.div
              className="absolute left-0 top-0 w-full h-full bg-blue-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={`vf-add-doc-tags-${selectedSourceIndex}`}
            >
              <AddSourceTextDoc />
            </motion.div>
          )}

          {selectedSourceIndex === 1 && (
            <motion.div
              className="absolute left-0 top-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={`vf-add-doc-body-${selectedSourceIndex}`}
            >
              <UploadFile />
            </motion.div>
          )}
          {selectedSourceIndex === 2 && (
            <motion.div
              className="absolute left-0 top-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={`vf-add-doc-body-${selectedSourceIndex}`}
            >
              <UploadFile />
            </motion.div>
          )}

          {selectedSourceIndex === 3 ? (
            <motion.div
              className="absolute left-0 top-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={`vf-add-doc-body-${selectedSourceIndex}`}
            >
              <UploadFile />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
