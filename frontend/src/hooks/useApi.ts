import { useState, useEffect } from 'react';
import { Project, Skill, Certification, fallbackProjects, fallbackSkills, fallbackCertifications } from '../lib/fallbackData';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.warn('[useApi] NEXT_PUBLIC_API_URL is not set. Using static fallback data only.');
}

export function usePortfolioData() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [certs, setCerts] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);
    const [isFallback, setIsFallback] = useState(false);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, 5000); // 5-second timeout fallback to accommodate backend cold starts
        
        async function fetchData() {
            if (!active) return;
            setLogs(prev => [...prev, `[INFO] Initializing connection to API Gateway: ${API_URL}`, "[INFO] Resolving collections [projects, skills, certifications]..."]);
            
            try {
                const [projRes, skillRes, certRes] = await Promise.all([
                    fetch(`${API_URL}/projects`, { signal: controller.signal }),
                    fetch(`${API_URL}/skills`, { signal: controller.signal }),
                    fetch(`${API_URL}/certifications`, { signal: controller.signal })
                ]);
                
                clearTimeout(timeoutId);

                if (!projRes.ok || !skillRes.ok || !certRes.ok) {
                    throw new Error("HTTP response error");
                }

                const projs = await projRes.json();
                const sks = await skillRes.json();
                const cts = await certRes.json();

                if (active) {
                    setProjects(projs);
                    setSkills(sks);
                    setCerts(cts);
                    setLogs(prev => [...prev, "[SUCCESS] Handshake complete. Remote database synchronized successfully."]);
                    setLoading(false);
                }
            } catch (error: unknown) {
                clearTimeout(timeoutId);
                if (active) {
                    const err = error as Error;
                    const errorMsg = err.name === 'AbortError' ? 'Connection timed out (3000ms)' : (err.message || String(err));
                    setLogs(prev => [
                        ...prev, 
                        `[ERROR] Handshake failed: ${errorMsg}`,
                        "[WARN] Remote target sleeping or unreachable.",
                        "[INFO] Loading static cache from localized storage...",
                        "[SUCCESS] Local offline cache loaded successfully."
                    ]);
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
    }, []);

    return { projects, skills, certs, loading, logs, isFallback };
}
export type { Project, Skill, Certification };
export { fallbackProjects, fallbackSkills, fallbackCertifications };
