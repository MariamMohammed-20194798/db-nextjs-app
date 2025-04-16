'use client';
import React from 'react';
import HeaderSection from '../components/HeaderSection';
import { IoDocumentText } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { CgWebsite } from 'react-icons/cg';
import { FaFilePdf } from 'react-icons/fa';
import { BsFileEarmarkText } from 'react-icons/bs';
import AddSourceTextDoc from '../components/AddSourceTextDoc';
import AddSourceFile from '../components/AddSourceFile';
import AddSourceUrl from '../components/AddSourceUrl';
import { IoMdChatbubbles } from 'react-icons/io';
import Link from 'next/link';

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
    <>
      <div className="max-w-5xl mx-auto">
        <motion.div
          key="header-upload-vf-doc"
          layout
          className="flex-shrink-0 w-full flex justify-between gap-10 "
        >
          <HeaderSection
            inline
            className={'mb-5'}
            title="Summarize"
            desc={`Generate concise summaries of your text.`}
            icon={<IoDocumentText className="w-10 h-10" />}
            key={'summarize-header'}
          />
        </motion.div>
        <motion.div
          layout
          key={`add-vf-doc-controls`}
          className="flex-shrink-0 flex gap-6 mb-4"
        >
          {sources.map((source, index) => (
            <button
              className={`flex gap-2 justify-center items-center px-2 py-1 rounded-md dark:bg-transparent transition-colors border ${
                selectedSourceIndex === index
                  ? 'text-blue-500 border-blue-500'
                  : 'dark:bg-gray-700 border-gray-600 hover:text-gray-400'
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
                <AddSourceFile onFilesAdded={() => {}} />
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
                <AddSourceUrl />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="mt-150 p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
          <IoMdChatbubbles className="w-6 h-6 text-blue-500 dark:text-blue-300" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-blue-700 dark:text-blue-300">
            New Feature: AI Chatbot
          </h3>
          <p className="text-blue-600 dark:text-blue-400 text-sm">
            After summarizing your content, use our new AI chatbot to ask questions about
            it. Get specific information without reading the entire document!
          </p>
        </div>
        <Link
          href="/chatbot"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md whitespace-nowrap"
        >
          Try Chatbot
        </Link>
      </div>
    </>
  );
}
