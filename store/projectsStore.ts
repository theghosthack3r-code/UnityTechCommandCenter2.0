import { type Project, type ProjectOwnerDept, type ProjectStatus } from '../types';

const PROJECTS_STORAGE_KEY = 'command_center_projects';

type Subscriber = () => void;

class ProjectsStore {
  private subscribers: Set<Subscriber> = new Set();
  private projects: Project[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      this.projects = storedProjects ? JSON.parse(storedProjects) : [];
    } catch (e) {
      console.error('Failed to load projects from localStorage', e);
      this.projects = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(this.projects));
      this.notify();
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
    }
  }
  
  private notify() {
    this.subscribers.forEach(callback => callback());
  }
  
  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getAll(): Project[] {
    return [...this.projects];
  }

  getById(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  create(projectData: Omit<Project, 'id' | 'updatedAt'>) {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
      // Defaulting old fields for compatibility
      icon: 'folder-git-2',
      color: '#a855f7',
      kpis: { activeAgents: 0, pendingApprovals: 0, runsToday: 0, deliverySuccessPct: 100 } 
    };
    this.projects.push(newProject);
    this.save();
  }

  update(id: string, updates: Partial<Omit<Project, 'id'>>) {
    const projectIndex = this.projects.findIndex(p => p.id === id);
    if (projectIndex !== -1) {
      this.projects[projectIndex] = {
        ...this.projects[projectIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save();
    }
  }

  remove(id: string) {
    this.projects = this.projects.filter(p => p.id !== id);
    this.save();
  }
  
  private isValidProject(p: any): p is Omit<Project, 'id'> {
      return p && typeof p.name === 'string' &&
             typeof p.ownerDept === 'string' &&
             typeof p.status === 'string' &&
             typeof p.progress === 'number';
  }

  import(jsonString: string): { success: boolean, error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data) || !data.every(this.isValidProject)) {
          return { success: false, error: 'Invalid JSON schema. Must be an array of valid projects.' };
      }
      
      const importedProjects: Project[] = data.map((p: Omit<Project, 'id'>) => ({
        ...p,
        id: crypto.randomUUID(),
        updatedAt: p.updatedAt || new Date().toISOString(),
      }));

      this.projects = importedProjects;
      this.save();
      return { success: true };

    } catch (e) {
      return { success: false, error: 'Failed to parse JSON file.' };
    }
  }

  export(): string {
    // We strip out internal-only fields for a clean export
    const exportableProjects = this.projects.map(({ id, kpis, appearance, branding, ...rest }) => rest);
    return JSON.stringify(exportableProjects, null, 2);
  }
}

export const projectStore = new ProjectsStore();
