import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';

describe('RadioGroup Components', () => {
  const TestRadioGroup = ({ value = 'option1', onValueChange = vi.fn() }) => (
    <RadioGroup value={value} onValueChange={onValueChange}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" disabled />
        <Label htmlFor="option3">Option 3 (Disabled)</Label>
      </div>
    </RadioGroup>
  );

  describe('RadioGroup', () => {
    it('renders radio group', () => {
      render(<TestRadioGroup />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('applies correct base classes', () => {
      render(<RadioGroup data-testid="radio-group"><RadioGroupItem value="test" /></RadioGroup>);
      expect(screen.getByTestId('radio-group')).toHaveClass('grid', 'gap-2');
    });

    it('accepts custom className', () => {
      render(<RadioGroup className="custom-class" data-testid="radio-group"><RadioGroupItem value="test" /></RadioGroup>);
      expect(screen.getByTestId('radio-group')).toHaveClass('custom-class');
    });
  });

  describe('RadioGroupItem', () => {
    it('renders radio items', () => {
      render(<TestRadioGroup />);
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);
    });

    it('has correct checked state', () => {
      render(<TestRadioGroup value="option1" />);
      expect(screen.getByRole('radio', { name: /option 1/i })).toBeChecked();
      expect(screen.getByRole('radio', { name: /option 2/i })).not.toBeChecked();
    });

    it('calls onValueChange when clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<TestRadioGroup value="option1" onValueChange={handleChange} />);
      await user.click(screen.getByRole('radio', { name: /option 2/i }));

      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('can be disabled', () => {
      render(<TestRadioGroup />);
      expect(screen.getByRole('radio', { name: /option 3/i })).toBeDisabled();
    });

    it('does not call onValueChange when disabled option is clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<TestRadioGroup onValueChange={handleChange} />);
      await user.click(screen.getByRole('radio', { name: /option 3/i }));

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('applies correct base classes', () => {
      render(<TestRadioGroup />);
      const radio = screen.getByRole('radio', { name: /option 1/i });
      expect(radio).toHaveClass('h-4', 'w-4', 'rounded-full', 'border');
    });
  });

  describe('RadioGroup Value Changes', () => {
    it('updates checked state when value changes', () => {
      const { rerender } = render(<TestRadioGroup value="option1" />);
      expect(screen.getByRole('radio', { name: /option 1/i })).toBeChecked();

      rerender(<TestRadioGroup value="option2" />);
      expect(screen.getByRole('radio', { name: /option 1/i })).not.toBeChecked();
      expect(screen.getByRole('radio', { name: /option 2/i })).toBeChecked();
    });
  });

  describe('RadioGroup with Labels', () => {
    it('associates labels with radio items correctly', () => {
      render(<TestRadioGroup />);

      const option1Radio = screen.getByRole('radio', { name: /option 1/i });
      const option1Label = screen.getByText(/option 1/i);

      expect(option1Radio).toHaveAttribute('id', 'option1');
      expect(option1Label).toHaveAttribute('for', 'option1');
    });
  });
});
