/**
 * Unit Tests for EmptyState Component
 * 
 * Run with: npm test EmptyState
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../empty-state';
import { FolderOpen } from 'lucide-react';

describe('EmptyState Component', () => {
  it('should render with title and description', () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="No Projects"
        description="Get started by creating your first project"
      />
    );

    expect(screen.getByText('No Projects')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first project')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const mockAction = jest.fn();

    render(
      <EmptyState
        icon={FolderOpen}
        title="No Projects"
        description="Description"
        action={{
          label: 'Create Project',
          onClick: mockAction,
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Create Project' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should render action link when href provided', () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="No Projects"
        description="Description"
        action={{
          label: 'Go to Projects',
          href: '/projects',
        }}
      />
    );

    const link = screen.getByRole('link', { name: 'Go to Projects' });
    expect(link).toHaveAttribute('href', '/projects');
  });

  it('should not render action if not provided', () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="No Projects"
        description="Description"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

