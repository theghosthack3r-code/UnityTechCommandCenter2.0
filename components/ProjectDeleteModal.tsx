import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './icons';
import { type Project } from '../types';
import { tokens } from '../tokens';

type ProjectDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  project: Project | null;
};

export const ProjectDeleteModal: React.FC<ProjectDeleteModalProps> = ({ isOpen, onClose, onConfirm, project }) => {
  const [confirmText, setConfirmText] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  if (!project) return null;
  const isMatch = confirmText === project.name;

  const handleDelete = () => {
      if (isMatch) {
          onConfirm(project.id);
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
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className={`w-full max-w-md rounded-2xl border ${tokens.borderSoft} ${tokens.surface} shadow-2xl`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <Icon name="trash-2" className="h-6 w-6 text-destructive" aria-hidden="true" />
                    </div>
                    <h2 id="delete-modal-title" className="mt-3 text-lg font-semibold">Delete Project</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Are you sure you want to delete <strong className="text-foreground">{project.name}</strong>? This action cannot be undone.
                    </p>
                </div>
                <div className="mt-4">
                     <label htmlFor="confirm-delete" className="text-xs font-medium text-muted-foreground">To confirm, type "{project.name}"</label>
                    <input 
                        id="confirm-delete"
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="mt-1 w-full rounded-lg border-input bg-background/50 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
                    />
                </div>
            </div>

            <div className="flex justify-end border-t border-border p-6 bg-muted/20 rounded-b-2xl space-x-2">
                <button type="button" onClick={onClose} className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted">Cancel</button>
                <button 
                    type="button" 
                    onClick={handleDelete}
                    disabled={!isMatch}
                    className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Delete Project
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
