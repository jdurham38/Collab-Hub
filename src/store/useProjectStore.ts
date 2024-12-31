

import { create } from 'zustand';

interface ProjectState {
  title: string;
  description: string;
  tags: string[];
  roles: string[];
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setTags: (tags: string[] | ((prevTags: string[]) => string[])) => void;
  setRoles: (roles: string[] | ((prevRoles: string[]) => string[])) => void;
  resetProject: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  title: '',
  description: '',
  tags: [],
  roles: [],
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setTags: (tags) =>
    set((state) => ({
      tags: typeof tags === 'function' ? tags(state.tags) : tags,
    })),
  setRoles: (roles) =>
    set((state) => ({
      roles: typeof roles === 'function' ? roles(state.roles) : roles,
    })),
  resetProject: () => set({ title: '', description: '', tags: [], roles: [] }),
}));
