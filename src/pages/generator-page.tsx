import React from 'react';
import { PromptGenerator } from '../components/prompt-generator';
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link as RouterLink } from 'react-router-dom';

export const GeneratorPage: React.FC = () => {
  return (
    <main className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center mb-6">
          <h1 className="text-4xl font-sora font-extrabold text-center" style={{ fontWeight: 800 }}>Generator Prompt JARVX</h1>
        </div>
        <p className="text-default-400 text-center mb-8 max-w-2xl mx-auto font-sora">
          Buat prompt yang canggih dan peka konteks.<br />
          Didukung teknologi AI mutakhir.
        </p>
        <PromptGenerator />
      </div>
    </main>
  );
};