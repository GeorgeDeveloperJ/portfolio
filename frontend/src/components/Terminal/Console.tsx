"use client";

import React, { useState, useEffect, useRef } from "react";
import { Project, Skill, Certification } from "../../hooks/useApi";

interface ConsoleProps {
    projects: Project[];
    skills: Skill[];
    certs: Certification[];
    isFallback: boolean;
    onSwitchToGui: () => void;
}

interface HistoryItem {
    id: string;
    type: "input" | "output";
    text: React.ReactNode;
}

export default function Console({ projects, skills, certs, isFallback, onSwitchToGui }: ConsoleProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [input, setInput] = useState("");
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [cmdIndex, setCmdIndex] = useState(-1);
    
    const consoleEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const guiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const asciiLogo = String.raw`
   ______ ______ ____   ____   ______ ______   ______ ____   _   __ _____ ____   __     ___ 
  / ____// ____// __ \ / __ \ / ____// ____/  / ____// __ \ / | / // ___// __ \ / /    /   |
 / / __ / __/  / / / // /_/ // / __ / __/    / /    / / / //  |/ / \___// / / // /    / /| |
/ /_/ // /___ / /_/ // _, _// /_/ // /___   / /___ / /_/ // /|  / ____/ / / // /___ / ___ |
\____//_____/ \____//_/ |_| \____//_____/   \____/ \____//_/ |_|/_____/ \____//_____//_/  |_|
`;

    // Initialize welcome screen
    useEffect(() => {
        setHistory([
            {
                id: "init-logo",
                type: "output",
                text: <pre className="text-term-accent leading-none select-none text-[6px] sm:text-[8px] md:text-xs overflow-x-auto whitespace-pre max-w-full">{asciiLogo}</pre>
            },
            {
                id: "init-welcome",
                type: "output",
                text: (
                    <div className="mt-4 space-y-1">
                        <p className="text-term-green">System status: ONLINE</p>
                        {isFallback && <p className="text-term-amber">[WARN] Running in localized offline cache mode.</p>}
                        <p>Welcome to George Santana's Portfolio CLI [v1.0.0]</p>
                        <p>Type <span className="text-term-accent font-bold">help</span> to view available commands, or <span className="text-term-accent font-bold">gui</span> to enter graphical dashboard mode.</p>
                        <p className="border-b border-term-border pb-2"></p>
                    </div>
                )
            }
        ]);
        focusInput();
    }, [isFallback]);

    useEffect(() => {
        // Auto scroll to bottom
        if (consoleEndRef.current && typeof consoleEndRef.current.scrollIntoView === "function") {
            consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [history]);

    useEffect(() => {
        return () => {
            if (guiTimeoutRef.current) {
                clearTimeout(guiTimeoutRef.current);
            }
        };
    }, []);

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const trimmedCmd = input.trim();
            if (trimmedCmd) {
                executeCommand(trimmedCmd);
                setCmdHistory(prev => [trimmedCmd, ...prev].slice(0, 50));
                setCmdIndex(-1);
            }
            setInput("");
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (cmdIndex < cmdHistory.length - 1) {
                const nextIndex = cmdIndex + 1;
                setCmdIndex(nextIndex);
                setInput(cmdHistory[nextIndex]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (cmdIndex > 0) {
                const nextIndex = cmdIndex - 1;
                setCmdIndex(nextIndex);
                setInput(cmdHistory[nextIndex]);
            } else if (cmdIndex === 0) {
                setCmdIndex(-1);
                setInput("");
            }
        } else if (e.key === "Tab") {
            e.preventDefault();
            const commands = ["help", "whoami", "projects", "skills", "certs", "gui", "clear", "contact"];
            const match = commands.find(c => c.startsWith(input));
            if (match) {
                setInput(match);
            }
        }
    };

    const executeCommand = (cmdText: string) => {
        const parts = cmdText.toLowerCase().split(" ");
        const baseCmd = parts[0];
        const newItems: HistoryItem[] = [
            {
                id: `input-${Date.now()}`,
                type: "input",
                text: (
                    <div className="flex items-center space-x-2">
                        <span className="text-term-accent">george@portfolio:~$</span>
                        <span>{cmdText}</span>
                    </div>
                )
            }
        ];

        let outputText: React.ReactNode = null;

        switch (baseCmd) {
            case "help":
                outputText = (
                    <div className="space-y-1">
                        <p className="text-term-accent">Available Commands:</p>
                        <p className="grid grid-cols-4 gap-4 max-w-lg">
                            <span className="font-bold text-term-green">whoami</span>
                            <span className="col-span-3">Display information about George.</span>
                        </p>
                        <p className="grid grid-cols-4 gap-4 max-w-lg">
                            <span className="font-bold text-term-green">projects</span>
                            <span className="col-span-3">List all portfolio developer projects.</span>
                        </p>
                        <p className="grid grid-cols-4 gap-4 max-w-lg">
                            <span className="font-bold text-term-green">skills</span>
                            <span className="col-span-3">List categories of professional skills.</span>
                        </p>
                        <p className="grid grid-cols-4 gap-4 max-w-lg">
                            <span className="font-bold text-term-green">certs</span>
                            <span className="col-span-3">List all verified certifications.</span>
                        </p>
                        <p className="grid grid-cols-4 gap-4 max-w-lg">
                            <span className="font-bold text-term-green">gui</span>
                            <span className="col-span-3">Switch from CLI mode to Visual Dashboard.</span>
                        </p>
                        <p className="grid grid-cols-4 gap-4 max-w-lg">
                            <span className="font-bold text-term-green">clear</span>
                            <span className="col-span-3">Clear all logs from this screen.</span>
                        </p>
                        <p className="grid grid-cols-4 gap-4 max-w-lg">
                            <span className="font-bold text-term-green">contact</span>
                            <span className="col-span-3">Show email, GitHub, and links.</span>
                        </p>
                    </div>
                );
                break;
            case "whoami":
                outputText = (
                    <div className="space-y-2 max-w-2xl">
                        <p className="text-term-accent font-bold">George Santana - Software Developer | DevOps</p>
                        <p className="leading-relaxed">
                            A highly versatile software developer with a strong focus on secure backend API engineering,
                            containerized workflows, and production infrastructure. Adept at building stable interfaces
                            and automating CI/CD orchestrations to deliver high availability and clean performance.
                        </p>
                    </div>
                );
                break;
            case "projects":
                if (projects.length === 0) {
                    outputText = <p className="text-term-dim">No projects found.</p>;
                    break;
                }
                outputText = (
                    <div className="space-y-4">
                        <p className="text-term-accent font-bold">Resolved Projects [{projects.length}]:</p>
                        {projects.map(p => (
                            <div key={p.id} className="border-l-2 border-term-border pl-4 space-y-1 py-1">
                                <h3 className="font-bold text-term-green">{p.title} {p.featured && <span className="text-[10px] bg-term-accent/20 text-term-accent border border-term-accent/30 px-1 rounded">FEATURED</span>}</h3>
                                <p className="max-w-xl text-term-dim text-sm">{p.description}</p>
                                <p className="text-xs text-term-amber">Tech Stack: {p.techStack.join(" | ")}</p>
                                {p.repoUrl && <p className="text-xs">Repo: <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-term-accent">{p.repoUrl}</a></p>}
                            </div>
                        ))}
                    </div>
                );
                break;
            case "skills":
                if (skills.length === 0) {
                    outputText = <p className="text-term-dim">No skills found.</p>;
                    break;
                }
                // Group skills
                const categories = Array.from(new Set(skills.map(s => s.category)));
                outputText = (
                    <div className="space-y-3">
                        <p className="text-term-accent font-bold">Skill Matrix:</p>
                        {categories.map(cat => (
                            <div key={cat} className="space-y-1">
                                <h3 className="text-term-green font-bold">{cat}</h3>
                                <div className="space-y-0.5">
                                    {skills.filter(s => s.category === cat).map(s => {
                                        const brackets = s.level === "Expert" ? "[==========]" : s.level === "Intermediate" ? "[=======...]" : "[====......]";
                                        return (
                                            <p key={s.id} className="grid grid-cols-3 max-w-md text-sm">
                                                <span>• {s.name}</span>
                                                <span className="text-term-amber">{brackets}</span>
                                                <span className="text-term-dim">({s.level})</span>
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                );
                break;
            case "certs":
                if (certs.length === 0) {
                    outputText = <p className="text-term-dim">No certifications found.</p>;
                    break;
                }
                outputText = (
                    <div className="space-y-2">
                        <p className="text-term-accent font-bold">Verified Credentials [{certs.length}]:</p>
                        {certs.map(c => (
                            <p key={c.id} className="text-sm">
                                <span className="text-term-green font-bold">[{c.issueDate}]</span> {c.name} - <span className="text-term-dim">{c.issuer}</span>
                                {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs underline text-term-accent hover:text-white">Verify</a>}
                            </p>
                        ))}
                    </div>
                );
                break;
            case "contact":
                outputText = (
                    <div className="space-y-1">
                        <p><span className="text-term-dim">Email:  </span> <a href="mailto:georgeasantanar@gmail.com" className="underline text-term-accent hover:text-white">georgeasantanar@gmail.com</a></p>
                        <p><span className="text-term-dim">GitHub: </span> <a href="https://github.com/GeorgeDeveloperJ" target="_blank" rel="noopener noreferrer" className="underline text-term-accent hover:text-white">github.com/GeorgeDeveloperJ</a></p>
                        <p><span className="text-term-dim">LinkedIn:</span> <a href="https://linkedin.com/in/georgedeveloperj" target="_blank" rel="noopener noreferrer" className="underline text-term-accent hover:text-white">linkedin.com/in/georgedeveloperj</a></p>
                    </div>
                );
                break;
            case "gui":
                outputText = <p className="text-term-green">Initializing graphical dashboard mode...</p>;
                guiTimeoutRef.current = setTimeout(() => {
                    onSwitchToGui();
                }, 500);
                break;
            case "clear":
                setHistory([]);
                return;
            case "sudo":
                outputText = <p className="text-term-red">Permission denied. George is the only administrator of this environment.</p>;
                break;
            default:
                outputText = (
                    <p className="text-term-red">
                        bash: command not found: {baseCmd}. Type <span className="font-bold text-white underline">help</span> for assistance.
                    </p>
                );
        }

        newItems.push({
            id: `output-${Date.now()}`,
            type: "output",
            text: outputText
        });

        setHistory(prev => [...prev, ...newItems].slice(-100));
    };

    return (
        <div 
            className="flex-1 flex flex-col bg-[#09090b] border border-term-border rounded p-4 font-mono text-[#f4f4f5] overflow-y-auto cursor-text text-left max-h-[70vh] sm:max-h-[75vh]"
            onClick={focusInput}
        >
            <div className="flex-1 space-y-2 select-text">
                {history.map(item => (
                    <div key={item.id} className="whitespace-pre-wrap leading-relaxed">
                        {item.text}
                    </div>
                ))}
                <div ref={consoleEndRef} />
            </div>

            {/* Input Row */}
            <div className="flex items-center space-x-2 mt-4 pt-2 border-t border-term-border/40 shrink-0">
                <span className="text-term-accent select-none prompt-glow">george@portfolio:~$</span>
                <div className="flex-1 relative flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full bg-transparent text-white border-none outline-none focus:ring-0 p-0 font-mono"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        aria-label="Terminal input"
                    />
                </div>
            </div>
        </div>
    );
}
