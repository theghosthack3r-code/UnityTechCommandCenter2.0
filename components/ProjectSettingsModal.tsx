import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './icons';
import { icons } from 'lucide-react';
import { type Project, type ProjectBranding, type ProjectAppearance } from '../types';
import { deepMerge } from '../utils';

type ProjectSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave: (updates: { branding?: ProjectBranding; appearance?: ProjectAppearance }) => void;
};

const iconList = Object.keys(icons)
    .filter(key => !key.includes('Logo') && !key.includes('Icon'))
    .map(key => key.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1));

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ isOpen, onClose, project, onSave }) => {
  const [activeTab, setActiveTab] = useState('General');
  const [formState, setFormState] = useState<{ branding: ProjectBranding; appearance: ProjectAppearance }>({
    branding: {},
    appearance: {},
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project) {
        setFormState({
            branding: deepMerge({}, project.branding || {}),
            appearance: deepMerge({}, project.appearance || {}),
        });
    }
  }, [project, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleBrandingChange = (field: keyof ProjectBranding, value: string) => {
    setFormState(prev => ({ ...prev, branding: { ...prev.branding, [field]: value } }));
  };
  
  const handleAppearanceChange = (field: keyof ProjectAppearance, value: any) => {
    setFormState(prev => ({ ...prev, appearance: { ...prev.appearance, [field]: value } }));
  };
  
  const handleModuleToggle = (module: keyof NonNullable<ProjectAppearance['modules']>) => {
    setFormState(prev => ({
        ...prev,
        appearance: {
            ...prev.appearance,
            modules: {
                ...prev.appearance.modules,
                [module]: !(prev.appearance.modules?.[module] ?? true)
            }
        }
    }))
  };

  const handleSaveChanges = () => {
    onSave(formState);
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem(`project_settings::${project.id}`);
    // A bit of a hack to force a re-render in App.tsx state
    onSave({ branding: { displayName: project.name }, appearance: { icon: project.icon, color: project.color }});
    onClose();
  }
  
  const renderContent = () => {
    switch (activeTab) {
        case 'General': return (
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                    <input type="text" value={formState.branding.displayName || ''} onChange={e => handleBrandingChange('displayName', e.target.value)} placeholder={project.name} className="mt-1 w-full rounded-lg border-input bg-background/50 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-muted-foreground">Tagline</label>
                    <input type="text" value={formState.branding.tagline || ''} onChange={e => handleBrandingChange('tagline', e.target.value)} placeholder="A short description for the dashboard..." className="mt-1 w-full rounded-lg border-input bg-background/50 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"/>
                </div>
            </div>
        );
        case 'Branding': return (
            <div className="space-y-4">
                 <div>
                    <label className="text-sm font-medium text-muted-foreground">Accent Color</label>
                     <div className="mt-1 flex items-center space-x-2">
                        <input type="color" value={formState.appearance.color || project.color || '#ffffff'} onChange={e => handleAppearanceChange('color', e.target.value)} className="h-9 w-9 cursor-pointer appearance-none rounded-md border-none bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"/>
                        <input type="text" value={formState.appearance.color || ''} onChange={e => handleAppearanceChange('color', e.target.value)} placeholder={project.color} className="flex-1 rounded-lg border-input bg-background/50 p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"/>
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-medium text-muted-foreground">Icon</label>
                    <div className="mt-1 grid h-32 grid-cols-8 gap-2 overflow-y-scroll rounded-lg border border-input bg-background/50 p-2">
                        {iconList.map(iconName => (
                            <button key={iconName} onClick={() => handleAppearanceChange('icon', iconName)} className={`flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent ${formState.appearance.icon === iconName ? 'bg-primary/20 text-primary ring-1 ring-primary' : ''}`}>
                                <Icon name={iconName as any} className="h-5 w-5"/>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Background Image URL</label>
                    <input type="text" value={formState.appearance.bgImage || ''} onChange={e => handleAppearanceChange('bgImage', e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-lg border-input bg-background/50 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"/>
                </div>
            </div>
        );
        case 'Modules': return (
            <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Toggle visibility of dashboard modules.</p>
                {['showAttention', 'showRecentRuns', 'showApprovals', 'showIntegrations'].map(key => {
                     const isChecked = formState.appearance.modules?.[key as keyof typeof formState.appearance.modules] ?? true;
                     return (
                        <label key={key} className="flex items-center justify-between rounded-lg bg-accent p-3">
                            <span className="font-medium capitalize">{key.replace('show', '')}</span>
                            <button onClick={() => handleModuleToggle(key as any)} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card ${isChecked ? 'bg-primary' : 'bg-muted'}`}>
                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-4' : 'translate-x-0'}`}/>
                            </button>
                        </label>
                     )
                })}
            </div>
        );
        default: return null;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-settings-title"
          >
            <div className="border-b border-border p-6">
                <h2 id="project-settings-title" className="text-lg font-semibold">Project Settings</h2>
                <p className="text-sm text-muted-foreground">Customizing <span className="font-semibold text-foreground">{project.name}</span></p>
            </div>
            
            <div className="flex p-6 space-x-6">
                 <nav className="flex flex-col space-y-1">
                    {['General', 'Branding', 'Modules'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`w-32 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${activeTab === tab ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
                 <div className="flex-1">
                     {renderContent()}
                 </div>
            </div>

            <div className="flex justify-between border-t border-border p-6 bg-muted/20 rounded-b-2xl">
                <button onClick={handleReset} className="text-xs font-medium text-muted-foreground transition-colors hover:text-rose-400">Reset to defaults</button>
                <div className="space-x-2">
                    <button onClick={onClose} className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted">Cancel</button>
                    <button onClick={handleSaveChanges} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Save Changes</button>
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
