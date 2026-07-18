"use client";

import React, { useState, useEffect } from "react";
import { usePortfolioData, useAuth } from "../hooks/useApi";
import Console from "../components/Terminal/Console";
import GuiView from "../components/GUI/GuiView";
import { Terminal, LayoutGrid, AlertCircle, Wifi, WifiOff } from "lucide-react";

export default function Home() {
    const { projects, skills, certs, loading, logs, isFallback, refresh } = usePortfolioData();
    const { adminToken, login, logout } = useAuth();
    const [viewMode, setViewMode] = useState<"cli" | "gui">("cli");
    const [progress, setProgress] = useState(0);

    // Simulate loader progress bars during fetching
    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 150);
            return () => clearInterval(interval);
        } else {
            setProgress(100);
        }
    }, [loading]);

    // Loading layout
    if (loading || progress < 100) {
        const barLength = Math.floor(progress / 5);
        const progressStr = "[" + "=".repeat(barLength) + " ".repeat(20 - barLength) + "]";
        
        return (
            <div className="flex-1 flex flex-col justify-center items-center bg-[#09090b] font-mono text-[#f4f4f5] px-4 min-h-screen">
                <div className="w-full max-w-xl space-y-4 text-left">
                    <h2 className="text-term-accent font-bold text-lg select-none">SYSTEM INGESTION INITIALIZING</h2>
                    <div className="bg-[#121214] border border-term-border rounded p-4 h-64 overflow-y-auto text-xs space-y-1">
                        {logs.map((log, index) => {
                            let color = "text-zinc-400";
                            if (log.startsWith("[SUCCESS]")) color = "text-term-green";
                            if (log.startsWith("[ERROR]")) color = "text-term-red";
                            if (log.startsWith("[WARN]")) color = "text-term-amber";
                            return <p key={index} className={color}>{log}</p>;
                        })}
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-term-dim">Decompressing components...</p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-term-green font-bold">{progressStr}</span>
                            <span className="text-term-accent">{progress}%</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#09090b] font-mono text-[#f4f4f5] min-h-screen relative selection:bg-term-accent/30 selection:text-white">
            {/* CRT scanline simulation overlay */}
            <div className="crt-overlay" />

            {/* Header */}
            <header className="border-b border-term-border/80 bg-[#121214] py-3 px-6 flex items-center justify-between select-none">
                <div className="flex items-center space-x-2 text-sm">
                    <Terminal size={16} className="text-term-accent" />
                    <span className="font-bold text-term-green">GEORGE_SANTANA_PORTFOLIO</span>
                </div>
                
                {/* View Toggles */}
                <div className="flex items-center border border-term-border rounded bg-[#09090b] p-0.5 text-xs">
                    <button
                        onClick={() => setViewMode("cli")}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-colors ${
                            viewMode === "cli" 
                            ? "bg-term-border text-white font-bold" 
                            : "text-term-dim hover:text-white"
                        }`}
                        aria-label="CLI Mode"
                    >
                        <Terminal size={12} />
                        <span>CLI</span>
                    </button>
                    <button
                        onClick={() => setViewMode("gui")}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-colors ${
                            viewMode === "gui" 
                            ? "bg-term-border text-white font-bold" 
                            : "text-term-dim hover:text-white"
                        }`}
                        aria-label="GUI Mode"
                    >
                        <LayoutGrid size={12} />
                        <span>GUI</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center space-y-6">
                
                {/* Visual view toggler alert in case they are in CLI */}
                {viewMode === "cli" && (
                    <div className="flex items-center space-x-2 text-xs border border-term-border bg-[#121214] py-2 px-3 rounded text-term-dim text-left">
                        <AlertCircle size={12} className="text-term-amber shrink-0" />
                        <span>
                            You are in raw CLI mode. Click on the terminal to focus. Type <span className="text-term-accent underline font-bold cursor-pointer" onClick={() => setViewMode("gui")}>gui</span> or use the button above to switch to a visual layout.
                        </span>
                    </div>
                )}

                {/* Sub-Views container */}
                <div className="flex-1 flex flex-col">
                    {viewMode === "cli" ? (
                        <Console
                            projects={projects}
                            skills={skills}
                            certs={certs}
                            isFallback={isFallback}
                            onSwitchToGui={() => setViewMode("gui")}
                            adminToken={adminToken}
                            login={login}
                            logout={logout}
                            refresh={refresh}
                        />
                    ) : (
                        <GuiView
                            projects={projects}
                            skills={skills}
                            certs={certs}
                            adminToken={adminToken}
                            refresh={refresh}
                            logout={logout}
                        />
                    )}
                </div>
            </main>

            {/* Footer status bar */}
            <footer className="border-t border-term-border bg-[#121214] py-1.5 px-6 flex items-center justify-between text-[10px] text-term-dim select-none font-mono">
                <div className="flex items-center space-x-4">
                    <span>SYS_ENV: v1.0.0</span>
                    <span className="hidden sm:inline">BRANCH: main*</span>
                    <span className="flex items-center space-x-1">
                        {isFallback ? (
                            <>
                                <WifiOff size={10} className="text-term-red" />
                                <span>OFFLINE CACHE</span>
                            </>
                        ) : (
                            <>
                                <Wifi size={10} className="text-term-green animate-pulse" />
                                <span>DB SYNCED</span>
                            </>
                        )}
                    </span>
                </div>
                <div>
                    <span>PRESS ESC OR CLI TO TYPE</span>
                </div>
            </footer>
        </div>
    );
}
