import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Icon } from './icons';
import { type Project } from '../types';
import { tokens } from '../tokens';

type InsightDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
};

const mockRecommendations = [
    "Clarify dependencies for the 'API Integration' milestone.",
    "Allocate additional testing resources for the upcoming release.",
    "Schedule a stakeholder review for the Q3 roadmap.",
];

export const InsightDrawer: React.FC<InsightDrawerProps> = ({ isOpen, onClose, project }) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // FIX: Explicitly type with Variants to fix type inference issue with 'type'.
    const drawerVariants: Variants = {
        hidden: { x: '100%' },
        visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };
    
    const fadeOnly: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } }
    };
    
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeOnly}
            className="fixed inset-0 z-[101] bg-background/80" 
            onClick={onClose} 
          />
          <motion.div
            ref={drawerRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={prefersReducedMotion ? fadeOnly : drawerVariants}
            className={`fixed top-0 right-0 z-[102] h-full w-full max-w-md border-l ${tokens.borderSoft} ${tokens.surface}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="insight-drawer-title"
          >
            <div className="flex h-full flex-col">
              <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
                <h2 id="insight-drawer-title" className="text-lg font-semibold">Project Insights</h2>
                <button onClick={onClose} className="rounded-lg p-1 hover:bg-accent" aria-label="Close insights panel">
                  <Icon name="x" />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <section>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identified Risks</h3>
                    <ul className="mt-3 space-y-2 list-disc list-inside">
                        {project.risks && project.risks.length > 0 ? project.risks.map((risk, i) => (
                           <li key={i} className="text-sm text-foreground/90">{risk}</li>
                        )) : <p className="text-sm text-muted-foreground italic">No risks identified.</p>}
                    </ul>
                 </section>
                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recommendations</h3>
                    <ul className="mt-3 space-y-2">
                        {mockRecommendations.map((rec, i) => (
                           <li key={i} className={`flex items-start space-x-3 rounded-lg p-3 ${tokens.surfaceHover}`}>
                            <Icon name="lightbulb" className="h-4 w-4 mt-0.5 text-primary"/>
                            <span className="text-sm text-foreground/90">{rec}</span>
                           </li>
                        ))}
                    </ul>
                 </section>
              </div>
              <footer className="shrink-0 border-t border-border p-4">
                <div className="relative">
                     <input type="text" placeholder="Ask the project..." className="w-full rounded-lg border-input bg-background/50 py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                     <button className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" aria-label="Submit query">
                        <Icon name="corner-down-left" className="h-4 w-4"/>
                     </button>
                </div>
              </footer>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};