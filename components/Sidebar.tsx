import React, { useState, useEffect } from 'react';
import { type Page, type Agent, type Department } from '../types';
import { MOCK_AGENTS } from '../mock';
import { Icon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

const StatusDot: React.FC<{ status: Agent['status'] }> = ({ status }) => {
    const colorMap = {
        Online: 'bg-green-400',
        Warn: 'bg-amber-400',
        Offline: 'bg-rose-500',
        Unknown: 'bg-slate-500',
    };
    return <div className={`h-2 w-2 rounded-full ${colorMap[status]}`}></div>;
};

const NavItem: React.FC<{
    pageName: Page;
    icon: React.ComponentProps<typeof Icon>['name'];
    currentPage: Page;
    onClick: () => void;
    badgeCount?: number;
}> = ({ pageName, icon, currentPage, onClick, badgeCount }) => {
    const isActive = currentPage === pageName;
    return (
        <button
            onClick={onClick}
            className={`group relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${ isActive ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground' }`}
        >
            {isActive && <div className="absolute left-0 h-5 w-1 rounded-r-full bg-gradient-to-b from-[#4da3ff] to-[#6bd3ff]"></div>}
            <div className="flex items-center space-x-3">
                <Icon name={icon} className="h-5 w-5" />
                <span>{pageName}</span>
            </div>
            {badgeCount && badgeCount > 0 && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">{badgeCount}</span>}
        </button>
    )
}

export const Sidebar: React.FC<{
  currentPage: Page;
  setPage: (page: Page) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveAgent: (agent: Agent) => void;
  pendingApprovalsCount: number;
  selectedProjectId: string;
}> = ({ currentPage, setPage, isSidebarOpen, setSidebarOpen, setActiveAgent, pendingApprovalsCount, selectedProjectId }) => {
  
  const [openDepartments, setOpenDepartments] = useState<string[]>([]);

  const toggleDepartment = (name: string) => {
      const newOpenDepartments = openDepartments.includes(name)
          ? openDepartments.filter(d => d !== name)
          : [...openDepartments, name];
      setOpenDepartments(newOpenDepartments);
  };
  
  const filteredAgents = MOCK_AGENTS.filter(a => a.projectId === selectedProjectId);

  const departments: { name: Department, icon: React.ComponentProps<typeof Icon>['name'], agents: Agent[] }[] = [
    { name: 'Executive', icon: 'user-cog', agents: filteredAgents.filter(a => a.department === 'Executive') },
    { name: 'Operations', icon: 'server', agents: filteredAgents.filter(a => a.department === 'Operations') },
    { name: 'Support', icon: 'life-buoy', agents: filteredAgents.filter(a => a.department === 'Support') },
    { name: 'Communications', icon: 'send', agents: filteredAgents.filter(a => a.department === 'Communications') },
    { name: 'Marketing', icon: 'megaphone', agents: filteredAgents.filter(a => a.department === 'Marketing') },
    { name: 'Finance', icon: 'landmark', agents: filteredAgents.filter(a => a.department === 'Finance') },
    { name: 'Engineering', icon: 'code-2', agents: filteredAgents.filter(a => a.department === 'Engineering') },
    { name: 'Analytics', icon: 'bar-chart-2', agents: filteredAgents.filter(a => a.department === 'Analytics') },
  ];

  const utilityNav: { name: Page, icon: React.ComponentProps<typeof Icon>['name'] }[] = [
      { name: 'AI Assistant', icon: 'sparkles' },
      { name: 'Power-ups', icon: 'rocket' },
      { name: 'Runs', icon: 'play' },
      { name: 'Approvals', icon: 'shield-check' },
      { name: 'Integrations', icon: 'plug-zap' },
      { name: 'Logs', icon: 'file-text' },
  ];

  const handleNavClick = (page: Page) => {
    setPage(page);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };
  
  const handleAgentClick = (agent: Agent) => {
    setPage('Agents');
    setActiveAgent(agent);
     if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }

  const sidebarContent = (
    <div className="flex h-full w-72 flex-col border-r border-border bg-card">
        <div className="flex h-22 shrink-0 items-center justify-center border-b border-border px-6 py-6">
             <img src="https://i.ibb.co/TDdBPhTm/UTS-CC-Logo-White-Cropped.png" alt="AI Command Logo" className="h-21" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            <NavItem pageName="Overview" icon="layout-dashboard" currentPage={currentPage} onClick={() => handleNavClick('Overview')} />
            
            <div className="py-2">
                <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Agents</h3>
                {departments.map(dept => (
                    <div key={dept.name} className="mt-1">
                        <button onClick={() => toggleDepartment(dept.name)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                            <div className="flex items-center space-x-3">
                                <Icon name={dept.icon} className="h-5 w-5" />
                                <span>{dept.name}</span>
                            </div>
                            <Icon name="chevron-down" className={`h-4 w-4 transition-transform ${openDepartments.includes(dept.name) ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                        {openDepartments.includes(dept.name) && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="ml-4 mt-1 border-l-2 border-border/50 pl-4">
                                    {dept.agents.length > 0 ? dept.agents.map(agent => (
                                        <button key={agent.id} onClick={() => handleAgentClick(agent)} className="group flex w-full items-center space-x-3 rounded-md px-3 py-1.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
                                            <StatusDot status={agent.status} />
                                            <span>{agent.name}</span>
                                        </button>
                                    )) : <div className="px-3 py-1.5 text-xs text-muted-foreground/70 italic">No agents yet.</div>}
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
             <div className="py-2">
                <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Utilities</h3>
                {utilityNav.map(item => (
                    <div key={item.name} className="mt-1">
                        <NavItem
                            pageName={item.name}
                            icon={item.icon}
                            currentPage={currentPage}
                            onClick={() => handleNavClick(item.name)}
                            badgeCount={item.name === 'Approvals' ? pendingApprovalsCount : undefined}
                        />
                    </div>
                ))}
            </div>
        </nav>
        <div className="mt-auto border-t border-border p-4">
             <NavItem pageName="Settings" icon="settings" currentPage={currentPage} onClick={() => handleNavClick('Settings')} />
        </div>
    </div>
  );
  
  return (
    <>
        <div className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
        <aside className={`fixed top-0 left-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {sidebarContent}
        </aside>
    </>
  );
};