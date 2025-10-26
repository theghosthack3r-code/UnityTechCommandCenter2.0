import React from 'react';
import { Icon } from './icons';
import { ProjectSwitcher } from './ProjectSwitcher';
import { Project } from '../types';
import { ProjectManageMenu } from './ProjectManageMenu';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
  pendingApprovalsCount: number;
  project: Project | null;
  projects: Project[];
  onProjectChange: (id: string | null) => void;
  onProjectSelectForDetail: (project: Project) => void;
  onOpenProjectSettings: () => void;
  onOpenCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    setSidebarOpen, 
    pendingApprovalsCount, 
    project, 
    projects, 
    onProjectChange, 
    onProjectSelectForDetail,
    onOpenProjectSettings,
    onOpenCreateProject,
    onEditProject,
    onDeleteProject
}) => {
  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 md:px-6 backdrop-blur-sm">
      <div className="flex items-center space-x-2 md:space-x-4">
        <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Open sidebar"
        >
            <Icon name="panel-left" className="h-5 w-5" />
        </button>
        <div className="relative hidden md:block">
            <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search agents, runs..." className="w-64 rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        
        <div className="flex items-center rounded-lg border border-input bg-background/50 transition-colors focus-within:ring-1 focus-within:ring-ring">
          <ProjectSwitcher 
            value={project?.id || null} 
            onChange={onProjectChange} 
            onOpenDetail={onProjectSelectForDetail}
            projects={projects} 
          />
          {project && (
            <ProjectManageMenu 
                project={project}
                onEdit={() => onEditProject(project)}
                onDelete={() => onDeleteProject(project)}
            />
          )}
          <div className="h-4 w-px bg-border self-center"></div>
          <button onClick={onOpenCreateProject} className="px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Create New Project">
              <Icon name="plus" className="h-4 w-4" />
          </button>
           <div className="h-4 w-px bg-border self-center"></div>
          <button onClick={onOpenProjectSettings} disabled={!project} className="px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Project Settings">
              <Icon name="sliders-horizontal" className="h-4 w-4" />
          </button>
        </div>

      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="flex items-center space-x-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
            <span>System Online</span>
        </div>
        {pendingApprovalsCount > 0 && (
          <div className="flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
              <Icon name="shield-check" className="h-3 w-3" />
              <span>{pendingApprovalsCount} Approvals Pending</span>
          </div>
        )}
         <div className="h-6 w-px bg-border"></div>
         <div className="relative">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-muted" aria-label="User profile">
             <span className="font-semibold text-sm">A</span>
          </button>
        </div>
      </div>
    </header>
  );
};
