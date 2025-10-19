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
    expect(screen.queryByText(/tooltip content/i)).not.toBeInTheDocument();
  });

  it('shows tooltip content on hover', async () => {
    const user = userEvent.setup();
    render(<TestTooltip />);

    await user.hover(screen.getByText(/hover me/i));

    await waitFor(() => {
      expect(screen.getByText(/tooltip content/i)).toBeInTheDocument();
    });
  });

  it('hides tooltip content on unhover', async () => {
    const user = userEvent.setup();
    render(<TestTooltip />);

    const trigger = screen.getByText(/hover me/i);
    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText(/tooltip content/i)).toBeInTheDocument();
    });

    await user.unhover(trigger);

    await waitFor(() => {
      expect(screen.queryByText(/tooltip content/i)).not.toBeInTheDocument();
    });
  });

  it('renders custom tooltip content', async () => {
    const user = userEvent.setup();
    render(<TestTooltip content="Custom tooltip text" />);

    await user.hover(screen.getByText(/hover me/i));

    await waitFor(() => {
      expect(screen.getByText(/custom tooltip text/i)).toBeInTheDocument();
    });
  });

  it('applies correct base classes to tooltip content', async () => {
    const user = userEvent.setup();
    render(<TestTooltip />);

    await user.hover(screen.getByText(/hover me/i));

    await waitFor(() => {
      const content = screen.getByText(/tooltip content/i);
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
      expect(screen.getByText(/content/i)).toHaveClass('custom-class');
    });
  });
});
