"use client";

import React, { useState, useEffect, useRef } from "react";
import { Project, Skill, Certification, api } from "../../hooks/useApi";

interface ConsoleProps {
    projects: Project[];
    skills: Skill[];
    certs: Certification[];
    isFallback: boolean;
    onSwitchToGui: () => void;
    adminToken: string | null;
    login: (token: string) => void;
    logout: () => void;
    refresh: () => void;
}

interface HistoryItem {
    id: string;
    type: "input" | "output";
    text: React.ReactNode;
}

export default function Console({ projects, skills, certs, isFallback, onSwitchToGui, adminToken, login, logout, refresh }: ConsoleProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [input, setInput] = useState("");
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [cmdIndex, setCmdIndex] = useState(-1);
    
    // Auth flow states
    const [isPromptingPassword, setIsPromptingPassword] = useState(false);
    
    const consoleEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const guiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isRoot = !!adminToken;
    const promptString = isRoot ? "root@portfolio:~#" : "george@portfolio:~$";
    const promptColor = isRoot ? "text-red-500" : "text-term-accent";

    const asciiLogo = String.raw`
   ______ ______ ____   ____   ______ ______   ______ ____   _   __ _____ ____   __     ___ 
  / ____// ____// __ \ / __ \ / ____// ____/  / ____// __ \ / | / // ___// __ \ / /    /   |
 / / __ / __/  / / / // /_/ // / __ / __/    / /    / / / //  |/ / \___// / / // /    / /| |
/ /_/ // /___ / /_/ // _, _// /_/ // /___   / /___ / /_/ // /|  / ____// / / //___   / ___ |
\____//_____/ \____//_/ |_| \____//_____/   \____/ \____//_/ |_|/_____/\____//_____//_/  |_|
`;

    useEffect(() => {
        setHistory([
            {
                id: "init-logo",
                type: "output",
                text: <pre className={`${promptColor} leading-none select-none text-[6px] sm:text-[8px] md:text-xs overflow-x-auto whitespace-pre max-w-full`}>{asciiLogo}</pre>
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
        if (consoleEndRef.current && typeof consoleEndRef.current.scrollIntoView === "function") {
            consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [history]);

    useEffect(() => {
        return () => {
            if (guiTimeoutRef.current) clearTimeout(guiTimeoutRef.current);
        };
    }, []);

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const trimmedCmd = input.trim();
            if (isPromptingPassword) {
                handlePasswordSubmit(trimmedCmd);
            } else if (trimmedCmd) {
                await executeCommand(trimmedCmd);
                setCmdHistory(prev => [trimmedCmd, ...prev].slice(0, 50));
                setCmdIndex(-1);
            }
            setInput("");
        } else if (e.key === "ArrowUp" && !isPromptingPassword) {
            e.preventDefault();
            if (cmdIndex < cmdHistory.length - 1) {
                const nextIndex = cmdIndex + 1;
                setCmdIndex(nextIndex);
                setInput(cmdHistory[nextIndex]);
            }
        } else if (e.key === "ArrowDown" && !isPromptingPassword) {
            e.preventDefault();
            if (cmdIndex > 0) {
                const nextIndex = cmdIndex - 1;
                setCmdIndex(nextIndex);
                setInput(cmdHistory[nextIndex]);
            } else if (cmdIndex === 0) {
                setCmdIndex(-1);
                setInput("");
            }
        } else if (e.key === "Tab" && !isPromptingPassword) {
            e.preventDefault();
            const commands = ["help", "whoami", "projects", "skills", "certs", "gui", "clear", "contact", "sudo su", "exit"];
            const match = commands.find(c => c.startsWith(input));
            if (match) {
                setInput(match);
            }
        }
    };

    const handlePasswordSubmit = (pwd: string) => {
        setIsPromptingPassword(false);
        if (pwd) {
            login(pwd);
            setHistory(prev => [...prev, {
                id: `output-${Date.now()}`,
                type: "output",
                text: <p className="text-term-green">Authenticated as root.</p>
            }]);
        } else {
            setHistory(prev => [...prev, {
                id: `output-${Date.now()}`,
                type: "output",
                text: <p className="text-term-red">su: Authentication failure</p>
            }]);
        }
    };

    const executeCommand = async (cmdText: string) => {
        const parts = cmdText.trim().split(/\s+/);
        const baseCmd = parts[0].toLowerCase();
        
        const newItems: HistoryItem[] = [
            {
                id: `input-${Date.now()}`,
                type: "input",
                text: (
                    <div className="flex items-center space-x-2">
                        <span className={promptColor}>{promptString}</span>
                        <span>{cmdText}</span>
                    </div>
                )
            }
        ];

        let outputText: React.ReactNode = null;

        try {
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
                            {isRoot && (
                                <>
                                    <p className="text-red-500 mt-2">Admin Commands:</p>
                                    <p className="grid grid-cols-4 gap-4 max-w-lg">
                                        <span className="font-bold text-red-400">rm</span>
                                        <span className="col-span-3">Remove an item: rm [project|skill|cert] [id]</span>
                                    </p>
                                    <p className="grid grid-cols-4 gap-4 max-w-lg">
                                        <span className="font-bold text-red-400">exit</span>
                                        <span className="col-span-3">Log out of root session.</span>
                                    </p>
                                </>
                            )}
                        </div>
                    );
                    break;
                case "whoami":
                    outputText = (
                        <div className="space-y-2 max-w-2xl">
                            <p className="text-term-accent font-bold">{isRoot ? "root" : "George Santana - Software Developer | DevOps"}</p>
                            <p className="leading-relaxed">
                                {isRoot ? "Superuser mode engaged." : "A highly versatile software developer with a strong focus on secure backend API engineering, containerized workflows, and production infrastructure."}
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
                                    <h3 className="font-bold text-term-green">{p.title} <span className="text-term-dim text-xs ml-2">ID: {p.id}</span> {p.featured && <span className="text-[10px] bg-term-accent/20 text-term-accent border border-term-accent/30 px-1 rounded">FEATURED</span>}</h3>
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
                                                <p key={s.id} className="grid grid-cols-4 max-w-2xl text-sm">
                                                    <span>• {s.name}</span>
                                                    <span className="text-term-amber">{brackets}</span>
                                                    <span className="text-term-dim">({s.level})</span>
                                                    <span className="text-term-dim text-xs text-right">ID: {s.id}</span>
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
                                    <span className="text-term-green font-bold">[{c.issueDate}]</span> {c.name} - <span className="text-term-dim">{c.issuer}</span> <span className="text-term-dim text-xs ml-2">ID: {c.id}</span>
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
                    if (parts[1] === "su") {
                        if (isRoot) {
                            outputText = <p className="text-term-green">Already root.</p>;
                        } else {
                            setIsPromptingPassword(true);
                            outputText = <p className="text-term-accent">Password:</p>;
                        }
                    } else {
                        outputText = <p className="text-term-red">sudo: {parts.slice(1).join(" ")}: command not found</p>;
                    }
                    break;
                case "exit":
                    if (isRoot) {
                        logout();
                        outputText = <p className="text-term-dim">logout</p>;
                    } else {
                        outputText = <p className="text-term-dim">exit</p>;
                    }
                    break;
                case "rm":
                    if (!isRoot) {
                        outputText = <p className="text-term-red">rm: Permission denied. Root privileges required.</p>;
                        break;
                    }
                    const [_, resourceType, id] = parts;
                    if (!resourceType || !id) {
                        outputText = <p className="text-term-red">Usage: rm [project|skill|cert] [id]</p>;
                        break;
                    }
                    if (resourceType === "project") {
                        await api.deleteProject(id, adminToken!);
                    } else if (resourceType === "skill") {
                        await api.deleteSkill(id, adminToken!);
                    } else if (resourceType === "cert") {
                        await api.deleteCert(id, adminToken!);
                    } else {
                        outputText = <p className="text-term-red">Unknown resource type: {resourceType}</p>;
                        break;
                    }
                    refresh();
                    outputText = <p className="text-term-green">Successfully removed {resourceType} {id}</p>;
                    break;
                default:
                    outputText = (
                        <p className="text-term-red">
                            bash: command not found: {baseCmd}. Type <span className="font-bold text-white underline">help</span> for assistance.
                        </p>
                    );
            }
        } catch (e: any) {
            outputText = <p className="text-term-red">Error: {e.message || "Request failed"}</p>;
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
                {!isPromptingPassword && <span className={`${promptColor} select-none prompt-glow`}>{promptString}</span>}
                <div className="flex-1 relative flex items-center">
                    <input
                        ref={inputRef}
                        type={isPromptingPassword ? "password" : "text"}
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
