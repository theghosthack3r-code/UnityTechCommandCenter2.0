import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './icons';
import { type Project } from '../types';
import { projectStore } from '../store/projectsStore';

type ProjectManageMenuProps = {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
};

export const ProjectManageMenu: React.FC<ProjectManageMenuProps> = ({ project, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = () => {
    const jsonString = projectStore.export();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };
  
  const handleImportClick = () => {
      fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const result = projectStore.import(text);
        if (!result.success) {
            alert(`Import failed: ${result.error}`);
        } else {
            alert('Projects imported successfully!');
        }
      };
      reader.readAsText(file);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Manage Projects"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Icon name="more-vertical" className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="absolute top-full right-0 z-[100] mt-2 w-56 origin-top-right rounded-xl border border-border bg-card p-2 shadow-2xl"
          >
            <div className="text-xs font-semibold text-muted-foreground px-2 py-1">Manage</div>
            <button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full text-left flex items-center space-x-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                <Icon name="pencil" className="h-4 w-4"/>
                <span>Edit Project</span>
            </button>
             <button onClick={() => { onDelete(); setIsOpen(false); }} className="w-full text-left flex items-center space-x-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent text-destructive/80 hover:text-destructive">
                <Icon name="trash-2" className="h-4 w-4"/>
                <span>Delete Project</span>
            </button>
            <div className="my-1 h-px bg-border"></div>
             <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
             <button onClick={handleImportClick} className="w-full text-left flex items-center space-x-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                <Icon name="upload" className="h-4 w-4"/>
                <span>Import from JSON...</span>
            </button>
             <button onClick={handleExport} className="w-full text-left flex items-center space-x-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                <Icon name="download" className="h-4 w-4"/>
                <span>Export to JSON...</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
