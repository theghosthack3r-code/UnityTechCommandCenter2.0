import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './icons';
import { type Run, type Approval, type Integration, RunStatus, ApprovalStatus, Page, AttentionItem, Project } from '../types';
import { MOCK_USER, MOCK_ATTENTION, MOCK_RUNS, MOCK_INTEGRATIONS } from '../mock';

// --- Helper Functions & Components ---

const getGreeting = (name = "there") => {
  const h = new Date().getHours();
  const timeOfDay = h < 5 ? "Hello" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${timeOfDay}, ${name}`;
};

// FIX: Add style prop to allow for dynamic styling like background images.
const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; style?: React.CSSProperties; }> = ({ children, className, title, style }) => (
    <div className={`rounded-2xl border border-border bg-card shadow-lg ${className}`} style={style}>
        {title && <h2 className="border-b border-border p-4 text-base font-semibold">{title}</h2>}
        <div className={title ? "p-4" : "p-6"}>{children}</div>
    </div>
);

const Pill: React.FC<{ status: RunStatus | Integration['status'] | string }> = ({ status }) => {
    const statusMap: Record<string, string> = {
        Succeeded: 'bg-green-500/10 text-green-300 border-green-500/20',
        Running: 'bg-blue-500/10 text-blue-300 border-blue-500/20 animate-pulse',
        Failed: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
        Pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        Connected: 'bg-green-500/10 text-green-300 border-green-500/20',
        'Not configured': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusMap[status] || 'bg-slate-500/10 text-slate-400'}`}>{status}</span>
};

const Drawer: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[101] bg-background/80 backdrop-blur-sm" />
                <motion.div
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 z-[102] h-full w-full max-w-lg overflow-y-auto border-l border-border bg-card"
                >
                    <div className="flex h-16 items-center justify-between border-b border-border px-6 sticky top-0 bg-card/80 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button onClick={onClose} className="rounded-lg p-1 hover:bg-accent"><Icon name="x" /></button>
                    </div>
                    <div className="p-6">{children}</div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

// --- Dashboard Sub-components ---

