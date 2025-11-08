
import React from 'react';
import { Project } from '../types';
import { useStore } from '../store/useStore';
import { TrashIcon } from './icons/TrashIcon';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { setActiveProject, deleteProject } = useStore();

  const handleSelect = () => {
    setActiveProject(project.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      deleteProject(project.id);
    }
  };

  return (
    <div 
      className="bg-brand-secondary rounded-lg p-6 flex flex-col justify-between cursor-pointer
                 border border-transparent hover:border-brand-accent transition-all duration-300
                 transform hover:-translate-y-1 shadow-lg hover:shadow-brand-accent/20"
      onClick={handleSelect}
    >
      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-brand-text-primary mb-2 pr-2">{project.name}</h3>
            <button 
                onClick={handleDelete}
                className="text-brand-text-secondary hover:text-red-500 transition-colors p-1 rounded-full -mt-2 -mr-2"
                aria-label="Delete project"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
        <p className="text-sm text-brand-text-secondary mb-4 line-clamp-2">
            {project.brainDump || 'No description yet.'}
        </p>
      </div>
      <div className="flex flex-col items-start gap-3 mt-auto">
        <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map(tag => (
                <span key={tag} className="bg-brand-accent/20 text-brand-accent text-xs font-medium px-2 py-1 rounded-full">{tag}</span>
            ))}
        </div>
        <p className="text-xs text-brand-text-secondary/70">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
