
import React from 'react';
import { useStore } from './store/useStore';
import { LivingLibrary } from './components/LivingLibrary';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { IdeaTicker } from './components/IdeaTicker';

function App() {
  const activeProjectId = useStore((state) => state.activeProjectId);
  const generationState = useStore((state) => state.generationState);
  
  const isGenerating = ['sections', 'titles', 'details'].includes(generationState);

  return (
    <div className="bg-brand-primary min-h-screen font-sans">
      <IdeaTicker />
      <main>
        {activeProjectId ? <ProjectWorkspace /> : <LivingLibrary />}
      </main>
      {isGenerating && <LivingLibrary isWaitingMode={true} />}
    </div>
  );
}

export default App;