const GreetingPanel: React.FC<{ pendingApprovals: number; failedRuns: number; project: Project }> = ({ pendingApprovals, failedRuns, project }) => {
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    useEffect(() => { !localStorage.getItem('first_seen_at') && setIsFirstVisit(true); }, []);
    const dismissWelcome = () => { localStorage.setItem('first_seen_at', new Date().toISOString()); setIsFirstVisit(false); };

    const topPriority = MOCK_ATTENTION[0];
    const summary = project.branding?.tagline || `This project has ${pendingApprovals} pending approvals and ${failedRuns} failed runs. ${topPriority ? `I suggest starting with ${topPriority.title}.` : 'Everything looks quiet right now.'}`;
    const displayName = project.branding?.displayName || project.name;
    const accentColor = project.appearance?.color || project.color || '#4da3ff';

    const bgStyle = project.appearance?.bgImage ? {
        backgroundImage: `linear-gradient(to right, hsl(var(--card)) 50%, transparent), url(${project.appearance.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
    } : {};

    return (
        <Card className="col-span-12 relative overflow-hidden" style={bgStyle}>
             {project.appearance?.bgImage && <div className="absolute inset-0 bg-card/60 z-0"></div>}
            <div className="relative z-10 flex flex-col md:flex-row md:items-start md:space-x-6">
                <div className="text-4xl">🤖</div>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold">{getGreeting(MOCK_USER.name)} — you're viewing <span className="font-bold" style={{color: accentColor}}>{displayName}</span></h1>
                    <p className="mt-1 text-muted-foreground">{summary}</p>
                    {isFirstVisit && (
                        <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-lg bg-accent p-4 text-sm">
                            <p className="font-semibold">Welcome to the Command Center!</p>
                            <p className="mt-1 text-muted-foreground">This is your central hub for monitoring and managing all AI agents and their workflows. Use the project switcher in the header to navigate between projects.</p>
                            <button onClick={dismissWelcome} className="mt-2 text-xs font-semibold text-primary">Got it, thanks!</button>
                        </motion.div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {MOCK_ATTENTION.map(item => (
                            <button key={item.id} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground transition-colors hover:bg-muted">
                                {item.priority === 'P1' && <span className="mr-1.5 text-rose-400">●</span>}
                                {item.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

const KpiCard: React.FC<{ title: string; value: string | number; trend: string; trendDirection: 'up' | 'down'; }> = ({ title, value, trend, trendDirection }) => {
    const isUp = trendDirection === 'up';
    return (
        <Card>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline justify-between">
                <p className="text-2xl font-semibold">{value}</p>
                <div className={`flex items-center text-xs font-medium ${isUp ? 'text-green-400' : 'text-rose-400'}`}>
                    <Icon name={isUp ? 'arrow-up' : 'arrow-down'} className="mr-1 h-3 w-3" /> {trend}
                </div>
            </div>
        </Card>
    );
};

// --- Main Overview Screen ---

export const OverviewScreen: React.FC<{
    projects: Project[];
    approvals: Approval[];
    handleApprovalAction: (id: string, newStatus: ApprovalStatus) => void;
    setPage: (page: Page) => void;
    project: Project | null;
    onOpenCreateProject: () => void;
}> = ({ projects, approvals, handleApprovalAction, setPage, project, onOpenCreateProject }) => {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    // FIX: Explicitly type the state to allow any ReactNode for content, not just JSX.Element.
    const [drawerContent, setDrawerContent] = useState<{ title: string; content: React.ReactNode }>({ title: '', content: <></> });

    if (projects.length === 0 || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                 <Icon name="folder-plus" className="w-16 h-16 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">No Projects Found</h2>
                <p className="mt-1 text-muted-foreground">Get started by creating your first project.</p>
                <button onClick={onOpenCreateProject} className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                    Create your first project
                </button>
            </div>
        )
    }

    const projectRuns = MOCK_RUNS.filter(r => r.projectId === project.id);
    
    const pendingApprovals = approvals.filter(a => a.status === 'Pending');
    const failedRuns = projectRuns.filter(r => r.status === 'Failed').length;
    const projectKPIs = project.kpis || { activeAgents: 0, pendingApprovals: 0, runsToday: 0, deliverySuccessPct: 0 };
    
    const modules = project.appearance?.modules || { showAttention: true, showRecentRuns: true, showApprovals: true, showIntegrations: true };
    const densityClass = project.appearance?.density === 'compact' ? 'gap-4' : 'gap-6';

    const openDrawer = (title: string, content: React.ReactNode) => {
        setDrawerContent({ title, content });
        setDrawerOpen(true);
    };

    const handleAttentionClick = (item: AttentionItem) => {
        openDrawer(item.title, <pre className="whitespace-pre-wrap rounded-lg bg-background p-4 text-xs">{JSON.stringify(item, null, 2)}</pre>);
    };

    return (
        <div className={`grid grid-cols-12 ${densityClass}`}>
            <GreetingPanel pendingApprovals={pendingApprovals.length} failedRuns={failedRuns} project={project}/>

            <div className={`col-span-12 grid grid-cols-2 ${densityClass} md:grid-cols-4`}>
                <KpiCard title="Active Agents" value={projectKPIs.activeAgents} trend="+0%" trendDirection="up" />
                <KpiCard title="Pending Approvals" value={pendingApprovals.length} trend="-0" trendDirection="down" />
                <KpiCard title="Runs Today" value={projectKPIs.runsToday} trend="+0%" trendDirection="up" />
                <KpiCard title="Delivery Success" value={`${projectKPIs.deliverySuccessPct}%`} trend="+0%" trendDirection="up" />
            </div>
            
            {modules.showAttention && (
            <Card className="col-span-12 lg:col-span-5" title="Attention Feed">
                <div className="space-y-3">
                    {MOCK_ATTENTION.length > 0 ? MOCK_ATTENTION.map(item => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-accent">
                            <div>
                                <p className="font-medium">
                                    {item.priority === 'P1' && <span className="mr-2 text-rose-400">●</span>}
                                    {item.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{item.hint}</p>
                            </div>
                            <button onClick={() => handleAttentionClick(item)} className="rounded-md bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground hover:bg-muted">{item.cta}</button>
                        </div>
                    )) : (
                         <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground">
                            <Icon name="check-circle-2" className="h-8 w-8 text-green-400" />
                            <p className="mt-2 font-medium">All clear!</p>
                            <p className="text-xs">Nothing needs your attention.</p>
                        </div>
                    )}
                </div>
            </Card>
            )}

            {modules.showRecentRuns && (
            <Card className="col-span-12 lg:col-span-7" title="Recent Runs">
                {projectRuns.length > 0 ? (
                    <table className="w-full text-left text-xs">
                        <thead><tr className="text-muted-foreground">
                            <th className="py-2 font-medium">Type</th><th className="py-2 font-medium">Name</th><th className="py-2 font-medium">Status</th><th className="py-2 font-medium text-right">Started</th>
                        </tr></thead>
                        <tbody>
                            {projectRuns.slice(0, 5).map(run => (
                                <tr key={run.id} className="border-t border-border">
                                    <td className="py-2.5">{run.type}</td>
                                    <td className="py-2.5 font-medium">{run.name}</td>
                                    <td className="py-2.5"><Pill status={run.status} /></td>
                                    <td className="py-2.5 text-right">{run.started}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground">
                        <Icon name="play-circle" className="h-8 w-8" />
                        <p className="mt-2 font-medium">No runs recorded yet.</p>
                    </div>
                )}
                 <button onClick={() => setPage('Runs')} className="mt-3 text-xs font-semibold text-primary">View all runs</button>
            </Card>
            )}

            {modules.showApprovals && (
             <Card className="col-span-12 lg:col-span-6" title="Approvals Snapshot">
                {pendingApprovals.length > 0 ? (
                    <ul className="space-y-2">
                        {pendingApprovals.slice(0, 3).map(app => (
                            <li key={app.id} className="flex items-center justify-between text-xs">
                                <div>
                                    <p className="font-medium">{app.subject}</p>
                                    <p className="text-muted-foreground">{app.action} • {app.requested}</p>
                                </div>
                                <Pill status={app.status} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground">
                        <Icon name="shield-check" className="h-8 w-8" />
                        <p className="mt-2 font-medium">No pending approvals.</p>
                    </div>
                )}
                <button onClick={() => setPage('Approvals')} className="mt-3 text-xs font-semibold text-primary">View all approvals</button>
            </Card>
            )}
            
            {modules.showIntegrations && (
            <Card className="col-span-12 lg:col-span-6" title="Integrations Status">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {MOCK_INTEGRATIONS.slice(0,6).map(int => (
                        <div key={int.name} className="rounded-lg border border-border bg-accent p-3 text-center">
                            <Icon name={int.icon as any} className="mx-auto h-6 w-6 text-muted-foreground" />
                            <p className="mt-2 text-xs font-medium">{int.name}</p>
                            <div className="mt-2"><Pill status={int.status} /></div>
                        </div>
                    ))}
                </div>
                 <button onClick={() => setPage('Integrations')} className="mt-3 text-xs font-semibold text-primary">Manage integrations</button>
            </Card>
            )}
            
            <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title={drawerContent.title}>
                {drawerContent.content}
            </Drawer>
        </div>
    );
};
