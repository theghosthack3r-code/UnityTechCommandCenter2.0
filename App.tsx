import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type Page, type Agent, type Approval, type ApprovalStatus, type Project, ProjectBranding, ProjectAppearance } from './types';
import { MOCK_APPROVALS } from './mock';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewScreen } from './components/DashboardScreen';
import { AgentsScreen, AgentDetailScreen } from './components/AgentsScreen';
import { ActivityScreen } from './components/WorkflowsScreen';
import { ContentGridScreen } from './components/NotificationsScreen';
import { AIAssistantScreen } from './components/AIAssistantScreen';
import { LogsScreen } from './components/LogsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { deepMerge } from './utils';

import { projectStore } from './store/projectsStore';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectCreateModal } from './components/ProjectCreateModal';
import { ProjectDeleteModal } from './components/ProjectDeleteModal';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('Overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>(MOCK_APPROVALS);
  
  // New Project Management State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewingProjectDetail, setViewingProjectDetail] = useState<Project | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);


  const [projectSettings, setProjectSettings] = useState<Record<string, { branding?: ProjectBranding, appearance?: ProjectAppearance }>>(() => {
    // This logic can remain to customize project appearance on top of store data
    try {
      const saved = localStorage.getItem('all_project_settings');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [isProjectSettingsModalOpen, setProjectSettingsModalOpen] = useState(false);
  
  const refreshProjects = useCallback(() => {
    const allProjects = projectStore.getAll();
    setProjects(allProjects);
    if (!selectedProjectId && allProjects.length > 0) {
      setSelectedProjectId(allProjects[0].id);
    } else if (allProjects.length === 0) {
      setSelectedProjectId(null);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    refreshProjects();
    const unsubscribe = projectStore.subscribe(refreshProjects);
    return () => unsubscribe();
  }, [refreshProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selected_project', selectedProjectId);
    } else {
      localStorage.removeItem('selected_project');
    }
  }, [selectedProjectId]);
  
  const computedProjects = useMemo(() => {
    return projects.map(p => {
        const settings = projectSettings[p.id] || {};
        return deepMerge({}, p, settings) as Project;
    });
  }, [projects, projectSettings]);
  
  const selectedProject = useMemo(() => {
    return computedProjects.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId, computedProjects]);

  const handleSaveProjectSettings = (updates: { branding?: ProjectBranding; appearance?: ProjectAppearance }) => {
    if (!selectedProjectId) return;
    const newSettings = { ...projectSettings };
    newSettings[selectedProjectId] = deepMerge({}, newSettings[selectedProjectId] || {}, updates);
    setProjectSettings(newSettings);
    localStorage.setItem(`all_project_settings`, JSON.stringify(newSettings));
  };

  const projectApprovals = approvals.filter(a => a.projectId === selectedProjectId);
  const pendingApprovalsCount = projectApprovals.filter(a => a.status === 'Pending').length;

  const handleApprovalAction = (id: string, newStatus: ApprovalStatus) => {
    setApprovals(currentApprovals =>
      currentApprovals.map(a => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };
  
  const handleProjectSelectForDetail = (project: Project) => {
    setViewingProjectDetail(project);
  }

  const handleBackToDashboard = () => {
    setViewingProjectDetail(null);
  }

  const handleCreateOrUpdateProject = (projectData: Omit<Project, 'id' | 'updatedAt'>, id?: string) => {
    if (id) {
      projectStore.update(id, projectData);
    } else {
      projectStore.create(projectData);
    }
    setProjectToEdit(null);
    setCreateModalOpen(false);
  }

  const handleDeleteProject = (id: string) => {
    projectStore.remove(id);
    if(selectedProjectId === id) {
      const remainingProjects = projectStore.getAll();
      setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
    }
    setProjectToDelete(null);
  }


  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    if (page !== 'Agents' || activeAgent) {
      setActiveAgent(null);
    }
  }, [page]);
  
  const renderPage = () => {
    if (viewingProjectDetail) {
      return <ProjectDetail project={viewingProjectDetail} onBack={handleBackToDashboard} />;
    }
    
    if (activeAgent) {
      return <AgentDetailScreen agent={activeAgent} onBack={() => setActiveAgent(null)} />;
    }

    switch (page) {
      case 'Overview':
        return <OverviewScreen projects={projects} approvals={projectApprovals} handleApprovalAction={handleApprovalAction} setPage={setPage} project={selectedProject} onOpenCreateProject={() => setCreateModalOpen(true)} />;
      case 'Agents':
        return <AgentsScreen setActiveAgent={setActiveAgent} selectedProjectId={selectedProjectId || ''} />;
      case 'AI Assistant':
        return <AIAssistantScreen />;
      case 'Power-ups':
      case 'Integrations':
        return <ContentGridScreen page={page} />;
      case 'Runs':
      case 'Approvals':
        return <ActivityScreen page={page} approvals={projectApprovals} handleApprovalAction={handleApprovalAction} selectedProjectId={selectedProjectId || ''} />;
      case 'Logs':
        return <LogsScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <OverviewScreen projects={projects} approvals={projectApprovals} handleApprovalAction={handleApprovalAction} setPage={setPage} project={selectedProject} onOpenCreateProject={() => setCreateModalOpen(true)}/>;
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans text-sm text-foreground">
      <Sidebar 
        currentPage={page} 
        setPage={setPage} 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        setActiveAgent={setActiveAgent}
        pendingApprovalsCount={pendingApprovalsCount}
        selectedProjectId={selectedProjectId || ''}
      />
      <div className="flex flex-1 flex-col">
        <Header 
          setSidebarOpen={setSidebarOpen} 
          pendingApprovalsCount={pendingApprovalsCount}
          project={selectedProject}
          projects={computedProjects}
          onProjectChange={setSelectedProjectId}
          onProjectSelectForDetail={handleProjectSelectForDetail}
          onOpenProjectSettings={() => setProjectSettingsModalOpen(true)}
          onOpenCreateProject={() => setCreateModalOpen(true)}
          onEditProject={setProjectToEdit}
          onDeleteProject={setProjectToDelete}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewingProjectDetail ? viewingProjectDetail.id : (activeAgent ? activeAgent.id : `${page}-${selectedProjectId}`)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
       {selectedProject && <ProjectSettingsModal
        isOpen={isProjectSettingsModalOpen}
        onClose={() => setProjectSettingsModalOpen(false)}
        project={selectedProject}
        onSave={handleSaveProjectSettings}
      />}
      <ProjectCreateModal 
        isOpen={isCreateModalOpen || !!projectToEdit}
        onClose={() => { setCreateModalOpen(false); setProjectToEdit(null); }}
        onSave={handleCreateOrUpdateProject}
        projectToEdit={projectToEdit}
      />
      <ProjectDeleteModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
        project={projectToDelete}
      />
    </div>
  );
};

export default App;
