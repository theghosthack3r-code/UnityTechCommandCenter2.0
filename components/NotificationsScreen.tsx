import React, { useState } from 'react';
import { type Page, type Integration } from '../types';
import { MOCK_INTEGRATIONS } from '../mock';
import { Icon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

const mockPowerups = [
    { id: 'pu-1', name: 'Ship Now', description: 'Initiates a new deployment for all agents.' },
    { id: 'pu-2', name: 'Daily Brief', description: 'Generates and distributes a summary of system status.' },
    { id: 'pu-3', name: 'Send Campaign', description: 'Starts the new marketing outreach campaign.' },
    { id: 'pu-4', name: 'Cost Check', description: 'Analyzes API spend for the current billing cycle.' },
    { id: 'pu-5', name: 'Emergency Halt', description: 'Pauses all running agents and workflows.' },
];

// --- Components ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`rounded-2xl border border-border bg-card p-6 shadow-lg ${className}`}>{children}</div>
);

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
                    <div className="flex h-16 items-center justify-between border-b border-border px-6"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} className="rounded-lg p-1 hover:bg-accent"><Icon name="x" /></button></div>
                    <div className="p-6">{children}</div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

const Toast: React.FC<{ message: string; show: boolean; }> = ({ message, show }) => (
    <AnimatePresence>
    {show && (
         <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 rounded-lg border border-border bg-card p-4 shadow-2xl"
         >
            <Icon name="check-circle-2" className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium">{message}</span>
         </motion.div>
    )}
    </AnimatePresence>
);

// --- Screens ---

const PowerupsScreen: React.FC = () => {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [drawerContent, setDrawerContent] = useState({ title: '', content: {} });
    
    const handleRun = (pu: typeof mockPowerups[0]) => {
        setDrawerContent({ title: `Result: ${pu.name}`, content: { status: "Completed", timestamp: new Date().toISOString(), details: `Mock result for ${pu.name}` }});
        setDrawerOpen(true);
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Power-ups</h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockPowerups.map(pu => (
                    <Card key={pu.id}>
                        <h2 className="font-semibold">{pu.name}</h2>
                        <p className="mt-2 text-xs text-muted-foreground">{pu.description}</p>
                        <button onClick={() => handleRun(pu)} className="mt-4 flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                            <Icon name="play" className="h-4 w-4" />
                            <span>Run</span>
                        </button>
                    </Card>
                ))}
            </div>
            <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title={drawerContent.title}>
                 <div className="flex items-center space-x-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">Completed</div>
                 <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-background p-4 text-xs">{JSON.stringify(drawerContent.content, null, 2)}</pre>
            </Drawer>
        </div>
    );
};

const IntegrationsScreen: React.FC = () => {
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [showToast, setShowToast] = useState(false);

    const handleSendTest = (e: React.FormEvent) => {
        e.preventDefault();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Integrations</h1>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {MOCK_INTEGRATIONS.map(int => (
                    <Card key={int.name}>
                        <div className="flex items-center space-x-4">
                            <div className="rounded-lg bg-accent p-2"><Icon name={int.icon as any} className="h-8 w-8 text-muted-foreground" /></div>
                            <div>
                                <h2 className="font-semibold">{int.name}</h2>
                                <span className={`text-xs ${int.status === 'Connected' ? 'text-green-400' : 'text-slate-400'}`}>{int.status}</span>
                            </div>
                        </div>
                        <button onClick={() => setSelectedIntegration(int)} className="mt-4 w-full rounded-lg bg-accent py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted">Manage</button>
                    </Card>
                ))}
            </div>
            <AnimatePresence>
            {selectedIntegration && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                     <Card>
                        <h2 className="text-lg font-semibold">{selectedIntegration.name} Configuration</h2>
                        <div className="mt-4 space-y-4">
                            <p className="text-sm text-muted-foreground">Read-only configuration fields would be displayed here.</p>
                            <form onSubmit={handleSendTest}>
                                <h3 className="text-sm font-medium">Send Test Notification</h3>
                                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-2">
                                    <input required type="text" placeholder="To" className="flex-1 rounded-lg border border-input bg-background p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"/>
                                    <input required type="text" placeholder="Message" className="flex-1 rounded-lg border border-input bg-background p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"/>
                                    <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Send</button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>
            <Toast message="Test notification sent!" show={showToast} />
        </div>
    );
};

export const ContentGridScreen: React.FC<{ page: 'Power-ups' | 'Integrations' }> = ({ page }) => {
    if (page === 'Power-ups') return <PowerupsScreen />;
    if (page === 'Integrations') return <IntegrationsScreen />;
    return null;
};
