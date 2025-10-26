import React, { useState } from 'react';
import { Icon } from './icons';
import { type Project, type ProjectStatus } from '../types';
import { InsightDrawer } from './InsightDrawer';
import { tokens } from '../tokens';
import { motion, type Variants } from 'framer-motion';

const StatusIndicator: React.FC<{ status: ProjectStatus }> = ({ status }) => {
    const statusMap: Record<ProjectStatus, { color: string, pulseColor: string, icon: React.ComponentProps<typeof Icon>['name'] }> = {
        'On Track': { color: 'text-green-400', pulseColor: 'bg-green-400', icon: 'check-circle' },
        'At Risk': { color: 'text-amber-400', pulseColor: 'bg-amber-400', icon: 'alert-triangle' },
        'Blocked': { color: 'text-rose-400', pulseColor: 'bg-rose-400', icon: 'x-octagon' },
        'Pending': { color: 'text-slate-400', pulseColor: 'bg-slate-400', icon: 'clock' }
    };
    const { color, pulseColor, icon } = statusMap[status];
    const shouldPulse = status === 'At Risk' || status === 'Blocked';

    return (
        <div className={`inline-flex items-center space-x-2 rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium ${color}`}>
            {shouldPulse && <div className={`relative h-2 w-2 rounded-full ${pulseColor}`}><div className={`absolute inset-0 h-full w-full animate-ping rounded-full ${pulseColor} opacity-75`}></div></div>}
            <Icon name={icon} className="h-3 w-3" />
            <span>{status}</span>
        </div>
    );
}

export const ProjectDetail: React.FC<{ project: Project; onBack: () => void; }> = ({ project, onBack }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [isInsightDrawerOpen, setInsightDrawerOpen] = useState(false);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // FIX: Explicitly type with Variants to fix type inference issue with 'ease'.
    const progressBarVariants: Variants = {
        hidden: { width: 0 },
        visible: { 
            width: `${project.progress}%`,
            transition: { duration: 0.8, ease: 'easeOut' }
        }
    };
    
    return (
         <div className="space-y-6">
            <header className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                     <button onClick={onBack} className="rounded-lg p-2 transition-colors hover:bg-accent">
                        <Icon name="arrow-left" className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-xl font-semibold">{project.name}</h1>
                            <StatusIndicator status={project.status} />
                        </div>
                        <p className="mt-1 text-muted-foreground">{project.ownerDept} Department</p>
                        <p className="mt-1 text-xs text-muted-foreground">Last updated: {new Date(project.updatedAt!).toLocaleString()}</p>
                    </div>
                </div>
                <button onClick={() => setInsightDrawerOpen(true)} className="flex items-center space-x-2 rounded-lg bg-primary/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/30">
                    <Icon name="sparkles" className="h-4 w-4" />
                    <span>Insights</span>
                </button>
            </header>

            <div>
                 <div className="w-full bg-muted rounded-full h-1.5 relative overflow-hidden">
                    <motion.div 
                        className="bg-primary h-1.5 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                        initial={prefersReducedMotion ? false : "hidden"}
                        animate="visible"
                        variants={progressBarVariants}
                    />
                </div>
            </div>

            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6">
                    {['Overview', 'Tasks', 'Workflows', 'Metrics', 'Activity'].map(tab => (
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

            <div className={`p-4 rounded-2xl border ${tokens.borderSoft} ${tokens.surface}`}>
                <p className="text-muted-foreground">Content for '{activeTab}' tab goes here.</p>
            </div>

            <InsightDrawer 
                isOpen={isInsightDrawerOpen}
                onClose={() => setInsightDrawerOpen(false)}
                project={project}
            />
         </div>
    );
};