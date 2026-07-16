import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Console from '../components/Terminal/Console';
import { fallbackProjects, fallbackSkills, fallbackCertifications } from '../lib/fallbackData';

describe('Console Component', () => {
    let mockSwitchToGui: jest.Mock;

    beforeEach(() => {
        mockSwitchToGui = jest.fn();
    });

    it('renders the welcome text and status', () => {
        render(
            <Console
                projects={fallbackProjects}
                skills={fallbackSkills}
                certs={fallbackCertifications}
                isFallback={false}
                onSwitchToGui={mockSwitchToGui}
            />
        );

        expect(screen.getByText(/George Santana's Portfolio CLI/i)).toBeInTheDocument();
        expect(screen.getByText(/System status: ONLINE/i)).toBeInTheDocument();
    });

    it('shows warning text when running in fallback mode', () => {
        render(
            <Console
                projects={fallbackProjects}
                skills={fallbackSkills}
                certs={fallbackCertifications}
                isFallback={true}
                onSwitchToGui={mockSwitchToGui}
            />
        );

        expect(screen.getByText(/Running in localized offline cache mode/i)).toBeInTheDocument();
    });

    it('processes user input help command and displays lists', async () => {
        render(
            <Console
                projects={fallbackProjects}
                skills={fallbackSkills}
                certs={fallbackCertifications}
                isFallback={false}
                onSwitchToGui={mockSwitchToGui}
            />
        );

        const input = screen.getByLabelText('Terminal input');
        
        fireEvent.change(input, { target: { value: 'help' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(screen.getByText(/Available Commands:/i)).toBeInTheDocument();
        expect(screen.getByText(/whoami/i)).toBeInTheDocument();
    });

    it('switches view mode when gui command is entered', () => {
        jest.useFakeTimers();
        render(
            <Console
                projects={fallbackProjects}
                skills={fallbackSkills}
                certs={fallbackCertifications}
                isFallback={false}
                onSwitchToGui={mockSwitchToGui}
            />
        );

        const input = screen.getByLabelText('Terminal input');
        
        fireEvent.change(input, { target: { value: 'gui' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(screen.getByText(/Initializing graphical dashboard mode/i)).toBeInTheDocument();
        
        act(() => {
            jest.runAllTimers();
        });
        
        expect(mockSwitchToGui).toHaveBeenCalled();
        jest.useRealTimers();
    });
});
