
import React, { useState } from 'react';
import { Blueprint } from '../types';

interface BlueprintDisplayProps {
  blueprint: Blueprint | null;
}

export const BlueprintDisplay: React.FC<BlueprintDisplayProps> = ({ blueprint }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };
  
  if (!blueprint) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-brand-secondary rounded-lg text-brand-text-secondary">
        <p>Your generated blueprint will appear here.</p>
        <p className="text-sm">Fill out the brain dump, add docs, and click "Generate Blueprint".</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blueprint.sections.map((section, index) => {
        const isOpen = openSections[section.id] ?? true;
        return (
          <div key={section.id} className="bg-brand-secondary rounded-lg overflow-hidden">
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full flex justify-between items-center p-4 bg-brand-secondary/50 hover:bg-brand-secondary transition-colors"
            >
              <h3 className="text-lg font-bold text-brand-text-primary">{index + 1}. {section.title}</h3>
               <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {isOpen && (
              <div className="p-4 md:p-6 space-y-4">
                {section.backlog.length > 0 ? (
                  section.backlog.map(item => (
                    <div key={item.id} className="bg-brand-primary/50 p-4 rounded">
                      <h4 className="font-semibold text-brand-text-primary">{item.title || 'Title generation in progress...'}</h4>
                      <p className="text-sm text-brand-text-secondary mt-1 whitespace-pre-wrap">
                        {item.details || 'Details generation in progress...'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-brand-text-secondary">Backlog generation in progress...</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
