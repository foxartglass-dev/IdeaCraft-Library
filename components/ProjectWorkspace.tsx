
import React, { useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocsHub } from './DocsHub';
import { BlueprintDisplay } from './BlueprintDisplay';
import * as geminiService from '../services/geminiService';
import { Project, BacklogItem, BlueprintSection } from '../types';

const GenerationStatus: React.FC = () => {
    const generationState = useStore(state => state.generationState);
    const messages: Record<string, string> = {
        sections: 'Stage 1/3: Generating high-level sections...',
        titles: 'Stage 2/3: Generating backlog titles...',
        details: 'Stage 3/3: Generating detailed descriptions...',
        done: 'Blueprint generation complete!',
        error: 'An error occurred during generation.',
    };

    if (generationState === 'idle') return null;

    const message = messages[generationState] || '';
    const isWorking = ['sections', 'titles', 'details'].includes(generationState);

    return (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${generationState === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-brand-accent/20 text-brand-accent'}`}>
            {isWorking && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-accent"></div>}
            <p className="font-semibold">{message}</p>
        </div>
    );
};


export const ProjectWorkspace: React.FC = () => {
  const { 
    activeProjectId, 
    setActiveProject, 
    getActiveProject, 
    updateBrainDump,
    setGenerationState,
    setBlueprintSections,
    setBacklogTitles,
    setBacklogDetails,
  } = useStore();
  const project = getActiveProject();
  const generationState = useStore(state => state.generationState);

  // Reset generation state when component unmounts or project changes
  useEffect(() => {
    return () => {
      setGenerationState('idle');
    }
  }, [activeProjectId, setGenerationState]);

  const handleGenerate = useCallback(async () => {
    if (!project || !project.brainDump) {
        alert("Please provide a brain dump before generating.");
        return;
    }

    try {
        setGenerationState('sections');
        const sectionTitles = await geminiService.generateSections(project.brainDump, project.docs);
        const sectionsWithIds = sectionTitles.map(title => ({ id: crypto.randomUUID(), title }));
        setBlueprintSections(project.id, sectionsWithIds);

        setGenerationState('titles');
        const titlesBySection = await geminiService.generateBacklogTitles(project.brainDump, project.docs, sectionTitles);
        for (const section of sectionsWithIds) {
            const titles = titlesBySection[section.title] || [];
            const backlogItems: BacklogItem[] = titles.map(title => ({ id: crypto.randomUUID(), title, details: '' }));
            setBacklogTitles(project.id, section.id, backlogItems);
        }

        setGenerationState('details');
        const currentProjectState = useStore.getState().projects.find(p => p.id === project.id);
        if (currentProjectState?.blueprint) {
            for (const section of currentProjectState.blueprint.sections) {
                const detailsMap = await geminiService.generateBacklogDetails(project.brainDump, project.docs, section);
                const detailsList = section.backlog.map(b => ({
                    backlogId: b.id,
                    detail: detailsMap[b.title] || 'Could not generate details for this item.'
                }));
                setBacklogDetails(project.id, section.id, detailsList);
            }
        }
        
        setGenerationState('done');
    } catch (error) {
        console.error("Blueprint generation failed:", error);
        setGenerationState('error');
    }
  }, [project, setGenerationState, setBlueprintSections, setBacklogTitles, setBacklogDetails]);


  if (!project) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Select a project from the library to begin.</p>
        </div>
    );
  }

  const isGenerating = ['sections', 'titles', 'details'].includes(generationState);

  return (
    <div className="min-h-screen pt-16 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
            <button
            onClick={() => setActiveProject(null)}
            className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-text-primary mb-6 transition-colors"
            >
                <ChevronLeftIcon className="w-5 h-5" />
                Back to Library
            </button>

            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-brand-text-primary tracking-tight">{project.name}</h1>
                <p className="mt-2 text-lg text-brand-text-secondary">This is your canvas. Dump your thoughts, add context, and forge your idea.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-2">Brain Dump</h2>
                        <textarea
                            value={project.brainDump}
                            onChange={(e) => updateBrainDump(project.id, e.target.value)}
                            placeholder="Pour your raw, chaotic inspiration here..."
                            className="w-full h-64 bg-brand-secondary border-2 border-brand-secondary focus:border-brand-accent focus:ring-0 outline-none rounded-lg p-4 text-brand-text-primary resize-y"
                        />
                    </div>
                    <DocsHub projectId={project.id} docs={project.docs} />
                     <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !project.brainDump}
                        className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        <SparklesIcon className="w-6 h-6" />
                        <span>{isGenerating ? 'Forging Idea...' : 'Generate Blueprint'}</span>
                    </button>
                    <GenerationStatus />
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-2">Generated Blueprint</h2>
                    <BlueprintDisplay blueprint={project.blueprint} />
                </div>
            </div>
        </div>
    </div>
  );
};
