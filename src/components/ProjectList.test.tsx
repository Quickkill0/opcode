import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectList } from './ProjectList';
import type { Project } from '@/lib/api';

const mockProjects: Project[] = [
  {
    id: 'project-1',
    path: 'C:\\Users\\test\\project1',
    sessions: ['s1', 's2', 's3', 's4', 's5'],
    created_at: new Date('2024-01-01').getTime() / 1000,
    most_recent_session: new Date('2024-01-15').getTime() / 1000,
  },
  {
    id: 'project-2',
    path: 'C:\\Users\\test\\project2',
    sessions: ['s6', 's7', 's8'],
    created_at: new Date('2024-01-02').getTime() / 1000,
    most_recent_session: new Date('2024-01-20').getTime() / 1000,
  },
];

describe('ProjectList Component', () => {
  it('renders list of projects', () => {
    render(
      <ProjectList
        projects={mockProjects}
        onProjectClick={vi.fn()}
        onOpenProject={vi.fn()}
        loading={false}
      />
    );

    expect(screen.getByText(/test project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/test project 2/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <ProjectList
        projects={[]}
        onProjectClick={vi.fn()}
        onOpenProject={vi.fn()}
        loading={true}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('calls onProjectClick when project is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ProjectList
        projects={mockProjects}
        onProjectClick={handleClick}
        onOpenProject={vi.fn()}
        loading={false}
      />
    );

    await user.click(screen.getByText(/test project 1/i));
    expect(handleClick).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('shows empty state when no projects', () => {
    render(
      <ProjectList
        projects={[]}
        onProjectClick={vi.fn()}
        onOpenProject={vi.fn()}
        loading={false}
      />
    );

    expect(screen.getByText(/no projects/i)).toBeInTheDocument();
  });

  it('displays session counts correctly', () => {
    render(
      <ProjectList
        projects={mockProjects}
        onProjectClick={vi.fn()}
        onOpenProject={vi.fn()}
        loading={false}
      />
    );

    expect(screen.getByText(/5 sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/3 sessions/i)).toBeInTheDocument();
  });
});
