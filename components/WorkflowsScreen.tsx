import React, { useState } from 'react';
import { type Page, type Run, RunStatus, type Approval, ApprovalStatus } from '../types';
import { MOCK_RUNS } from '../mock';
import { Icon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

// --- UI Components ---

const Pill: React.FC<{ status: RunStatus | ApprovalStatus }> = ({ status }) => {
    const statusMap: Record<string, string> = {
        Succeeded: 'bg-green-500/10 text-green-300',
        Running: 'bg-blue-500/10 text-blue-300 animate-pulse',
        Failed: 'bg-rose-500/10 text-rose-300',
        Pending: 'bg-amber-500/10 text-amber-300',
        Approved: 'bg-green-500/10 text-green-300',
        Denied: 'bg-rose-500/10 text-rose-300',
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusMap[status]}`}>{status}</span>
};

const Drawer: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; }> = ({ isOpen, onClose, children }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
                <motion.div
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 z-50 h-full w-full max-w-2xl border-l border-border bg-card"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 rounded-lg p-1 hover:bg-accent"><Icon name="x" /></button>
                    <div className="h-full p-6">{children}</div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

// --- Screens ---

const RunsScreen: React.FC<{ selectedProjectId: string }> = ({ selectedProjectId }) => {
    const [filter, setFilter] = useState('All');
    const [selectedRun, setSelectedRun] = useState<Run | null>(null);
    const [activeTab, setActiveTab] = useState('Outputs');

    const projectRuns = MOCK_RUNS.filter(r => r.projectId === selectedProjectId);
    const filteredRuns = projectRuns.filter(r => filter === 'All' || r.status === filter);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Runs</h1>
            <div className="flex space-x-2">
                {['All', 'Running', 'Succeeded', 'Failed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:bg-muted'}`}>{f}</button>
                ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted/30"><tr>
                        {['ID', 'Type', 'Name', 'Status', 'Started', 'Duration'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {filteredRuns.length > 0 ? (
                            filteredRuns.map(run => (
                                <tr key={run.id} className="cursor-pointer transition-colors hover:bg-accent" onClick={() => setSelectedRun(run)}>
                                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs">{run.id}</td>
                                    <td className="whitespace-nowrap px-6 py-4">{run.type}</td>
                                    <td className="whitespace-nowrap px-6 py-4 font-medium">{run.name}</td>
                                    <td className="whitespace-nowrap px-6 py-4"><Pill status={run.status} /></td>
                                    <td className="whitespace-nowrap px-6 py-4">{run.started}</td>
                                    <td className="whitespace-nowrap px-6 py-4">{run.duration}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-12 text-center">
                                    <Icon name="play-circle" className="mx-auto h-10 w-10 text-muted-foreground" />
                                    <p className="mt-2 text-sm font-semibold text-muted-foreground">No Runs Found</p>
                                    <p className="text-xs text-muted-foreground">No runs match the current filter.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Drawer isOpen={!!selectedRun} onClose={() => setSelectedRun(null)}>
                {selectedRun && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                             <Pill status={selectedRun.status} />
                             <h2 className="text-lg font-semibold">{selectedRun.name}</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">Run ID: {selectedRun.id} &middot; Started: {selectedRun.started}</p>
                         <div className="border-b border-border">
                            <nav className="-mb-px flex space-x-6">
                                {['Inputs', 'Outputs', 'Trace'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${ activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:border-gray-500/50 hover:text-foreground'}`}
                                    >{tab}</button>
                                ))}
                            </nav>
                        </div>
                        <pre className="whitespace-pre-wrap rounded-lg bg-background p-4 text-xs h-96 overflow-auto">{JSON.stringify({ mockDataFor: activeTab, runId: selectedRun.id, status: selectedRun.status }, null, 2)}</pre>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

const ApprovalsScreen: React.FC<{
    approvals: Approval[];
    handleApprovalAction: (id: string, newStatus: ApprovalStatus) => void;
}> = ({ approvals, handleApprovalAction }) => {
    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Approvals</h1>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted/30"><tr>
                        {['Subject', 'Action', 'Requested', 'Status', ''].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {approvals.length > 0 ? (
                            approvals.map(approval => (
                                <tr key={approval.id} className="transition-colors hover:bg-accent">
                                    <td className="w-2/5 whitespace-nowrap px-6 py-4 font-medium">{approval.subject}</td>
                                    <td className="whitespace-nowrap px-6 py-4">{approval.action}</td>
                                    <td className="whitespace-nowrap px-6 py-4">{approval.requested}</td>
                                    <td className="whitespace-nowrap px-6 py-4"><Pill status={approval.status} /></td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        {approval.status === 'Pending' && (
                                            <div className="space-x-2">
                                                <button onClick={() => handleApprovalAction(approval.id, 'Approved')} className="rounded-md bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300 hover:bg-green-500/20">Approve</button>
                                                <button onClick={() => handleApprovalAction(approval.id, 'Denied')} className="rounded-md bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/20">Deny</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={5} className="py-12 text-center">
                                     <Icon name="shield-check" className="mx-auto h-10 w-10 text-muted-foreground" />
                                    <p className="mt-2 text-sm font-semibold text-muted-foreground">No Approvals Found</p>
                                    <p className="text-xs text-muted-foreground">There are no approvals to display.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ActivityScreen: React.FC<{ 
    page: 'Runs' | 'Approvals';
    approvals: Approval[];
    handleApprovalAction: (id: string, newStatus: ApprovalStatus) => void;
    selectedProjectId: string;
}> = ({ page, approvals, handleApprovalAction, selectedProjectId }) => {
    if (page === 'Runs') return <RunsScreen selectedProjectId={selectedProjectId} />;
    if (page === 'Approvals') return <ApprovalsScreen approvals={approvals} handleApprovalAction={handleApprovalAction} />;
    return null;
};