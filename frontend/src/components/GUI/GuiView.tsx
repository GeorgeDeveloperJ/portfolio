"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Terminal, Cpu, Award, User, Mail, Calendar } from "lucide-react";
import { Project, Skill, Certification } from "../../hooks/useApi";
import { getSkillCategories } from "../../utils/grouping";

interface GuiViewProps {
    projects: Project[];
    skills: Skill[];
    certs: Certification[];
}

interface WindowWrapperProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

function GithubIcon({ size = 16 }: { size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    );
}

function WindowWrapper({ title, icon, children }: WindowWrapperProps) {
    return (
        <motion.div 
            className="bg-term-card-bg border border-term-border rounded shadow-lg overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ borderColor: "rgba(34, 211, 238, 0.4)" }}
        >
            {/* Header window bar */}
            <div className="bg-[#121214] border-b border-term-border px-3 py-2 flex items-center justify-between select-none">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-term-red/80"></div>
                    <div className="w-3 h-3 rounded-full bg-term-amber/80"></div>
                    <div className="w-3 h-3 rounded-full bg-term-green/80"></div>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-term-dim font-mono">
                    {icon}
                    <span>{title}</span>
                </div>
                <div className="w-12"></div> {/* Spacer to center the title */}
            </div>
            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col text-left font-mono">
                {children}
            </div>
        </motion.div>
    );
}

export default function GuiView({ projects, skills, certs }: GuiViewProps) {
    const categories = getSkillCategories(skills);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* COLUMN 1: Profile & Skills */}
            <div className="md:col-span-1 space-y-6">
                
                {/* Profile Window */}
                <WindowWrapper title="profile.sh" icon={<User size={12} className="text-term-accent" />}>
                    <div className="space-y-4">
                        <div className="border border-term-border/60 bg-[#121214] p-3 rounded text-center">
                            <h2 className="text-lg font-bold text-term-accent">George Santana</h2>
                            <p className="text-xs text-term-dim">Software Developer | DevOps</p>
                        </div>
                        <p className="text-sm leading-relaxed text-[#d4d4d8]">
                            Versatile engineer focused on secure, containerized backend pipelines, database integrations, and high-availability operations.
                        </p>
                        <div className="border-t border-term-border/40 pt-4 space-y-2 text-sm">
                            <a href="mailto:georgeasantanar@gmail.com" className="flex items-center space-x-2 text-term-dim hover:text-term-accent transition-colors">
                                <Mail size={14} />
                                <span>georgeasantanar@gmail.com</span>
                            </a>
                            <a href="https://github.com/GeorgeDeveloperJ" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-term-dim hover:text-term-accent transition-colors">
                                <GithubIcon size={14} />
                                <span>GeorgeDeveloperJ</span>
                            </a>
                            <a href="https://linkedin.com/in/georgedeveloperj" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-term-dim hover:text-term-accent transition-colors">
                                <LinkedinIcon size={14} />
                                <span>georgedeveloperj</span>
                            </a>
                        </div>
                    </div>
                </WindowWrapper>

                {/* Skills Window */}
                <WindowWrapper title="skills.json" icon={<Cpu size={12} className="text-term-green" />}>
                    <div className="space-y-4">
                        {skills.length === 0 ? (
                            <p className="text-term-dim text-sm italic">No skills documented yet.</p>
                        ) : (
                            categories.map(cat => (
                            <div key={cat} className="space-y-1.5">
                                <h3 className="text-sm font-bold text-term-green border-b border-term-border/40 pb-1">{cat}</h3>
                                <div className="space-y-1">
                                    {skills.filter(s => s.category === cat).map(s => {
                                        const brackets = s.level === "Expert" ? "[==========]" : s.level === "Intermediate" ? "[=======...]" : "[====......]";
                                        return (
                                            <div key={s.id} className="text-xs flex items-center justify-between font-mono">
                                                <span className="text-zinc-300">{s.name}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-term-amber">{brackets}</span>
                                                    <span className="text-term-dim text-[10px] w-20 text-right">({s.level})</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                        )}
                    </div>
                </WindowWrapper>
            </div>

            {/* COLUMN 2 & 3: Projects & Certifications */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Projects Window */}
                <WindowWrapper title="projects.bin" icon={<Terminal size={12} className="text-term-amber" />}>
                    <div className="space-y-6">
                        <p className="text-xs text-term-dim mb-2">// Active projects compiled from TypeORM registry</p>
                        {projects.length === 0 ? (
                            <p className="text-term-dim text-sm italic mt-4">No projects available.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {projects.map(p => (
                                <div 
                                    key={p.id} 
                                    className="border border-term-border/60 bg-[#121214]/60 p-4 rounded flex flex-col justify-between hover:border-term-accent/40 hover:bg-[#121214] transition-all"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between">
                                            <h3 className="text-sm font-bold text-term-green">{p.title}</h3>
                                            {p.featured && (
                                                <span className="text-[9px] bg-term-accent/10 text-term-accent border border-term-accent/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                    featured
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                                            {p.description}
                                        </p>
                                    </div>
                                    <div className="space-y-3 mt-4 pt-3 border-t border-term-border/20">
                                        <div className="flex flex-wrap gap-1">
                                            {p.techStack.map(t => (
                                                <span key={t} className="text-[10px] bg-term-border/60 text-zinc-300 border border-term-border px-1.5 py-0.2 rounded">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                        {p.repoUrl && (
                                            <a 
                                                href={p.repoUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-[11px] text-term-accent flex items-center space-x-1 hover:underline self-start"
                                            >
                                                <span>Source Code</span>
                                                <ExternalLink size={10} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </WindowWrapper>

                {/* Certifications Window */}
                <WindowWrapper title="certifications.crt" icon={<Award size={12} className="text-term-accent" />}>
                    <div className="space-y-4">
                        {certs.length === 0 ? (
                            <p className="text-term-dim text-sm italic">No verified credentials found.</p>
                        ) : (
                            <div className="divide-y divide-term-border/40">
                            {certs.map(c => (
                                <div key={c.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-term-green">{c.name}</h4>
                                        <p className="text-xs text-term-dim flex items-center space-x-1.5">
                                            <span>Issued by {c.issuer}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3 text-xs">
                                        <span className="text-term-amber flex items-center space-x-1 text-dim">
                                            <Calendar size={12} />
                                            <span>{c.issueDate}</span>
                                        </span>
                                        {c.credentialUrl && (
                                            <a 
                                                href={c.credentialUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-term-accent flex items-center space-x-0.5 hover:underline"
                                            >
                                                <span>Verify</span>
                                                <ExternalLink size={10} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </WindowWrapper>

            </div>
        </div>
    );
}
