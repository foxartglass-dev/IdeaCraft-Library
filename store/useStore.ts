
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Project, GenerationState, BlueprintSection, Doc, SpotlightSuggestion } from '../types';

interface IdeaCraftState {
  projects: Project[];
  activeProjectId: string | null;
  generationState: GenerationState;
  spotlightedProjectId: string | null;
  spotlightSuggestions: SpotlightSuggestion[];
  setSpotlightedProject: (projectId: string | null) => void;
  fetchSpotlightSuggestions: (brainDump: string) => Promise<void>;
  addProject: (name: string) => string;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  updateBrainDump: (projectId: string, content: string) => void;
  addDoc: (projectId: string, name: string, content: string) => void;
  updateDoc: (projectId: string, docId: string, content: string) => void;
  deleteDoc: (projectId: string, docId: string) => void;
  setGenerationState: (state: GenerationState) => void;
  addQuickNote: (projectId: string, content: string) => void;
  deleteQuickNote: (projectId: string, noteId: string) => void;
  addTag: (projectId: string, tag: string) => void;
  removeTag: (projectId: string, tag: string) => void;
  setBlueprintSections: (projectId: string, sections: { id: string, title: string }[]) => void;
  setBacklogTitles: (projectId: string, sectionId: string, backlog: { id: string, title: string, details: string }[]) => void;
  setBacklogDetails: (projectId: string, sectionId: string, details: { backlogId: string, detail: string }[]) => void;
  getActiveProject: () => Project | undefined;
}

export const useStore = create<IdeaCraftState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      generationState: 'idle',
      spotlightedProjectId: null,
      spotlightSuggestions: [],

      setSpotlightedProject: (projectId) => set({ spotlightedProjectId: projectId, spotlightSuggestions: [] }),
      
      fetchSpotlightSuggestions: async (brainDump) => {
        const { generateFeatureSuggestions } = await import('../services/geminiService');
        const suggestions = await generateFeatureSuggestions(brainDump);
        set({ spotlightSuggestions: suggestions });
      },
      
      addProject: (name) => {
        const newProject: Project = {
          id: crypto.randomUUID(),
          name,
          brainDump: '',
          quickNotes: [],
          tags: [],
          docs: [],
          blueprint: null,
          createdAt: Date.now(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return newProject.id;
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        }));
      },
      
      setActiveProject: (id) => set({ activeProjectId: id }),
      
      updateBrainDump: (projectId, content) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, brainDump: content } : p
          ),
        }));
      },

      addDoc: (projectId, name, content) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, docs: [...p.docs, { id: crypto.randomUUID(), name, content }] } : p
          ),
        }));
      },
      
      updateDoc: (projectId, docId, content) => {
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId ? { ...p, docs: p.docs.map(d => d.id === docId ? {...d, content} : d) } : p
          )
        }))
      },

      deleteDoc: (projectId, docId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, docs: p.docs.filter((d) => d.id !== docId) } : p
          ),
        }));
      },

      setGenerationState: (state) => set({ generationState: state }),

      addQuickNote: (projectId, content) => {
        set(state => ({
            projects: state.projects.map(p => 
                p.id === projectId 
                ? { ...p, quickNotes: [...p.quickNotes, { id: crypto.randomUUID(), content }] }
                : p
            )
        }));
      },

      deleteQuickNote: (projectId, noteId) => {
        set(state => ({
            projects: state.projects.map(p =>
                p.id === projectId
                ? { ...p, quickNotes: p.quickNotes.filter(note => note.id !== noteId) }
                : p
            )
        }));
      },

      addTag: (projectId, tag) => {
        set(state => ({
            projects: state.projects.map(p =>
                p.id === projectId && !p.tags.includes(tag.trim())
                ? { ...p, tags: [...p.tags, tag.trim()] }
                : p
            )
        }));
      },

      removeTag: (projectId, tag) => {
        set(state => ({
            projects: state.projects.map(p =>
                p.id === projectId
                ? { ...p, tags: p.tags.filter(t => t !== tag) }
                : p
            )
        }));
      },

      setBlueprintSections: (projectId, sections) => {
        const newBlueprintSections: BlueprintSection[] = sections.map(s => ({ ...s, backlog: [] }));
        set(state => ({
          projects: state.projects.map(p =>
            p.id === projectId ? { ...p, blueprint: { sections: newBlueprintSections } } : p
          )
        }));
      },
      
      setBacklogTitles: (projectId, sectionId, backlog) => {
        set(state => ({
          projects: state.projects.map(p => {
            if (p.id === projectId && p.blueprint) {
              const newSections = p.blueprint.sections.map(s =>
                s.id === sectionId ? { ...s, backlog } : s
              );
              return { ...p, blueprint: { ...p.blueprint, sections: newSections } };
            }
            return p;
          })
        }));
      },

      setBacklogDetails: (projectId, sectionId, details) => {
         set(state => ({
          projects: state.projects.map(p => {
            if (p.id === projectId && p.blueprint) {
              const newSections = p.blueprint.sections.map(s => {
                if (s.id === sectionId) {
                  const newBacklog = s.backlog.map(b => {
                    const detailItem = details.find(d => d.backlogId === b.id);
                    return detailItem ? { ...b, details: detailItem.detail } : b;
                  });
                  return { ...s, backlog: newBacklog };
                }
                return s;
              });
              return { ...p, blueprint: { ...p.blueprint, sections: newSections } };
            }
            return p;
          })
        }));
      },
      
      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        return projects.find(p => p.id === activeProjectId);
      }
    }),
    {
      name: 'ideacraft-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
