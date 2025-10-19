import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectComponent,
} from './select';

describe('Select Components', () => {
  describe('SelectComponent (Simple Select)', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    it('renders select component', () => {
      render(
        <SelectComponent
          value="option1"
          onValueChange={vi.fn()}
          options={options}
        />
      );
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows placeholder when no value selected', () => {
      render(
        <SelectComponent
          value=""
          onValueChange={vi.fn()}
          options={options}
          placeholder="Choose an option"
        />
      );
      expect(screen.getByText(/choose an option/i)).toBeInTheDocument();
    });

    it('shows selected value', () => {
      render(
        <SelectComponent
          value="option1"
          onValueChange={vi.fn()}
          options={options}
        />
      );
      expect(screen.getByText(/option 1/i)).toBeInTheDocument();
    });

    it('can be disabled', () => {
      render(
        <SelectComponent
          value="option1"
          onValueChange={vi.fn()}
          options={options}
          disabled
        />
      );
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('accepts custom className', () => {
      render(
        <SelectComponent
          value="option1"
          onValueChange={vi.fn()}
          options={options}
          className="custom-class"
        />
      );
      expect(screen.getByRole('combobox')).toHaveClass('custom-class');
    });

    it('calls onValueChange when option is selected', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <SelectComponent
          value="option1"
          onValueChange={handleChange}
          options={options}
        />
      );

      await user.click(screen.getByRole('combobox'));
      const option2 = screen.getByRole('option', { name: /option 2/i });
      await user.click(option2);

      expect(handleChange).toHaveBeenCalledWith('option2');
    });
  });

  describe('Select Primitives', () => {
    const TestSelect = ({ value = 'value1', onValueChange = vi.fn() }) => (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="value1">Value 1</SelectItem>
          <SelectItem value="value2">Value 2</SelectItem>
          <SelectItem value="value3" disabled>Value 3</SelectItem>
        </SelectContent>
      </Select>
    );

    it('renders select trigger', () => {
      render(<TestSelect />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays selected value', () => {
      render(<TestSelect value="value1" />);
      expect(screen.getByText(/value 1/i)).toBeInTheDocument();
    });

    it('opens dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<TestSelect />);

      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('option', { name: /value 1/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /value 2/i })).toBeInTheDocument();
    });

    it('selects option when clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<TestSelect value="value1" onValueChange={handleChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: /value 2/i }));

      expect(handleChange).toHaveBeenCalledWith('value2');
    });

    it('shows disabled option', async () => {
      const user = userEvent.setup();
      render(<TestSelect />);

      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('option', { name: /value 3/i })).toHaveAttribute('data-disabled', '');
    });
  });

  describe('SelectTrigger', () => {
    it('applies correct base classes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('flex', 'h-9', 'w-full', 'rounded-md', 'border');
    });
  });
});
