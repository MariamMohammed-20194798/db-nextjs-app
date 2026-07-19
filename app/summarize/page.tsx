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

export default function Home() {
  const sources = [
    {
      label: 'Text',
      icon: <BsFileEarmarkText className="h-4 w-4" />,
      description: 'Drop in a paragraph or article to create a focused summary.',
    },
    {
      label: 'File',
      icon: <FaFilePdf className="h-4 w-4" />,
      description: 'Upload a text file and generate a concise summary instantly.',
    },
    {
      label: 'URL',
      icon: <CgWebsite className="h-4 w-4" />,
      description: 'Share a URL and turn it into a readable summary for quick review.',
    },
  ];

  const [selectedSourceIndex, setSourceIndex] = React.useState(0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <HeaderSection
        inline
        className="mb-2"
        title="Summarize"
        desc="Turn raw content into concise summaries from text, files, or URLs."
        icon={<IoDocumentText className="h-7 w-7" />}
        key="summarize-header"
      />

      <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-900/80 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {sources.map((source, index) => (
            <button
              className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-all ${
                selectedSourceIndex === index
                  ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-500/10 dark:text-sky-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white'
              }`}
              key={`kb_add_source_index_${index}`}
              onClick={() => setSourceIndex(index)}
            >
              {source.icon}
              {source.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-[20px] border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40 sm:p-4">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {sources[selectedSourceIndex].description}
          </p>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {selectedSourceIndex === 0 && (
              <motion.div
                key="text-source"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <AddSourceTextDoc />
              </motion.div>
            )}

            {selectedSourceIndex === 1 && (
              <motion.div
                key="file-source"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <AddSourceFile onFilesAdded={() => {}} />
              </motion.div>
            )}

            {selectedSourceIndex === 2 && (
              <motion.div
                key="url-source"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <AddSourceUrl />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
