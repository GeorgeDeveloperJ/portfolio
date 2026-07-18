import { useState, useEffect, useCallback } from 'react';
import { Project, Skill, Certification, fallbackProjects, fallbackSkills, fallbackCertifications } from '../lib/fallbackData';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.warn('[useApi] NEXT_PUBLIC_API_URL is not set. Using static fallback data only.');
}

// --- Auth Hook ---
export function useAuth() {
    const [adminToken, setAdminTokenState] = useState<string | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('admin_token');
        if (stored) setAdminTokenState(stored);
    }, []);

    const login = async (token: string) => {
        try {
            const res = await fetch(`${API_URL}/admin/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                sessionStorage.setItem('admin_token', token);
                setAdminTokenState(token);
                return true;
            }
        } catch (e) {
            console.error("Login error:", e);
        }
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem('admin_token');
        setAdminTokenState(null);
    };

    return { adminToken, login, logout };
}

// --- Data Fetching Hook ---
export function usePortfolioData() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [certs, setCerts] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);
    const [isFallback, setIsFallback] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        async function fetchData() {
            if (!active) return;
            if (refreshTrigger === 0) {
                setLogs(prev => [...prev, `[INFO] Initializing connection to API Gateway: ${API_URL}`, "[INFO] Resolving collections [projects, skills, certifications]..."]);
            }
            
            try {
                const [projRes, skillRes, certRes] = await Promise.all([
                    fetch(`${API_URL}/projects`, { signal: controller.signal }),
                    fetch(`${API_URL}/skills`, { signal: controller.signal }),
                    fetch(`${API_URL}/certifications`, { signal: controller.signal })
                ]);
                
                clearTimeout(timeoutId);

                if (!projRes.ok || !skillRes.ok || !certRes.ok) throw new Error("HTTP response error");

                const projs = await projRes.json();
                const sks = await skillRes.json();
                const cts = await certRes.json();

                if (active) {
                    setProjects(projs);
                    setSkills(sks);
                    setCerts(cts);
                    if (refreshTrigger === 0) {
                        setLogs(prev => [...prev, "[SUCCESS] Handshake complete. Remote database synchronized successfully."]);
                    }
                    setLoading(false);
                }
            } catch (error: unknown) {
                clearTimeout(timeoutId);
                if (active) {
                    const err = error as Error;
                    const errorMsg = err.name === 'AbortError' ? 'Connection timed out (5000ms)' : (err.message || String(err));
                    if (refreshTrigger === 0) {
                        setLogs(prev => [
                            ...prev, 
                            `[ERROR] Handshake failed: ${errorMsg}`,
                            "[WARN] Remote target sleeping or unreachable.",
                            "[INFO] Loading static cache from localized storage...",
                            "[SUCCESS] Local offline cache loaded successfully."
                        ]);
                    }
                    setProjects(fallbackProjects);
                    setSkills(fallbackSkills);
                    setCerts(fallbackCertifications);
                    setIsFallback(true);
                    setLoading(false);
                }
            }
        }

        fetchData();
        return () => {
            active = false;
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [refreshTrigger]);

    return { projects, skills, certs, loading, logs, isFallback, refresh };
}

// --- API Mutation Helpers ---
const authHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
});

export const api = {
    async deleteProject(id: string, token: string) {
        const res = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE', headers: authHeaders(token) });
        if (!res.ok) throw new Error(await res.text());
    },
    async createProject(data: any, token: string) {
        const res = await fetch(`${API_URL}/projects`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async deleteSkill(id: string, token: string) {
        const res = await fetch(`${API_URL}/skills/${id}`, { method: 'DELETE', headers: authHeaders(token) });
        if (!res.ok) throw new Error(await res.text());
    },
    async createSkill(data: any, token: string) {
        const res = await fetch(`${API_URL}/skills`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async deleteCert(id: string, token: string) {
        const res = await fetch(`${API_URL}/certifications/${id}`, { method: 'DELETE', headers: authHeaders(token) });
        if (!res.ok) throw new Error(await res.text());
    },
    async createCert(data: any, token: string) {
        const res = await fetch(`${API_URL}/certifications`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    // Adding update methods
    async updateProject(id: string, data: any, token: string) {
        const res = await fetch(`${API_URL}/projects/${id}`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(data) });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async updateSkill(id: string, data: any, token: string) {
        const res = await fetch(`${API_URL}/skills/${id}`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(data) });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async updateCert(id: string, data: any, token: string) {
        const res = await fetch(`${API_URL}/certifications/${id}`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(data) });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
};

export type { Project, Skill, Certification };
export { fallbackProjects, fallbackSkills, fallbackCertifications };
