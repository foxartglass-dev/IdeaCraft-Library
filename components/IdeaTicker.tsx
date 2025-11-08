
import React from 'react';
import { useStore } from '../store/useStore';

export const IdeaTicker: React.FC = () => {
  const projects = useStore((state) => state.projects);

  if (projects.length === 0) {
    return null;
  }

  const tickerContent = projects.map(p => p.name).join('  //  ');

  return (
    <div className="bg-brand-secondary/50 backdrop-blur-sm fixed top-0 left-0 right-0 h-8 z-50 overflow-hidden border-b border-brand-accent/20">
      <div className="absolute top-0 left-0 h-full flex items-center whitespace-nowrap animate-ticker">
        <span className="text-brand-text-secondary font-mono text-sm px-8">{tickerContent}</span>
        <span className="text-brand-text-secondary font-mono text-sm px-8">{tickerContent}</span>
      </div>
    </div>
  );
};
