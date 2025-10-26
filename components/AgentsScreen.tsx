import React, { useState } from 'react';
import { type Agent, type Department, AgentStatus } from '../types';
import { MOCK_AGENTS } from '../mock';
import { Icon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

const departments: Department[] = ['Executive', 'Operations', 'Support', 'Communications', 'Marketing', 'Finance', 'Engineering', 'Analytics'];

const Pill: React.FC<{ status: AgentStatus }> = ({ status }) => {
    const statusMap = {
        Online: 'bg-green-500/10 text-green-300 border-green-500/20',
        Warn: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        Offline: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
        Unknown: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusMap[status]}`}>{status}</span>
};

const AgentCard: React.FC<{ agent: Agent; onClick: () => void; }> = ({ agent, onClick }) => (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg transition-all hover:border-primary/50 hover:shadow-primary/10">
        <div className="flex items-start justify-between">
            <div>
                <h3 className="font-semibold text-foreground">{agent.name}</h3>
                <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
            <Pill status={agent.status} />
        </div>
        <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Dept: {agent.department}</span>
            <button onClick={onClick} className="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20">Open</button>
        </div>
    </div>
);

export const AgentsScreen: React.FC<{ setActiveAgent: (agent: Agent) => void; selectedProjectId: string; }> = ({ setActiveAgent, selectedProjectId }) => {
  const projectAgents = MOCK_AGENTS.filter(a => a.projectId === selectedProjectId);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Agents</h1>
        <p className="mt-1 text-muted-foreground">Manage and monitor your autonomous agents, grouped by department.</p>
      </div>
      
      {projectAgents.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 rounded-2xl border-2 border-dashed border-border bg-card/50">
          <Icon name="users" className="mx-auto h-10 w-10" />
          <h3 className="mt-2 text-base font-semibold">No Agents Found</h3>
          <p className="mt-1 text-sm">Get started by creating your first agent for this project.</p>
        </div>
      ) : (
        departments.map(dept => {
            const agentsInDept = projectAgents.filter(a => a.department === dept);
            if (agentsInDept.length === 0) return null;

            return (
              <section key={dept}>
                  <h2 className="text-base font-semibold text-primary">{dept}</h2>
                  <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {agentsInDept.map(agent => (
                          <AgentCard key={agent.id} agent={agent} onClick={() => setActiveAgent(agent)} />
                      ))}
                  </div>
              </section>
            );
        })
      )}
    </div>
  );
};

// --- Agent Detail Screen ---

const Drawer: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
                <motion.div
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-border bg-card"
                >
                    <div className="flex h-16 items-center justify-between border-b border-border px-6">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button onClick={onClose} className="rounded-lg p-1 hover:bg-accent"><Icon name="x" /></button>
                    </div>
                    <div className="p-6">{children}</div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

const AgentDetailOverview: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const mockInput = { command: "summarize", source: "last_24h_activity" };
    const mockOutput = { summary: "3 runs, 1 failure. High traffic on OrderOps.", recommendation: "Investigate OrderOps failure." };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold">Description</h3>
                <p className="mt-2 text-sm text-muted-foreground">{agent.description}</p>
            </div>
            <button onClick={() => setDrawerOpen(true)} className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Icon name="play" className="h-4 w-4" />
                <span>Run Test</span>
            </button>
            <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title={`Test Run: ${agent.name}`}>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold">Inputs</h3>
                        <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-background p-4 text-xs">{JSON.stringify(mockInput, null, 2)}</pre>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Outputs</h3>
                        <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-background p-4 text-xs">{JSON.stringify(mockOutput, null, 2)}</pre>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}

const AgentDetailActivity: React.FC = () => (
    <div className="space-y-4">
        {[
            { id: 1, action: "Run Succeeded", time: "5m ago", details: "Completed daily summary." },
            { id: 2, action: "Run Started", time: "6m ago", details: "Triggered by schedule." },
            { id: 3, action: "Settings Updated", time: "2h ago", details: "User 'Alex' updated routing rules." },
            { id: 4, action: "Run Failed", time: "8h ago", details: "API timeout on external service." },
        ].map(item => (
             <div key={item.id} className="flex items-start space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                    <Icon name={item.action.includes('Failed') ? 'x-circle' : 'check-circle-2'} className={`h-4 w-4 ${item.action.includes('Failed') ? 'text-rose-400' : 'text-green-400'}`} />
                </div>
                <div>
                    <p className="font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.details} &middot; {item.time}</p>
                </div>
            </div>
        ))}
    </div>
);

const AgentDetailSettings: React.FC = () => (
    <div className="max-w-md space-y-4 text-sm">
        <div className="flex justify-between rounded-lg border border-border p-3">
            <span className="text-muted-foreground">Routing Rules</span>
            <span className="font-mono">priority_based_v2</span>
        </div>
        <div className="flex justify-between rounded-lg border border-border p-3">
            <span className="text-muted-foreground">Quiet Hours</span>
            <span className="font-mono">10 PM - 6 AM PST</span>
        </div>
         <div className="flex justify-between rounded-lg border border-border p-3">
            <span className="text-muted-foreground">Max Retries</span>
            <span className="font-mono">3</span>
        </div>
    </div>
);

export const AgentDetailScreen: React.FC<{ agent: Agent; onBack: () => void; }> = ({ agent, onBack }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    
    return (
         <div className="space-y-6">
            <div className="flex items-start space-x-4">
                <button onClick={onBack} className="rounded-lg p-2 transition-colors hover:bg-accent">
                    <Icon name="arrow-left" className="h-5 w-5" />
                </button>
                <div>
                    <div className="flex items-center space-x-3">
                        <h1 className="text-xl font-semibold">{agent.name}</h1>
                        <Pill status={agent.status} />
                    </div>
                    <p className="mt-1 text-muted-foreground">{agent.department} / {agent.role}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Last run: {agent.lastRun}</p>
                </div>
            </div>

            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6">
                    {['Overview', 'Activity', 'Settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${ activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:border-gray-500/50 hover:text-foreground'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'Overview' && <AgentDetailOverview agent={agent} />}
                {activeTab === 'Activity' && <AgentDetailActivity />}
                {activeTab === 'Settings' && <AgentDetailSettings />}
            </div>
         </div>
    );
};