'use client';
import React from 'react';
import HeaderSection from '../components/HeaderSection';
import { IoCreateOutline } from 'react-icons/io5';
import ContentGenerationForm from '../components/ContentGenerationForm';

export default function GeneratePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex-shrink-0 w-full flex justify-between gap-10 mb-6">
        <HeaderSection
          inline
          title="Content Generator"
          desc="Create professional content based on your requirements."
          icon={<IoCreateOutline className="w-10 h-10" />}
          key={'generate-header'}
        />
      </div>

      <div className="rounded-lg">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
          What would you like to create?
        </h2>
        <ContentGenerationForm />
      </div>
    </div>
  );
}
