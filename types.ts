
export interface BacklogItem {
  id: string;
  title: string;
  details: string;
}

export interface BlueprintSection {
  id: string;
  title: string;
  backlog: BacklogItem[];
}

export interface Blueprint {
  sections: BlueprintSection[];
}

export interface Doc {
  id: string;
  content: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  brainDump: string;
  quickNotes: { id: string; content: string }[];
  tags: string[];
  docs: Doc[];
  blueprint: Blueprint | null;
  createdAt: number;
}

export type GenerationState = 'idle' | 'sections' | 'titles' | 'details' | 'error' | 'done';

export interface SpotlightSuggestion {
  featureName: string;
  description: string;
}
