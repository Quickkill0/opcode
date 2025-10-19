import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs Components', () => {
  const TestTabs = ({ value = 'tab1', onValueChange = vi.fn() }) => (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3" disabled>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
    </Tabs>
  );

  describe('Tabs', () => {
    it('renders tabs component', () => {
      render(<TestTabs />);
      expect(screen.getByRole('tab', { name: /tab 1/i })).toBeInTheDocument();
    });

    it('shows content for selected tab', () => {
      render(<TestTabs value="tab1" />);
      expect(screen.getByText(/content 1/i)).toBeInTheDocument();
      expect(screen.queryByText(/content 2/i)).not.toBeInTheDocument();
    });

    it('switches content when different tab is selected', () => {
      render(<TestTabs value="tab2" />);
      expect(screen.queryByText(/content 1/i)).not.toBeInTheDocument();
      expect(screen.getByText(/content 2/i)).toBeInTheDocument();
    });
  });

  describe('TabsList', () => {
    it('renders tabs list container', () => {
      render(
        <Tabs value="test" onValueChange={vi.fn()}>
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    });

    it('applies correct classes', () => {
      render(
        <Tabs value="test" onValueChange={vi.fn()}>
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(screen.getByTestId('tabs-list')).toHaveClass('flex', 'h-9', 'items-center', 'rounded-lg');
    });
  });

  describe('TabsTrigger', () => {
    it('renders tab trigger as button', () => {
      render(<TestTabs />);
      const tab = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab.tagName).toBe('BUTTON');
    });

    it('has correct aria-selected when active', () => {
      render(<TestTabs value="tab1" />);
      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('aria-selected', 'false');
    });

    it('calls onValueChange when clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<TestTabs value="tab1" onValueChange={handleChange} />);
      await user.click(screen.getByRole('tab', { name: /tab 2/i }));

      expect(handleChange).toHaveBeenCalledWith('tab2');
    });

    it('can be disabled', () => {
      render(<TestTabs />);
      expect(screen.getByRole('tab', { name: /tab 3/i })).toBeDisabled();
    });

    it('does not call onValueChange when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<TestTabs onValueChange={handleChange} />);
      await user.click(screen.getByRole('tab', { name: /tab 3/i }));

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('TabsContent', () => {
    it('renders content for active tab', () => {
      render(<TestTabs value="tab1" />);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByText(/content 1/i)).toBeInTheDocument();
    });

    it('hides content for inactive tabs', () => {
      render(<TestTabs value="tab1" />);
      expect(screen.queryByText(/content 2/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/content 3/i)).not.toBeInTheDocument();
    });

    it('applies correct classes', () => {
      render(<TestTabs value="tab1" />);
      expect(screen.getByRole('tabpanel')).toHaveClass('mt-2');
    });
  });

  describe('Tab Switching', () => {
    it('switches tabs and content correctly', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      const { rerender } = render(<TestTabs value="tab1" onValueChange={handleChange} />);

      expect(screen.getByText(/content 1/i)).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: /tab 2/i }));
      expect(handleChange).toHaveBeenCalledWith('tab2');

      // Simulate value change
      rerender(<TestTabs value="tab2" onValueChange={handleChange} />);

      expect(screen.queryByText(/content 1/i)).not.toBeInTheDocument();
      expect(screen.getByText(/content 2/i)).toBeInTheDocument();
    });
  });
});
