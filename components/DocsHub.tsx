
import React, { useState } from 'react';
import { Doc } from '../types';
import { useStore } from '../store/useStore';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FileTextIcon } from './icons/FileTextIcon';

interface DocsHubProps {
  projectId: string;
  docs: Doc[];
}

export const DocsHub: React.FC<DocsHubProps> = ({ projectId, docs }) => {
  const { addDoc, deleteDoc, updateDoc } = useStore();
  const [newDocName, setNewDocName] = useState('');

  const handleAddDoc = () => {
    if (newDocName.trim()) {
      addDoc(projectId, newDocName.trim(), `// Paste content for ${newDocName.trim()} here`);
      setNewDocName('');
    }
  };

  return (
    <div className="bg-brand-secondary rounded-lg p-4">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <FileTextIcon className="w-6 h-6" />
        Docs Hub (Context)
      </h3>
      <div className="space-y-4">
        {docs.map(doc => (
          <div key={doc.id} className="bg-brand-primary/50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="font-mono text-sm text-brand-text-primary">{doc.name}</p>
              <button 
                onClick={() => deleteDoc(projectId, doc.id)}
                className="text-brand-text-secondary hover:text-red-500 transition-colors"
                aria-label="Delete doc"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={doc.content}
              onChange={(e) => updateDoc(projectId, doc.id, e.target.value)}
              placeholder="Paste documentation or context here..."
              className="w-full h-32 bg-brand-primary/50 border border-brand-secondary focus:border-brand-accent focus:ring-0 outline-none rounded-md p-2 text-sm font-mono text-brand-text-secondary resize-y"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newDocName}
          onChange={(e) => setNewDocName(e.target.value)}
          placeholder="New doc name (e.g., API.md)"
          className="flex-grow bg-brand-primary border-2 border-brand-primary focus:border-brand-accent focus:ring-0 outline-none rounded-lg px-3 py-1.5 text-sm"
        />
        <button
          onClick={handleAddDoc}
          className="bg-brand-accent/50 hover:bg-brand-accent/70 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          disabled={!newDocName.trim()}
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};
