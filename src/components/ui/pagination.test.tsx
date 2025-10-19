import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './pagination';

describe('Pagination Component', () => {
  it('renders pagination with page info', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
  });

  it('renders previous and next buttons', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toBeDisabled();
  });

  it('enables both buttons on middle page', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
  });

  it('calls onPageChange with previous page when clicking previous', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Pagination currentPage={3} totalPages={5} onPageChange={handleChange} />);
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);

    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with next page when clicking next', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Pagination currentPage={3} totalPages={5} onPageChange={handleChange} />);
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);

    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('renders nothing when totalPages is 1', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when totalPages is 0', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('accepts custom className', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} className="custom-class" />);
    expect(screen.getByText(/page 1 of 5/i).parentElement).toHaveClass('custom-class');
  });

  it('updates page display when currentPage changes', () => {
    const { rerender } = render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();

    rerender(<Pagination currentPage={4} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText(/page 4 of 5/i)).toBeInTheDocument();
  });
});
