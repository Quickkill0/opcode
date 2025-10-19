import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './textarea';

describe('Textarea Component', () => {
  it('renders textarea element', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it('renders as textarea element', () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByTestId('textarea').tagName).toBe('TEXTAREA');
  });

  it('handles text input', async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Type here" />);

    const textarea = screen.getByPlaceholderText(/type here/i);
    await user.type(textarea, 'Hello World');

    expect(textarea).toHaveValue('Hello World');
  });

  it('handles multiline input', async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Type here" />);

    const textarea = screen.getByPlaceholderText(/type here/i);
    await user.type(textarea, 'Line 1{Enter}Line 2');

    expect(textarea).toHaveValue('Line 1\nLine 2');
  });

  it('can be disabled', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />);
    expect(screen.getByPlaceholderText(/disabled textarea/i)).toBeDisabled();
  });

  it('applies correct base classes', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('flex', 'w-full', 'rounded-md', 'border', 'border-input');
  });

  it('accepts custom className', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Textarea ref={ref as any} />);
    expect(ref).toHaveBeenCalled();
  });

  it('handles onChange events', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Textarea onChange={handleChange} placeholder="Test" />);
    await user.type(screen.getByPlaceholderText(/test/i), 'a');

    expect(handleChange).toHaveBeenCalled();
  });

  it('accepts rows attribute', () => {
    render(<Textarea rows={5} data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '5');
  });

  it('accepts value prop for controlled component', () => {
    render(<Textarea value="Controlled value" onChange={() => {}} />);
    expect(screen.getByDisplayValue(/controlled value/i)).toBeInTheDocument();
  });
});
