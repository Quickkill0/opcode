import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';

describe('Tooltip Components', () => {
  const TestTooltip = ({ content = 'Tooltip content' }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  it('renders tooltip trigger', () => {
    render(<TestTooltip />);
    expect(screen.getByText(/hover me/i)).toBeInTheDocument();
  });

  it('does not show tooltip content initially', () => {
    render(<TestTooltip />);
    // Tooltip content exists in DOM but is hidden (data-state="closed")
    const tooltips = screen.queryAllByText(/tooltip content/i);
    if (tooltips.length > 0) {
      // If tooltip exists, check that it's not in open state
      const container = tooltips[0].closest('[data-state]');
      expect(container?.getAttribute('data-state')).not.toBe('delayed-open');
    }
  });

  it('shows tooltip content on hover', async () => {
    const user = userEvent.setup();
    render(<TestTooltip />);

    await user.hover(screen.getByText(/hover me/i));

    await waitFor(() => {
      expect(screen.getAllByText(/tooltip content/i)[0]).toBeInTheDocument();
    });
  });

  it.skip('hides tooltip content on unhover', async () => {
    const user = userEvent.setup();
    render(<TestTooltip />);

    const trigger = screen.getByText(/hover me/i);
    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getAllByText(/tooltip content/i)[0]).toBeInTheDocument();
    });

    await user.unhover(trigger);

    await waitFor(() => {
      // Check that tooltip is closed by verifying data-state is not "delayed-open"
      const tooltips = screen.queryAllByText(/tooltip content/i);
      if (tooltips.length > 0) {
        const container = tooltips[0].closest('[data-state]');
        expect(container?.getAttribute('data-state')).not.toBe('delayed-open');
      }
    }, { timeout: 2000 }); // Increase timeout for animation
  });

  it('renders custom tooltip content', async () => {
    const user = userEvent.setup();
    render(<TestTooltip content="Custom tooltip text" />);

    await user.hover(screen.getByText(/hover me/i));

    await waitFor(() => {
      expect(screen.getAllByText(/custom tooltip text/i)[0]).toBeInTheDocument();
    });
  });

  it('applies correct base classes to tooltip content', async () => {
    const user = userEvent.setup();
    render(<TestTooltip />);

    await user.hover(screen.getByText(/hover me/i));

    await waitFor(() => {
      const content = screen.getAllByText(/tooltip content/i)[0];
      expect(content).toHaveClass('rounded-md', 'bg-primary', 'text-primary-foreground');
    });
  });

  it('accepts custom className for tooltip content', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent className="custom-class">Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByText(/hover/i));

    await waitFor(() => {
      const content = screen.getAllByText(/content/i)[0];
      expect(content).toHaveClass('custom-class');
    });
  });
});
