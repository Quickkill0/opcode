import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './switch';

describe('Switch Component', () => {
  it('renders switch component', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders unchecked by default', () => {
    // Switch requires explicit checked prop, defaults to undefined which doesn't set aria-checked
    render(<Switch checked={false} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders checked when checked prop is true', () => {
    render(<Switch checked={true} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onCheckedChange when clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch checked={false} onCheckedChange={handleChange} />);
    await user.click(screen.getByRole('switch'));

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('toggles from checked to unchecked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch checked={true} onCheckedChange={handleChange} />);
    await user.click(screen.getByRole('switch'));

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('can be disabled', () => {
    render(<Switch disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('does not call onCheckedChange when disabled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch disabled onCheckedChange={handleChange} />);
    await user.click(screen.getByRole('switch'));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies correct base classes', () => {
    render(<Switch data-testid="switch" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('inline-flex', 'h-5', 'w-9', 'rounded-full');
  });

  it('accepts custom className', () => {
    render(<Switch className="custom-class" />);
    expect(screen.getByRole('switch')).toHaveClass('custom-class');
  });

  it('has hidden checkbox input', () => {
    render(<Switch />);
    const checkbox = screen.getByRole('switch').querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass('sr-only');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Switch ref={ref as any} />);
    expect(ref).toHaveBeenCalled();
  });
});
