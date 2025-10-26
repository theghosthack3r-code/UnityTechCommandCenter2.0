import React, { useState } from 'react';
import { Icon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

const Toast: React.FC<{ message: string; show: boolean; }> = ({ message, show }) => (
    <AnimatePresence>
    {show && (
         <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-5 left-1/2 z-50 flex items-center space-x-2 rounded-lg border border-border bg-card p-4 shadow-2xl"
         >
            <Icon name="check-circle-2" className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium">{message}</span>
         </motion.div>
    )}
    </AnimatePresence>
);

export const SettingsScreen: React.FC = () => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('api_key') || 'sk-live_******************a1b2');
    const [showKey, setShowKey] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleSave = () => {
        localStorage.setItem('api_key', apiKey);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-xl font-semibold">Settings</h1>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                        <h2 className="text-lg font-semibold">API Configuration</h2>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="api-base" className="text-sm font-medium text-muted-foreground">API Base</label>
                                <input id="api-base" type="text" value="https://api.aicommancenter.com/v1" readOnly className="mt-1 block w-full cursor-not-allowed rounded-lg border-input bg-background/50 p-2 text-sm text-muted-foreground" />
                            </div>
                             <div>
                                <label htmlFor="api-key" className="text-sm font-medium text-muted-foreground">API Key</label>
                                <div className="relative mt-1">
                                    <input 
                                        id="api-key"
                                        type={showKey ? 'text' : 'password'}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="block w-full rounded-lg border-input bg-background/50 p-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <button onClick={() => setShowKey(!showKey)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground" aria-label={showKey ? 'Hide API key' : 'Show API key'}>
                                        <Icon name={showKey ? 'eye-off' : 'eye'} className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                                Save Changes
                            </button>
                        </div>
                    </div>
                     <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                        <h2 className="text-lg font-semibold">Theme</h2>
                        <div className="mt-4 flex items-center space-x-4">
                            <button className="rounded-lg border-2 border-primary bg-accent p-4">
                                <Icon name="moon" />
                                <span className="mt-1 block text-sm">Dark</span>
                            </button>
                            <button className="cursor-not-allowed rounded-lg border-2 border-transparent bg-accent p-4 opacity-50">
                                <Icon name="sun" />
                                <span className="mt-1 block text-sm">Light</span>
                            </button>
                        </div>
                     </div>
                </div>

                <div className="space-y-4">
                     <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                        <h3 className="text-base font-semibold">Environment</h3>
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-medium text-green-400">Production</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Region:</span>
                                <span className="font-medium">us-east-1</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Version:</span>
                                <span className="font-medium">3.0.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast message="Settings saved successfully!" show={showToast} />
        </div>
    );
};
