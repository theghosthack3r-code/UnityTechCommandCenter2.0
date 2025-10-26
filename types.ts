export type Page =
  | 'Overview'
  | 'Agents'
  | 'Power-ups'
  | 'Runs'
  | 'Approvals'
  | 'Integrations'
  | 'Logs'
  | 'Settings'
  | 'AI Assistant';

export type Department = 'Executive' | 'Operations' | 'Support' | 'Communications' | 'Marketing' | 'Finance' | 'Engineering' | 'Analytics';

export type AgentStatus = 'Online' | 'Warn' | 'Offline' | 'Unknown';

export interface ProjectAppearance {
  icon?: string;
  color?: string;
  bgImage?: string;
  theme?: 'dark' | 'light' | 'system';
  density?: 'comfortable' | 'compact';
  modules?: {
    showIntegrations?: boolean;
    showApprovals?: boolean;
    showRecentRuns?: boolean;
    showAttention?: boolean;
  };
}

export interface ProjectBranding {
  displayName?: string;
  tagline?: string;
}

// New Project-related types
export type ProjectStatus = 'On Track' | 'At Risk' | 'Blocked' | 'Pending';
export type ProjectOwnerDept = 'Core' | 'Engineering' | 'Marketing' | 'Finance' | 'Ops/HR';

export const PROJECT_STATUSES: ProjectStatus[] = ['On Track', 'At Risk', 'Blocked', 'Pending'];
export const PROJECT_OWNER_DEPTS: ProjectOwnerDept[] = ['Core', 'Engineering', 'Marketing', 'Finance', 'Ops/HR'];


// Merged Project type to support new features and existing dashboard
export interface Project {
  id: string; // uuid
  name: string;
  ownerDept: ProjectOwnerDept;
  status: ProjectStatus;
  progress: number; // 0..100
  description?: string;
  nextMilestone?: string;
  updatedAt?: string; // ISO
  risks?: string[];
  next_actions?: string[];
  links?: string[];

  // --- Fields from original type for compatibility ---
  icon?: string;
  color?: string;
  kpis?: { activeAgents: number; pendingApprovals: number; runsToday: number; deliverySuccessPct: number };
  appearance?: ProjectAppearance;
  branding?: ProjectBranding;
}


export interface Agent {
  id: string;
  name: string;
  department: Department;
  role: string;
  status: AgentStatus;
  description: string;
  lastRun: string;
  projectId?: string;
}

export type RunStatus = 'Succeeded' | 'Failed' | 'Running' | 'Pending';

export interface Run {
    id: string;
    type: 'Agent' | 'Power-up';
    name: string;
    status: RunStatus;
    duration: string;
    started: string;
    projectId?: string;
}

export type ApprovalStatus = 'Pending' | 'Approved' | 'Denied';

export interface Approval {
    id: string;
    subject: string;
    action: string;
    requested: string;
    status: ApprovalStatus;
    projectId?: string;
}

export interface Integration {
    id: 'bird' | 'twilio' | 'telegram' | 'discord' | 'sns';
    name: 'Bird' | 'Twilio' | 'Telegram' | 'Discord' | 'SNS';
    status: 'Connected' | 'Not configured';
    icon: string;
}

export interface AttentionItem {
    id: string;
    type: 'approval' | 'run' | 'spend' | 'inbound';
    priority: 'P1' | 'P2';
    title: string;
    hint: string;
    cta: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 image data
}
