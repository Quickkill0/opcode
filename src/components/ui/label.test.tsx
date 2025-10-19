import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label Component', () => {
  it('renders label element', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText(/test label/i)).toBeInTheDocument();
  });

  it('renders as label element', () => {
    render(<Label data-testid="label">Label</Label>);
    expect(screen.getByTestId('label').tagName).toBe('LABEL');
  });

  it('applies correct base classes', () => {
    render(<Label data-testid="label">Label</Label>);
    expect(screen.getByTestId('label')).toHaveClass('text-sm', 'font-medium', 'leading-none');
  });

  it('accepts htmlFor attribute', () => {
    render(<Label htmlFor="input-id" data-testid="label">Label</Label>);
    expect(screen.getByTestId('label')).toHaveAttribute('for', 'input-id');
  });

  it('accepts custom className', () => {
    render(<Label className="custom-class" data-testid="label">Label</Label>);
    expect(screen.getByTestId('label')).toHaveClass('custom-class');
  });

  it('works with associated input', () => {
    render(
      <div>
        <Label htmlFor="test-input">Username</Label>
        <input id="test-input" />
      </div>
    );

    const label = screen.getByText(/username/i);
    const input = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', 'test-input');
    expect(input).toHaveAttribute('id', 'test-input');
  });
});
