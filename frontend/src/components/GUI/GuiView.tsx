"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Terminal, Cpu, Award, User, Mail, Calendar, Edit, Trash2, Plus, LogOut, X } from "lucide-react";
import { Project, Skill, Certification, api } from "../../hooks/useApi";
import { getSkillCategories } from "../../utils/grouping";

interface GuiViewProps {
    projects: Project[];
    skills: Skill[];
    certs: Certification[];
    adminToken?: string | null;
    refresh?: () => void;
    logout?: () => void;
}

interface WindowWrapperProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    action?: React.ReactNode;
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

function WindowWrapper({ title, icon, children, action }: WindowWrapperProps) {
    return (
        <motion.div 
            className="bg-term-card-bg border border-term-border rounded shadow-lg overflow-hidden flex flex-col relative group"
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
                <div className="flex items-center justify-end min-w-[48px]">
                    {action}
                </div>
            </div>
            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col text-left font-mono">
                {children}
            </div>
        </motion.div>
    );
}

function AdminModal({ isOpen, onClose, title, onSubmit, children }: { isOpen: boolean, onClose: () => void, title: string, onSubmit: (e: React.FormEvent) => void, children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-term-card-bg border border-term-accent/50 rounded p-6 w-full max-w-md shadow-2xl relative shadow-term-accent/10"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-term-dim hover:text-term-accent transition-colors">
                        <X size={20} />
                    </button>
                    <h3 className="text-xl font-bold text-term-accent mb-6">~/{title.toLowerCase().replace(' ', '_')}.sh</h3>
                    <form onSubmit={onSubmit} className="space-y-4">
                        {children}
                        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-term-border">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-transparent border border-term-border text-term-dim hover:text-white transition-colors">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded bg-term-accent/20 text-term-accent border border-term-accent/50 hover:bg-term-accent/30 transition-colors">Execute</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default function GuiView({ projects, skills, certs, adminToken, refresh, logout }: GuiViewProps) {
    const categories = getSkillCategories(skills);
    const isAdmin = !!adminToken;

    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'project' | 'skill' | 'cert'; mode: 'add' | 'edit'; data: any } | null>(null);

    const handleDelete = async (type: 'project' | 'skill' | 'cert', id: string) => {
        if (!isAdmin || !window.confirm("Are you sure you want to execute rm on this item?")) return;
        try {
            if (type === 'project') await api.deleteProject(id, adminToken);
            if (type === 'skill') await api.deleteSkill(id, adminToken);
            if (type === 'cert') await api.deleteCert(id, adminToken);
            if (refresh) refresh();
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalConfig || !isAdmin) return;
        
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data: any = Object.fromEntries(formData.entries());

        if (modalConfig.type === 'project') {
            data.techStack = (data.techStack as string).split(',').map(s => s.trim());
            data.featured = data.featured === 'on';
        }
        if (modalConfig.type === 'skill') {
            data.level = data.level as string;
        }

        try {
            if (modalConfig.mode === 'add') {
                if (modalConfig.type === 'project') await api.createProject(data, adminToken);
                if (modalConfig.type === 'skill') await api.createSkill(data, adminToken);
                if (modalConfig.type === 'cert') await api.createCert(data, adminToken);
            } else {
                if (modalConfig.type === 'project') await api.updateProject(modalConfig.data.id, data, adminToken);
                if (modalConfig.type === 'skill') await api.updateSkill(modalConfig.data.id, data, adminToken);
                if (modalConfig.type === 'cert') await api.updateCert(modalConfig.data.id, data, adminToken);
            }
            if (refresh) refresh();
            setModalConfig(null);
        } catch (error: any) {
            alert(`Failed to execute: ${error.message}`);
        }
    };

    const inputStyles = "w-full bg-[#121214] border border-term-border rounded px-3 py-2 text-white focus:border-term-accent outline-none transition-colors text-sm font-mono";

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            
            {/* COLUMN 1: Profile & Skills */}
            <div className="md:col-span-1 space-y-6">
                
                {/* Profile Window */}
                <WindowWrapper 
                    title="profile.sh" 
                    icon={<User size={12} className="text-term-accent" />}
                    action={isAdmin ? <button onClick={logout} className="text-term-red hover:text-red-400 transition-colors opacity-50 hover:opacity-100" title="Logout"><LogOut size={14} /></button> : null}
                >
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
                <WindowWrapper 
                    title="skills.json" 
                    icon={<Cpu size={12} className="text-term-accent" />}
                    action={isAdmin ? <button onClick={() => setModalConfig({ isOpen: true, type: 'skill', mode: 'add', data: null })} className="text-term-accent hover:text-white transition-colors opacity-70 hover:opacity-100"><Plus size={14} /></button> : null}
                >
                    <div className="space-y-5">
                        {categories.map((cat, i) => (
                            <motion.div 
                                key={cat} 
                                className="space-y-2"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                            >
                                <h3 className="text-xs font-bold text-term-green">{cat}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.filter(s => s.category === cat).map(s => (
                                        <div key={s.id} className="group/skill relative bg-[#121214] border border-term-border rounded px-2 py-1 text-xs text-term-dim flex items-center space-x-2 hover:border-term-accent/50 transition-colors">
                                            <span>{s.name}</span>
                                            {isAdmin && (
                                                <button onClick={() => handleDelete('skill', s.id)} className="hidden group-hover/skill:block text-term-red ml-1 hover:text-red-400"><Trash2 size={10} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </WindowWrapper>

            </div>

            {/* COLUMN 2 & 3: Projects & Certs */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Projects Window */}
                <WindowWrapper 
                    title="projects.md" 
                    icon={<Terminal size={12} className="text-term-accent" />}
                    action={isAdmin ? <button onClick={() => setModalConfig({ isOpen: true, type: 'project', mode: 'add', data: null })} className="text-term-accent hover:text-white transition-colors opacity-70 hover:opacity-100"><Plus size={14} /></button> : null}
                >
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {projects.map((p, i) => (
                            <motion.div 
                                key={p.id}
                                className="group/project border-l-2 border-term-border pl-4 py-2 hover:border-term-accent transition-colors relative"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                            >
                                {isAdmin && (
                                    <div className="absolute top-0 right-2 opacity-0 group-hover/project:opacity-100 transition-opacity">
                                        <button onClick={() => handleDelete('project', p.id)} className="text-term-red hover:text-red-400"><Trash2 size={14} /></button>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-bold text-term-green">{p.title}</h3>
                                    {p.featured && <span className="text-[10px] bg-term-accent/20 text-term-accent border border-term-accent/30 px-1 rounded">FEATURED</span>}
                                </div>
                                <p className="text-sm text-term-dim mb-3 line-clamp-3">{p.description}</p>
                                <p className="text-xs text-term-amber mb-2">Tech Stack: {p.techStack.join(" | ")}</p>
                                {p.repoUrl && (
                                    <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-xs text-term-accent hover:text-white underline transition-colors">
                                        <span>Repository</span>
                                        <ExternalLink size={10} />
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </WindowWrapper>

                {/* Certifications Window */}
                <WindowWrapper 
                    title="certifications.list" 
                    icon={<Award size={12} className="text-term-accent" />}
                    action={isAdmin ? <button onClick={() => setModalConfig({ isOpen: true, type: 'cert', mode: 'add', data: null })} className="text-term-accent hover:text-white transition-colors opacity-70 hover:opacity-100"><Plus size={14} /></button> : null}
                >
                    <div className="space-y-4">
                        {certs.map((c, i) => (
                            <motion.div 
                                key={c.id}
                                className="group/cert flex items-center justify-between p-3 border border-term-border bg-[#121214] rounded hover:border-term-accent/50 transition-colors"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                            >
                                <div>
                                    <h4 className="font-bold text-term-green text-sm">[{c.issueDate}] {c.name}</h4>
                                    <p className="text-xs text-term-dim mt-0.5">{c.issuer}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {c.credentialUrl && (
                                        <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline text-term-accent hover:text-white transition-colors flex items-center space-x-1">
                                            <span>Verify</span>
                                        </a>
                                    )}
                                    {isAdmin && (
                                        <button onClick={() => handleDelete('cert', c.id)} className="text-term-red opacity-0 group-hover/cert:opacity-100 transition-opacity hover:text-red-400"><Trash2 size={14} /></button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </WindowWrapper>
            </div>

            {/* Modals */}
            <AdminModal 
                isOpen={modalConfig?.isOpen && modalConfig.type === 'project' || false} 
                onClose={() => setModalConfig(null)} 
                title={`${modalConfig?.mode === 'add' ? 'Add' : 'Edit'} Project`}
                onSubmit={handleFormSubmit}
            >
                <div className="space-y-3">
                    <input name="title" placeholder="Project Title" required className={inputStyles} />
                    <textarea name="description" placeholder="Description" required rows={3} className={inputStyles}></textarea>
                    <input name="techStack" placeholder="Tech Stack (comma separated)" required className={inputStyles} />
                    <input name="repoUrl" placeholder="Repository URL" className={inputStyles} />
                    <label className="flex items-center space-x-2 text-term-dim text-sm cursor-pointer">
                        <input type="checkbox" name="featured" className="rounded border-term-border bg-[#121214] text-term-accent focus:ring-term-accent" />
                        <span>Featured Project</span>
                    </label>
                </div>
            </AdminModal>

            <AdminModal 
                isOpen={modalConfig?.isOpen && modalConfig.type === 'skill' || false} 
                onClose={() => setModalConfig(null)} 
                title={`${modalConfig?.mode === 'add' ? 'Add' : 'Edit'} Skill`}
                onSubmit={handleFormSubmit}
            >
                <div className="space-y-3">
                    <input name="name" placeholder="Skill Name" required className={inputStyles} />
                    <input name="category" placeholder="Category (e.g. Backend, Frontend)" required className={inputStyles} />
                    <select name="level" required className={`${inputStyles} appearance-none`}>
                        <option value="Beginner" className="bg-[#121214] text-white">Beginner</option>
                        <option value="Intermediate" className="bg-[#121214] text-white">Intermediate</option>
                        <option value="Expert" className="bg-[#121214] text-white">Expert</option>
                    </select>
                </div>
            </AdminModal>

            <AdminModal 
                isOpen={modalConfig?.isOpen && modalConfig.type === 'cert' || false} 
                onClose={() => setModalConfig(null)} 
                title={`${modalConfig?.mode === 'add' ? 'Add' : 'Edit'} Certification`}
                onSubmit={handleFormSubmit}
            >
                <div className="space-y-3">
                    <input name="name" placeholder="Certification Name" required className={inputStyles} />
                    <input name="issuer" placeholder="Issuer (e.g. AWS, Google)" required className={inputStyles} />
                    <input name="issueDate" placeholder="Issue Date (YYYY-MM)" required className={inputStyles} />
                    <input name="credentialUrl" placeholder="Credential URL" className={inputStyles} />
                </div>
            </AdminModal>

        </div>
    );
}
