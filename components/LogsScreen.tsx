import React, { useState } from 'react';
import { Icon } from './icons';

const mockLogs = {
  SMS: `[
  { "id": "sms-1", "timestamp": "2024-07-15T10:00:00Z", "to": "+15551234567", "status": "delivered", "body": "Your order #ABC-123 has shipped." },
  { "id": "sms-2", "timestamp": "2024-07-15T10:02:15Z", "to": "+15557654321", "status": "failed", "error": "Invalid phone number", "integration": "bird" }
]`,
  Consent: `[
  { "id": "con-1", "timestamp": "2024-07-14T09:30:10Z", "user_id": "user-123", "action": "subscribe", "channel": "sms" },
  { "id": "con-2", "timestamp": "2024-07-15T10:05:00Z", "user_id": "user-456", "action": "unsubscribe", "channel": "email", "reason": "user_preference" }
]`,
  App: `[
  { "id": "app-1", "timestamp": "2024-07-15T12:03:01Z", "level": "error", "agent": "OrderOps", "run_id": "r-003", "message": "Failed to process order #XYZ-789.", "details": { "error_code": 500, "api_endpoint": "https://api.inventory.com/v2/stock" } },
  { "id": "app-2", "timestamp": "2024-07-15T11:50:05Z", "level": "warn", "agent": "QA/SRE Agent", "message": "High latency detected in Finance Agent.", "details": { "latency_ms": 1200, "threshold_ms": 800 } },
  { "id": "app-3", "timestamp": "2024-07-15T10:21:10Z", "level": "info", "agent": "Executive Assistant", "run_id": "r-002", "message": "Run Succeeded.", "duration_s": 4 }
]`
};

type LogType = keyof typeof mockLogs;

export const LogsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<LogType>('App');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(JSON.parse(mockLogs[activeTab]), null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
            <h1 className="text-xl font-semibold">Logs</h1>
            <div className="flex flex-1 flex-col rounded-2xl border border-border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b border-border p-4">
                    <div className="flex space-x-1 sm:space-x-2">
                        {(Object.keys(mockLogs) as LogType[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${ activeTab === tab ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground' }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleCopy} className="flex items-center space-x-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                        <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4" />
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <pre className="text-xs">{JSON.stringify(JSON.parse(mockLogs[activeTab]), null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};
