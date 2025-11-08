
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Project, SpotlightSuggestion } from '../types';
import { ProjectCard } from './ProjectCard';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface LivingLibraryProps {
  isWaitingMode?: boolean;
}

const SpotlightCard: React.FC<{ project: Project }> = ({ project }) => {
  const { spotlightSuggestions, fetchSpotlightSuggestions } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const { setActiveProject } = useStore();

  useEffect(() => {
    const loadSuggestions = async () => {
      setIsLoading(true);
      await fetchSpotlightSuggestions(project.brainDump);
      setIsLoading(false);
    }
    if (project.brainDump) {
      loadSuggestions();
    }
  }, [project, fetchSpotlightSuggestions]);

  return (
    <div className="bg-brand-secondary/80 backdrop-blur-md rounded-xl p-6 border border-brand-accent shadow-2xl shadow-brand-accent/20 w-full max-w-2xl mx-auto">
      <p className="text-sm text-brand-accent font-semibold mb-2 text-center">PRODUCTIVE WAITING</p>
      <h3 className="text-2xl font-bold text-center mb-1">{project.name}</h3>
      <p className="text-brand-text-secondary text-center mb-6">Remember this idea? Here are some fresh thoughts on it.</p>
      
      <div className="space-y-4">
        {isLoading && <p className="text-center text-brand-text-secondary">Generating fresh ideas...</p>}
        {spotlightSuggestions.map((suggestion, index) => (
          <div key={index} className="bg-brand-primary/50 p-4 rounded-lg">
            <h4 className="font-semibold text-brand-text-primary flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-brand-accent"/>{suggestion.featureName}</h4>
            <p className="text-sm text-brand-text-secondary mt-1">{suggestion.description}</p>
          </div>
        ))}
         {!isLoading && spotlightSuggestions.length === 0 && project.brainDump && <p className="text-center text-brand-text-secondary">Couldn't generate suggestions. Try adding more to the brain dump.</p>}
         {!project.brainDump && <p className="text-center text-brand-text-secondary">Add a brain dump to this project to get AI suggestions.</p>}
      </div>
       <button 
        onClick={() => setActiveProject(project.id)}
        className="mt-6 w-full bg-brand-secondary hover:bg-brand-primary/50 text-brand-text-primary font-semibold py-2 px-4 rounded-lg transition-colors border border-brand-text-secondary/20"
      >
        Explore This Idea
      </button>
    </div>
  );
};


export const LivingLibrary: React.FC<LivingLibraryProps> = ({ isWaitingMode = false }) => {
  const { projects, addProject, setActiveProject, spotlightedProjectId, setSpotlightedProject } = useStore();
  const [newProjectName, setNewProjectName] = useState('');

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => b.createdAt - a.createdAt);
  }, [projects]);
  
  const spotlightedProject = useMemo(() => {
    return projects.find(p => p.id === spotlightedProjectId)
  }, [projects, spotlightedProjectId]);

  useEffect(() => {
    if (isWaitingMode && projects.length > 0 && !spotlightedProjectId) {
      const randomIndex = Math.floor(Math.random() * projects.length);
      setSpotlightedProject(projects[randomIndex].id);
    } else if (!isWaitingMode) {
      setSpotlightedProject(null);
    }
  }, [isWaitingMode, projects, spotlightedProjectId, setSpotlightedProject]);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const newId = addProject(newProjectName.trim());
      setActiveProject(newId);
      setNewProjectName('');
    }
  };

  if (isWaitingMode) {
    return (
      <div className="fixed inset-0 bg-brand-primary/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        {spotlightedProject ? <SpotlightCard project={spotlightedProject} /> : 
        <div className="text-center">
            <h2 className="text-2xl font-bold">Generating Blueprint...</h2>
            <p className="text-brand-text-secondary">Please wait while our AI forges your idea.</p>
        </div>
        }
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-brand-text-primary tracking-tight">IdeaCraft Library</h1>
          <p className="mt-2 text-lg text-brand-text-secondary">Your living ecosystem for ideas. No brilliant spark is ever lost.</p>
        </header>
        
        <form onSubmit={handleAddProject} className="mb-8 flex gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Spark a new idea..."
            className="flex-grow bg-brand-secondary border-2 border-brand-secondary focus:border-brand-accent focus:ring-0 outline-none rounded-lg px-4 py-2 text-brand-text-primary"
          />
          <button
            type="submit"
            className="bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            disabled={!newProjectName.trim()}
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create</span>
          </button>
        </form>
        
        {sortedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed border-brand-secondary rounded-lg">
                <SparklesIcon className="w-12 h-12 mx-auto text-brand-text-secondary" />
                <h3 className="mt-4 text-xl font-semibold text-brand-text-primary">Your library is empty</h3>
                <p className="mt-1 text-brand-text-secondary">Start by creating your first project above.</p>
            </div>
        )}
      </div>
    </div>
  );
};
