import React, { useState, useEffect, useRef, useMemo } from 'react';
// FIX: Removed `LiveSession` as it is not an exported member of '@google/genai'.
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './icons';
import { type ChatMessage } from '../types';
import { blobToBase64, encode, decode, decodeAudioData } from '../utils';

// --- Gemini API Setup ---
// IMPORTANT: This key is sourced from the environment and must not be exposed in the UI.
const API_KEY = process.env.API_KEY as string;

// --- Main Assistant Screen ---
export const AIAssistantScreen: React.FC = () => {
  const [mode, setMode] = useState<'chat' | 'live'>('chat');

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
      <h1 className="text-xl font-semibold">AI Assistant</h1>
      <div className="flex flex-1 rounded-2xl border border-border bg-card shadow-lg">
        <aside className="w-64 border-r border-border p-4">
          <h2 className="px-2 text-sm font-semibold text-muted-foreground">Modes</h2>
          <nav className="mt-2 space-y-1">
            <ModeButton name="Chat" icon="message-square" activeMode={mode} setMode={() => setMode('chat')} />
            <ModeButton name="Live Talk" icon="mic" activeMode={mode} setMode={() => setMode('live')} />
          </nav>
        </aside>
        <div className="flex-1">
          {mode === 'chat' && <ChatPanel />}
          {mode === 'live' && <LivePanel />}
        </div>
      </div>
    </div>
  );
};

// --- Mode Components ---

const ModeButton: React.FC<{ name: string; icon: React.ComponentProps<typeof Icon>['name']; activeMode: string; setMode: () => void; }> = ({ name, icon, activeMode, setMode }) => (
  <button onClick={setMode} className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${activeMode === name.toLowerCase().split(' ')[0] ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground'}`}>
    <Icon name={icon} className="h-5 w-5" />
    <span>{name}</span>
  </button>
);

const ChatPanel: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [image, setImage] = useState<{b64: string, type: string} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isThinkingMode, setThinkingMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: API_KEY }), []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !image) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, image: image?.b64 };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setImage(null);
        setIsLoading(true);

        try {
            const contents: any[] = [{ text: input }];
            if(image) {
                contents.unshift({ inlineData: { data: image.b64, mimeType: image.type } });
            }
            
            const model = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
            const config = isThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

            const response = await ai.models.generateContent({
                model,
                contents: { parts: contents },
                config,
            });
            
            const modelMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error('Gemini API error:', error);
            const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const b64 = await blobToBase64(file);
            setImage({ b64, type: file.type });
        }
    };
    
    const handleTextToSpeech = async (text: string) => {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: { responseModalities: [Modality.AUDIO] },
            });
            
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContext.destination);
                // FIX: Per the error "Expected 1 arguments, but got 0", we ensure start() is called with an argument to begin playback immediately.
                source.start(0);
            }
        } catch (error) {
            console.error("TTS Error:", error);
        }
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20"><Icon name="sparkles" className="h-5 w-5 text-primary" /></div>}
                        <div className={`max-w-lg rounded-2xl p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-accent rounded-bl-none'}`}>
                           {msg.image && <img src={`data:image/png;base64,${msg.image}`} alt="user upload" className="mb-2 max-h-48 rounded-lg"/>}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.role === 'model' && !isLoading && (
                                <button onClick={() => handleTextToSpeech(msg.text)} className="mt-2 text-muted-foreground transition-colors hover:text-foreground"><Icon name="volume-2" className="h-4 w-4"/></button>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20"><Icon name="sparkles" className="h-5 w-5 text-primary" /></div>
                        <div className="max-w-lg rounded-2xl p-3 bg-accent rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground"></div>
                                <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.2s]"></div>
                                <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {image && (
                <div className="p-6 pt-0">
                    <div className="relative inline-block">
                        <img src={`data:image/png;base64,${image.b64}`} alt="preview" className="max-h-24 rounded-lg" />
                        <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 rounded-full bg-background p-0.5 text-muted-foreground ring-1 ring-border hover:text-foreground"><Icon name="x-circle" className="h-4 w-4"/></button>
                    </div>
                </div>
            )}
            <div className="border-t border-border p-4">
                <form onSubmit={handleSendMessage} className="relative">
                    <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSendMessage(e) }} placeholder="Type a message or upload an image..." className="w-full resize-none rounded-lg border-input bg-background/50 p-2 pr-24 text-sm focus:outline-none focus:ring-1 focus:ring-ring" rows={1}></textarea>
                    <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center space-x-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><Icon name="paperclip" className="h-4 w-4"/></button>
                        <button type="submit" disabled={isLoading} className="rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"><Icon name="send" className="h-4 w-4"/></button>
                    </div>
                </form>
                 <div className="mt-2 flex items-center justify-end">
                    <label className="flex items-center space-x-2 text-xs text-muted-foreground cursor-pointer">
                        <input type="checkbox" checked={isThinkingMode} onChange={() => setThinkingMode(!isThinkingMode)} className="h-3 w-3 rounded-sm accent-primary"/>
                        <span>Thinking Mode (gemini-2.5-pro)</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

