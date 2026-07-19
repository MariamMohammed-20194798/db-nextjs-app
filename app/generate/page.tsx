'use client';
import React from 'react';
import HeaderSection from '../components/HeaderSection';
import { IoCreateOutline } from 'react-icons/io5';
import ContentGenerationForm from '../components/ContentGenerationForm';

export default function GeneratePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <HeaderSection
        inline
        title="Content Generator"
        desc="Create polished content based on your requirements with flexible tones, lengths, and prompts."
        icon={<IoCreateOutline className="h-7 w-7" />}
        key="generate-header"
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-900/80 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            What would you like to create?
          </h2>
          <ContentGenerationForm />
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/60">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Helpful prompts</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/70">
              Use a clear topic like “launch plan for a new product” to sharpen the response.
            </li>
            <li className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/70">
              Choose a tone that matches the audience, then add details for more precise output.
            </li>
            <li className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/70">
              Short revisions often create the strongest results for emails and social posts.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
