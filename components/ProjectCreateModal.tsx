import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './icons';
import { type Project, type ProjectOwnerDept, type ProjectStatus, PROJECT_STATUSES, PROJECT_OWNER_DEPTS } from '../types';
import { tokens } from '../tokens';

type ProjectCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'updatedAt'>, id?: string) => void;
  projectToEdit?: Project | null;
};

const initialFormState: Omit<Project, 'id' | 'updatedAt'> = {
    name: '',
    ownerDept: 'Core',
    status: 'Pending',
    progress: 0,
    description: '',
    nextMilestone: '',
    risks: [],
    next_actions: [],
    links: [],
};


export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        name: projectToEdit.name,
        ownerDept: projectToEdit.ownerDept,
        status: projectToEdit.status,
        progress: projectToEdit.progress,
        description: projectToEdit.description || '',
        nextMilestone: projectToEdit.nextMilestone || '',
        risks: projectToEdit.risks || [],
        next_actions: projectToEdit.next_actions || [],
        links: projectToEdit.links || [],
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [projectToEdit, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        setTimeout(() => firstInputRef.current?.focus(), 100);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  const validate = () => {
      const newErrors: Record<string, string> = {};
      if (!formData.name.trim()) newErrors.name = 'Project name is required.';
      if (formData.progress < 0 || formData.progress > 100) newErrors.progress = 'Progress must be between 0 and 100.';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData, projectToEdit?.id);
    }
  };
  
  const handleChange = (field: keyof typeof formData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className={`w-full max-w-lg rounded-2xl border ${tokens.borderSoft} ${tokens.surface} shadow-2xl`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
                <div className="border-b border-border p-6">
                    <h2 id="project-modal-title" className="text-lg font-semibold">{projectToEdit ? 'Edit Project' : 'Create New Project'}</h2>
                    <p className="text-sm text-muted-foreground">{projectToEdit ? `Updating ${projectToEdit.name}` : 'Fill in the details below to get started.'}</p>
                </div>
                
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-muted-foreground">Project Name</label>
                        <input id="name" ref={firstInputRef} type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="mt-1 w-full rounded-lg border-input bg-background/50 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                        {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                             <label htmlFor="ownerDept" className="text-sm font-medium text-muted-foreground">Owner Department</label>
                            <select id="ownerDept" value={formData.ownerDept} onChange={e => handleChange('ownerDept', e.target.value)} className="mt-1 w-full rounded-lg border-input bg-background/50 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                                {PROJECT_OWNER_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="status" className="text-sm font-medium text-muted-foreground">Status</label>
                            <select id="status" value={formData.status} onChange={e => handleChange('status', e.target.value)} className="mt-1 w-full rounded-lg border-input bg-background/50 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                                {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="progress" className="text-sm font-medium text-muted-foreground">Progress ({formData.progress}%)</label>
                        <input id="progress" type="range" min="0" max="100" value={formData.progress} onChange={e => handleChange('progress', parseInt(e.target.value, 10))} className="mt-1 w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"/>
                         {errors.progress && <p className="text-xs text-rose-400 mt-1">{errors.progress}</p>}
                    </div>
                     <div>
                        <label htmlFor="description" className="text-sm font-medium text-muted-foreground">Description</label>
                        <textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={3} className="mt-1 w-full rounded-lg border-input bg-background/50 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                    </div>
                </div>

                <div className="flex justify-end border-t border-border p-6 bg-muted/20 rounded-b-2xl space-x-2">
                    <button type="button" onClick={onClose} className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted">Cancel</button>
                    <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Save Changes</button>
                </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
