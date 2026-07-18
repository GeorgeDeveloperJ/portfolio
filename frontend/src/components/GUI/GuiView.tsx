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
            className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col relative group"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ borderColor: "rgba(34, 211, 238, 0.4)" }}
        >
            {/* Header window bar */}
            <div className="bg-black/40 border-b border-white/5 px-4 py-3 flex items-center justify-between select-none">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400 font-medium tracking-wide">
                    {icon}
                    <span>{title}</span>
                </div>
                <div className="flex items-center min-w-[48px] justify-end">
                    {action}
                </div>
            </div>
            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col text-left">
                {children}
            </div>
        </motion.div>
    );
}

// Minimal Admin Modal
function AdminModal({ isOpen, onClose, title, onSubmit, children }: { isOpen: boolean, onClose: () => void, title: string, onSubmit: (e: React.FormEvent) => void, children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#09090b] border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                    <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
                    <form onSubmit={onSubmit} className="space-y-4">
                        {children}
                        <div className="flex justify-end space-x-3 mt-8">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">Save</button>
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

    // Local State for Modals
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'project' | 'skill' | 'cert'; mode: 'add' | 'edit'; data: any } | null>(null);

    const handleDelete = async (type: 'project' | 'skill' | 'cert', id: string) => {
        if (!isAdmin || !window.confirm("Are you sure you want to delete this item?")) return;
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

        // Basic formatting
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
            alert(`Failed to save: ${error.message}`);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* COLUMN 1: Profile & Skills */}
            <div className="md:col-span-1 space-y-6">
                
                {/* Profile Window */}
                <WindowWrapper 
                    title="profile.yaml" 
                    icon={<User size={14} className="text-cyan-400" />}
                    action={isAdmin ? <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors" title="Logout"><LogOut size={16} /></button> : null}
                >
                    <div className="space-y-5">
                        <div className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-black/60 to-black/20 p-5 rounded-xl text-center group-hover:border-cyan-500/30 transition-colors">
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">George Santana</h2>
                            <p className="text-sm text-gray-400 mt-1">Software Developer | DevOps</p>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-300">
                            Versatile engineer focused on secure, containerized backend pipelines, database integrations, and high-availability operations.
                        </p>
                        <div className="border-t border-white/10 pt-5 space-y-3 text-sm">
                            <a href="mailto:georgeasantanar@gmail.com" className="flex items-center space-x-3 text-gray-400 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-white/5">
                                <Mail size={16} />
                                <span>georgeasantanar@gmail.com</span>
                            </a>
                            <a href="https://github.com/GeorgeDeveloperJ" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-white/5">
                                <GithubIcon size={16} />
                                <span>GeorgeDeveloperJ</span>
                            </a>
                            <a href="https://linkedin.com/in/georgedeveloperj" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-white/5">
                                <LinkedinIcon size={16} />
                                <span>georgedeveloperj</span>
                            </a>
                        </div>
                    </div>
                </WindowWrapper>

                {/* Skills Window */}
                <WindowWrapper 
                    title="skills.json" 
                    icon={<Cpu size={14} className="text-cyan-400" />}
                    action={isAdmin ? <button onClick={() => setModalConfig({ isOpen: true, type: 'skill', mode: 'add', data: null })} className="text-cyan-400 hover:text-cyan-300 transition-colors"><Plus size={16} /></button> : null}
                >
                    <div className="space-y-6">
                        {categories.map((cat, i) => (
                            <motion.div 
                                key={cat} 
                                className="space-y-2"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                            >
                                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">{cat}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.filter(s => s.category === cat).map(s => (
                                        <div key={s.id} className="group/skill relative bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-3 py-1.5 text-xs text-gray-300 transition-colors flex items-center space-x-2">
                                            <span>{s.name}</span>
                                            {isAdmin && (
                                                <div className="hidden group-hover/skill:flex items-center space-x-1 pl-2 border-l border-white/10">
                                                    <button onClick={() => handleDelete('skill', s.id)} className="text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                                                </div>
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
                    icon={<Terminal size={14} className="text-cyan-400" />}
                    action={isAdmin ? <button onClick={() => setModalConfig({ isOpen: true, type: 'project', mode: 'add', data: null })} className="text-cyan-400 hover:text-cyan-300 transition-colors"><Plus size={16} /></button> : null}
                >
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {projects.map((p, i) => (
                            <motion.div 
                                key={p.id}
                                className="group/project border border-white/10 bg-white/5 rounded-xl p-5 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * i }}
                            >
                                {isAdmin && (
                                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover/project:opacity-100 transition-opacity z-10">
                                        <button onClick={() => handleDelete('project', p.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30"><Trash2 size={14} /></button>
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-bold text-lg text-white group-hover/project:text-cyan-400 transition-colors flex items-center space-x-2">
                                        <span>{p.title}</span>
                                        {p.featured && <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">Featured</span>}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-400 mb-5 leading-relaxed line-clamp-3">{p.description}</p>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {p.techStack.map(tech => (
                                        <span key={tech} className="text-[10px] px-2 py-1 bg-black/40 border border-white/10 text-gray-300 rounded-md">{tech}</span>
                                    ))}
                                </div>
                                {p.repoUrl && (
                                    <div className="mt-auto pt-4 border-t border-white/10">
                                        <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                                            <GithubIcon size={12} />
                                            <span>View Repository</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </WindowWrapper>

                {/* Certifications Window */}
                <WindowWrapper 
                    title="certifications.lock" 
                    icon={<Award size={14} className="text-cyan-400" />}
                    action={isAdmin ? <button onClick={() => setModalConfig({ isOpen: true, type: 'cert', mode: 'add', data: null })} className="text-cyan-400 hover:text-cyan-300 transition-colors"><Plus size={16} /></button> : null}
                >
                    <div className="space-y-3">
                        {certs.map((c, i) => (
                            <motion.div 
                                key={c.id}
                                className="group/cert flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-white/5 bg-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg text-cyan-400">
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-200 group-hover/cert:text-cyan-400 transition-colors">{c.name}</h4>
                                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                            <span>{c.issuer}</span>
                                            <span className="flex items-center space-x-1"><Calendar size={10} /> <span>{c.issueDate}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                                    {c.credentialUrl && (
                                        <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors flex items-center space-x-1.5">
                                            <span>Verify</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    )}
                                    {isAdmin && (
                                        <button onClick={() => handleDelete('cert', c.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 opacity-0 group-hover/cert:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </WindowWrapper>
            </div>

            {/* Modal Renderers */}
            <AdminModal 
                isOpen={modalConfig?.isOpen && modalConfig.type === 'project' || false} 
                onClose={() => setModalConfig(null)} 
                title={`${modalConfig?.mode === 'add' ? 'Add' : 'Edit'} Project`}
                onSubmit={handleFormSubmit}
            >
                <div className="space-y-3">
                    <input name="title" placeholder="Project Title" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors" />
                    <textarea name="description" placeholder="Description" required rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors"></textarea>
                    <input name="techStack" placeholder="Tech Stack (comma separated)" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors" />
                    <input name="repoUrl" placeholder="Repository URL" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors" />
                    <label className="flex items-center space-x-2 text-gray-300">
                        <input type="checkbox" name="featured" className="rounded border-white/10 bg-black/40 text-cyan-500 focus:ring-cyan-500" />
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
                    <input name="name" placeholder="Skill Name" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors" />
                    <input name="category" placeholder="Category (e.g. Backend, Frontend)" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors" />
                    <select name="level" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors appearance-none">
                        <option value="Beginner" className="bg-black text-white">Beginner</option>
                        <option value="Intermediate" className="bg-black text-white">Intermediate</option>
                        <option value="Expert" className="bg-black text-white">Expert</option>
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
                    <input name="name" placeholder="Certification Name" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors" />
                    <input name="issuer" placeholder="Issuer (e.g. AWS, Google)" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors" />
                    <input name="issueDate" placeholder="Issue Date (YYYY-MM)" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors" />
                    <input name="credentialUrl" placeholder="Credential URL" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none transition-colors" />
                </div>
            </AdminModal>

        </div>
    );
}
