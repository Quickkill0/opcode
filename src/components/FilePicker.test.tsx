import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilePicker } from './FilePicker';

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    listDirectoryContents: vi.fn(),
  },
}));

import { api } from '@/lib/api';

describe('FilePicker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listDirectoryContents).mockResolvedValue([
      { name: 'folder1', path: 'C:\\test\\folder1', is_directory: true, size: 0 },
      { name: 'file1.txt', path: 'C:\\test\\file1.txt', is_directory: false, size: 1024 },
    ]);
  });

  it('renders file picker with base path', async () => {
    render(
      <FilePicker
        basePath="C:\\test"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // Component shows relative path "/" when currentPath === basePath
    await screen.findByText('/');
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('lists directories and files', async () => {
    render(
      <FilePicker
        basePath="C:\\test"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // Wait for the async data to load
    expect(await screen.findByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
  });

  it('calls onSelect when item is clicked', async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <FilePicker
        basePath="C:\\test"
        onSelect={handleSelect}
        onClose={vi.fn()}
      />
    );

    const folder = await screen.findByText('folder1');
    await user.click(folder);

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'folder1',
        is_directory: true,
      })
    );
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <FilePicker
        basePath="C:\\test"
        onSelect={vi.fn()}
        onClose={handleClose}
      />
    );

    // Find the close button (second button with empty name, first is disabled back button)
    const buttons = screen.getAllByRole('button', { name: '' });
    const closeButton = buttons[1]; // Second button is the close button
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('handles Windows paths correctly', async () => {
    render(
      <FilePicker
        basePath="C:\\Users\\Test\\Documents"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // Component shows relative path "/" when at base path
    expect(await screen.findByText('/')).toBeInTheDocument();
  });
});
