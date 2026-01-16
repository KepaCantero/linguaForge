/**
 * BlockSelector Component Tests
 *
 * Tests for the BlockSelector component that allows users to select
 * text blocks for import with exercise previews.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { fireEvent, screen, within } from '@testing-library/dom';
import { BlockSelector } from '@/components/input/text/BlockSelector';
import { INPUT_COLORS } from '@/lib/constants';
import type { TextBlock } from '@/hooks/input/useTextImport';

// Type for the onSelectionChange callback
type OnSelectionChange = (selectedBlocks: TextBlock[]) => void;

// ============================================================
// TEST DATA FACTORIES (using real types)
// ============================================================

function createMockBlocks(count: number): TextBlock[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `block-${i + 1}`,
    content: `Block ${i + 1} content for testing`,
    wordRange: [i * 10, (i + 1) * 10],
    wordCount: 10,
    estimatedReadingTime: 3,
  }));
}

// ============================================================
// TEST SUITES
// ============================================================

describe('BlockSelector Component', () => {
  let onSelectionChangeMock: OnSelectionChange & ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSelectionChangeMock = vi.fn() as unknown as OnSelectionChange & ReturnType<typeof vi.fn>;
  });

  describe('Rendering', () => {
    it('should render header with title', () => {
      const mockBlocks = createMockBlocks(3);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      expect(screen.getByText('Seleccionar Bloques')).toBeInTheDocument();
    });

    it('should display block count information', () => {
      const mockBlocks = createMockBlocks(5);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      expect(screen.getByText('5 bloques disponibles')).toBeInTheDocument();
    });

    it('should render all blocks', () => {
      const mockBlocks = createMockBlocks(3);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      expect(screen.getByText('Bloque 1')).toBeInTheDocument();
      expect(screen.getByText('Bloque 2')).toBeInTheDocument();
      expect(screen.getByText('Bloque 3')).toBeInTheDocument();
    });

    it('should display word count for each block', () => {
      const mockBlocks = createMockBlocks(2);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const wordCounts = screen.getAllByText('10 palabras');
      expect(wordCounts.length).toBe(2);
    });

    it('should display reading time estimate for each block', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      expect(screen.getByText(/3s lectura/)).toBeInTheDocument();
    });

    it('should show exercise preview when enabled', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
          showExercisePreview={true}
        />
      );

      // Should show exercise icons (cloze, variations, etc.)
      expect(screen.getByText('🔤')).toBeInTheDocument();
    });

    it('should not show exercise preview when disabled', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
          showExercisePreview={false}
        />
      );

      // Exercise icons should not be present
      expect(screen.queryByText('🔤')).not.toBeInTheDocument();
    });
  });

  describe('Block Selection', () => {
    it('should select block when clicked', () => {
      const mockBlocks = createMockBlocks(3);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block1 = screen.getByText('Bloque 1').closest('[role="checkbox"]') as HTMLElement | null;
      fireEvent.click(block1!);

      expect(onSelectionChangeMock).toHaveBeenCalledTimes(1);
      const selectedBlocks = onSelectionChangeMock.mock.calls[0][0];
      expect(selectedBlocks).toHaveLength(1);
      expect(selectedBlocks[0].id).toBe('block-1');
    });

    it('should deselect block when clicked again', () => {
      const mockBlocks = createMockBlocks(2);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block1 = screen.getByText('Bloque 1').closest('[role="checkbox"]') as HTMLElement | null;

      // First click - select
      fireEvent.click(block1!);
      expect(onSelectionChangeMock).toHaveBeenCalledTimes(1);

      // Second click - deselect
      fireEvent.click(block1!);
      expect(onSelectionChangeMock).toHaveBeenCalledTimes(2);
      const selectedBlocks = onSelectionChangeMock.mock.calls[1][0];
      expect(selectedBlocks).toHaveLength(0);
    });

    it('should show selected count in header', () => {
      const mockBlocks = createMockBlocks(5);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      // Select first block
      const block1 = screen.getByText('Bloque 1').closest('[role="checkbox"]') as HTMLElement | null;
      fireEvent.click(block1!);

      expect(screen.getByText('1 de 5 bloques seleccionados')).toBeInTheDocument();
    });

    it('should show checkbox when selected', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block = screen.getByText('Bloque 1').closest('[role="checkbox"]') as HTMLElement;
      fireEvent.click(block!);

      expect(within(block!).getByText('✓')).toBeInTheDocument();
    });
  });

  describe('Select All Functionality', () => {
    it('should show "Seleccionar todos" button when no blocks selected', () => {
      const mockBlocks = createMockBlocks(3);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      expect(screen.getByRole('button', { name: 'Seleccionar todos' })).toBeInTheDocument();
    });

    it('should select all blocks when button is clicked', () => {
      const mockBlocks = createMockBlocks(3);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const selectAllButton = screen.getByRole('button', { name: 'Seleccionar todos' });
      fireEvent.click(selectAllButton);

      expect(onSelectionChangeMock).toHaveBeenCalledTimes(1);
      const selectedBlocks = onSelectionChangeMock.mock.calls[0][0];
      expect(selectedBlocks).toHaveLength(3);
    });

    it('should show "✓ Todos" when all blocks are selected', () => {
      const mockBlocks = createMockBlocks(3);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const selectAllButton = screen.getByRole('button', { name: 'Seleccionar todos' });
      fireEvent.click(selectAllButton);

      expect(screen.getByRole('button', { name: '✓ Todos' })).toBeInTheDocument();
    });

    it('should deselect all when some blocks are selected and button is clicked', () => {
      const mockBlocks = createMockBlocks(3);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      // Select one block
      const block1 = screen.getByText('Bloque 1').closest('[role="checkbox"]') as HTMLElement | null;
      fireEvent.click(block1!);

      // Click select all (which should deselect all in this state)
      const selectAllButton = screen.getByRole('button', { name: '✓ Algunos' });
      fireEvent.click(selectAllButton);

      const selectedBlocks = onSelectionChangeMock.mock.calls[1][0];
      expect(selectedBlocks).toHaveLength(0);
    });

    it('should not show select all button for single block', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      expect(screen.queryByRole('button', { name: 'Seleccionar todos' })).not.toBeInTheDocument();
    });
  });

  describe('Selection Summary', () => {
    it('should show selection summary when blocks are selected', () => {
      const mockBlocks = createMockBlocks(2);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block1 = screen.getByText('Bloque 1').closest('[role="checkbox"]') as HTMLElement | null;
      fireEvent.click(block1!);

      expect(screen.getByText('Bloques')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should show total words in selection', () => {
      const mockBlocks = createMockBlocks(2);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block1 = screen.getByText('Bloque 1').closest('[role="checkbox"]') as HTMLElement | null;
      fireEvent.click(block1!);

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should show estimated exercise count', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block1 = screen.getByText('Bloque 1').closest('[role="checkbox"]') as HTMLElement | null;
      fireEvent.click(block1!);

      // 10 words / ~10 words per exercise = 1 exercise
      expect(screen.getByText('Ejercicios')).toBeInTheDocument();
    });

    it('should hide selection summary when no blocks selected', () => {
      const mockBlocks = createMockBlocks(3);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      expect(screen.queryByText('Bloques')).not.toBeInTheDocument();
    });
  });

  describe('Max Selection Limit', () => {
    it('should respect maxSelectable limit', () => {
      const mockBlocks = createMockBlocks(5);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
          maxSelectable={3}
        />
      );

      // Try to select all 5 blocks
      const selectAllButton = screen.getByRole('button', { name: 'Seleccionar todos' });
      fireEvent.click(selectAllButton);

      const selectedBlocks = onSelectionChangeMock.mock.calls[0][0];
      expect(selectedBlocks).toHaveLength(3);
    });

    it('should show warning when max limit is reached', () => {
      const mockBlocks = createMockBlocks(5);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
          maxSelectable={2}
        />
      );

      // Select 2 blocks
      const selectAllButton = screen.getByRole('button', { name: 'Seleccionar todos' });
      fireEvent.click(selectAllButton);

      expect(screen.getByText(/Has alcanzado el límite de 2 bloques/)).toBeInTheDocument();
    });

    it('should prevent selecting more blocks than limit', () => {
      const mockBlocks = createMockBlocks(5);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
          maxSelectable={2}
        />
      );

      // Select first 2 blocks via select all
      const selectAllButton = screen.getByRole('button', { name: 'Seleccionar todos' });
      fireEvent.click(selectAllButton);

      // Try to click a 3rd block
      const block3 = screen.getByText('Bloque 3').closest('[role="checkbox"]') as HTMLElement | null;
      fireEvent.click(block3!);

      // Should still have only 2 blocks selected
      const selectedBlocks = onSelectionChangeMock.mock.calls[1][0];
      expect(selectedBlocks).toHaveLength(2);
    });
  });

  describe('Block Pagination', () => {
    it('should show only first 5 blocks initially', () => {
      const mockBlocks = createMockBlocks(10);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      expect(screen.getByText('Bloque 1')).toBeInTheDocument();
      expect(screen.getByText('Bloque 5')).toBeInTheDocument();
      expect(screen.queryByText('Bloque 6')).not.toBeInTheDocument();
    });

    it('should show "ver más" button when more than 5 blocks', () => {
      const mockBlocks = createMockBlocks(6);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      expect(screen.getByRole('button', { name: /Ver 1 bloques más/ })).toBeInTheDocument();
    });

    it('should show all blocks when "ver más" is clicked', () => {
      const mockBlocks = createMockBlocks(7);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const showMoreButton = screen.getByRole('button', { name: /Ver 2 bloques más/ });
      fireEvent.click(showMoreButton);

      expect(screen.getByText('Bloque 6')).toBeInTheDocument();
      expect(screen.getByText('Bloque 7')).toBeInTheDocument();
    });

    it('should not show "ver más" button when 5 or fewer blocks', () => {
      const mockBlocks = createMockBlocks(5);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      expect(screen.queryByRole('button', { name: /bloques más/ })).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should not allow selection when disabled', () => {
      const mockBlocks = createMockBlocks(3);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
          disabled={true}
        />
      );

      const block1 = screen.getByText('Bloque 1').closest('[role="checkbox"]') as HTMLElement | null;
      fireEvent.click(block1!);

      expect(onSelectionChangeMock).not.toHaveBeenCalled();
    });

    it('should apply disabled styling', () => {
      const mockBlocks = createMockBlocks(1);
      const { container } = render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
          disabled={true}
        />
      );

      const disabledElements = container.querySelectorAll('.opacity-50');
      expect(disabledElements.length).toBeGreaterThan(0);
    });

    it('should not show select all button when disabled', () => {
      const mockBlocks = createMockBlocks(3);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
          disabled={true}
        />
      );

      const selectAllButton = screen.getByRole('button', { name: 'Seleccionar todos' });
      expect(selectAllButton).toBeDisabled();
    });
  });

  describe('Exercise Preview', () => {
    it('should display exercise type icons', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
          showExercisePreview={true}
        />
      );

      expect(screen.getByText('🔤')).toBeInTheDocument(); // Cloze
      expect(screen.getByText('🔄')).toBeInTheDocument(); // Variations
      expect(screen.getByText('🔁')).toBeInTheDocument(); // Conversational echo
    });

    it('should use correct colors from INPUT_COLORS', () => {
      const videoConfig = INPUT_COLORS.video;
      expect(videoConfig.primary).toBe('sky');
      expect(videoConfig.hex).toBe('#0EA5E9');
    });
  });

  describe('Accessibility', () => {
    it('should use role="checkbox" for blocks', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block = screen.getByRole('checkbox', { name: /Bloque 1/ });
      expect(block).toBeInTheDocument();
    });

    it('should have aria-checked attribute', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block = screen.getByRole('checkbox', { name: /Bloque 1/ });
      expect(block).toHaveAttribute('aria-checked', 'false');
    });

    it('should update aria-checked when selected', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block = screen.getByRole('checkbox', { name: /Bloque 1/ });
      fireEvent.click(block);

      expect(block).toHaveAttribute('aria-checked', 'true');
    });

    it('should support keyboard navigation', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block = screen.getByRole('checkbox', { name: /Bloque 1/ });

      fireEvent.keyDown(block, { key: 'Enter' });
      expect(onSelectionChangeMock).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(block, { key: ' ' });
      expect(onSelectionChangeMock).toHaveBeenCalledTimes(2);
    });

    it('should have correct tabIndex', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
        />
      );

      const block = screen.getByRole('checkbox', { name: /Bloque 1/ });
      expect(block).toHaveAttribute('tabIndex', '0');
    });

    it('should have tabIndex -1 when disabled', () => {
      const mockBlocks = createMockBlocks(1);
      render(
        <BlockSelector
          blocks={mockBlocks}
          onSelectionChange={onSelectionChangeMock}
          disabled={true}
        />
      );

      const block = screen.getByRole('checkbox', { name: /Bloque 1/ });
      expect(block).toHaveAttribute('tabIndex', '-1');
    });
  });
});
