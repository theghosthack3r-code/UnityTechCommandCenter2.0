import { Agent, Approval, AttentionItem, Integration, Run, Project } from './types';

export const MOCK_USER = { name: "Alex" };

export const MOCK_PROJECTS: Project[] = [];

export const MOCK_ATTENTION: AttentionItem[] = [];

export const MOCK_AGENTS: Agent[] = [];

export const MOCK_RUNS: Run[] = [];

export const MOCK_APPROVALS: Approval[] = [];

export const MOCK_INTEGRATIONS: Integration[] = [
  { id:"bird", name:"Bird", status:"Connected", icon: "message-circle" },
  { id:"twilio", name:"Twilio", status:"Not configured", icon: "message-circle" },
  { id:"telegram", name:"Telegram", status:"Connected", icon: "send" },
  { id:"discord", name:"Discord", status:"Connected", icon: "discord" },
  { id:"sns", name:"SNS", status:"Not configured", icon: "cloud-lightning" }
];
