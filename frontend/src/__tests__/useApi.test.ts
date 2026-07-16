import { renderHook, waitFor } from '@testing-library/react';
import { usePortfolioData } from '../hooks/useApi';
import { fallbackProjects, fallbackSkills, fallbackCertifications } from '../lib/fallbackData';

describe('usePortfolioData hook', () => {
    let originalFetch: typeof global.fetch;

    beforeAll(() => {
        originalFetch = global.fetch;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns fetched data successfully', async () => {
        const mockProjects = [{ id: 'p1', title: 'Proj 1', description: 'Desc 1', techStack: ['React'], featured: true, order: 1 }];
        const mockSkills = [{ id: 's1', name: 'TS', category: 'Backend', level: 'Expert', order: 1 }];
        const mockCerts = [{ id: 'c1', name: 'AWS', issuer: 'Amazon', issueDate: '2026-01-01' }];

        global.fetch = jest.fn((url) => {
            const urlStr = String(url);
            let data: any = [];
            if (urlStr.endsWith('/projects')) data = mockProjects;
            else if (urlStr.endsWith('/skills')) data = mockSkills;
            else if (urlStr.endsWith('/certifications')) data = mockCerts;
            
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data)
            } as Response);
        }) as jest.Mock;

        const { result } = renderHook(() => usePortfolioData());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.projects).toEqual(mockProjects);
        expect(result.current.skills).toEqual(mockSkills);
        expect(result.current.certs).toEqual(mockCerts);
        expect(result.current.isFallback).toBe(false);
    });

    it('falls back to static fallback data on API error', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Network failure'))) as jest.Mock;

        const { result } = renderHook(() => usePortfolioData());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.projects).toEqual(fallbackProjects);
        expect(result.current.skills).toEqual(fallbackSkills);
        expect(result.current.certs).toEqual(fallbackCertifications);
        expect(result.current.isFallback).toBe(true);
    });
});