const LivePanel: React.FC = () => {
    const [isLive, setIsLive] = useState(false);
    const [transcriptions, setTranscriptions] = useState<{user: string, model: string}[]>([]);
    const [currentTranscription, setCurrentTranscription] = useState({ user: '', model: '' });

    // FIX: Replaced `LiveSession` with `any` as it is not an exported type.
    const sessionPromise = useRef<Promise<any> | null>(null);
    const audioContextRefs = useRef<{input: AudioContext, output: AudioContext}>();
    const mediaStream = useRef<MediaStream | null>(null);
    const scriptProcessor = useRef<ScriptProcessorNode | null>(null);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: API_KEY }), []);

    const startSession = async () => {
        if (isLive) return;
        setIsLive(true);
        setTranscriptions([]);
        setCurrentTranscription({ user: '', model: '' });

        try {
            if (!audioContextRefs.current) {
                audioContextRefs.current = {
                    input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
                    output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 })
                }
            }
            mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            sessionPromise.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        const source = audioContextRefs.current!.input.createMediaStreamSource(mediaStream.current!);
                        scriptProcessor.current = audioContextRefs.current!.input.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = { data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)), mimeType: 'audio/pcm;rate=16000' };
                            sessionPromise.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor.current);
                        scriptProcessor.current.connect(audioContextRefs.current!.input.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            setCurrentTranscription(prev => ({...prev, model: prev.model + message.serverContent!.outputTranscription!.text}));
                        }
                        if (message.serverContent?.inputTranscription) {
                            setCurrentTranscription(prev => ({...prev, user: prev.user + message.serverContent!.inputTranscription!.text}));
                        }
                        if (message.serverContent?.turnComplete) {
                            setTranscriptions(prev => [...prev, currentTranscription]);
                            const prevTranscription = currentTranscription;
                            setCurrentTranscription({ user: '', model: '' });
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if(base64Audio) {
                            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRefs.current!.output, 24000, 1);
                            const source = audioContextRefs.current!.output.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioContextRefs.current!.output.destination);
                            // FIX: Pass 0 to start() to satisfy older API definitions that may require an argument.
                            source.start(0);
                        }
                    },
                    onerror: (e) => console.error('Live session error:', e),
                    onclose: () => console.log('Live session closed'),
                }
            });
        } catch (error) {
            console.error("Failed to start live session:", error);
            setIsLive(false);
        }
    };
    
    const stopSession = () => {
        if (!isLive) return;
        setIsLive(false);
        sessionPromise.current?.then(session => session.close());
        sessionPromise.current = null;
        scriptProcessor.current?.disconnect();
        mediaStream.current?.getTracks().forEach(track => track.stop());
    };
    
    return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <h2 className="text-lg font-semibold">Live Conversation</h2>
            <p className="mt-1 text-sm text-muted-foreground">Talk directly with the AI assistant in real-time.</p>
            <div className="my-8">
                <button onClick={isLive ? stopSession : startSession} className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-colors ${isLive ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}>
                    {isLive && <div className="absolute inset-0 h-full w-full animate-pulse rounded-full bg-rose-500/30"></div>}
                    <Icon name={isLive ? 'square' : 'mic'} className="h-10 w-10" />
                </button>
            </div>
             <div className="w-full max-w-lg h-48 overflow-y-auto rounded-lg bg-background p-4 text-left text-sm">
                {transcriptions.map((t, i) => (
                    <div key={i} className="space-y-2 mb-2">
                        {t.user && <p><strong className="text-primary">You:</strong> {t.user}</p>}
                        {t.model && <p><strong className="text-foreground">AI:</strong> {t.model}</p>}
                    </div>
                ))}
                 <div>
                    {currentTranscription.user && <p><strong className="text-primary">You:</strong> {currentTranscription.user}</p>}
                    {currentTranscription.model && <p><strong className="text-foreground">AI:</strong> {currentTranscription.model}</p>}
                </div>
            </div>
        </div>
    );
};