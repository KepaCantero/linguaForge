/**
 * TextPreview Component Tests
 *
 * Tests for the TextPreview component that displays text analysis results
 * including statistics, difficulty, and block previews.
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { TextPreview } from '@/components/input/text/TextPreview';
import { DIFFICULTY_COLORS, INPUT_COLORS } from '@/lib/constants';
import type { TextImportData } from '@/hooks/input/useTextImport';

// ============================================================
// TEST DATA FACTORIES (using real types)
// ============================================================

function createMockTextImportData(
  overrides: Partial<TextImportData> = {}
): TextImportData {
  return {
    content: 'Test content for analysis',
    wordCount: 100,
    phraseCount: 5,
    language: 'fr',
    difficulty: 'beginner',
    blocks: [
      {
        id: 'block-1',
        content: 'First block content',
        wordRange: [0, 50],
        wordCount: 50,
        estimatedReadingTime: 15,
      },
      {
        id: 'block-2',
        content: 'Second block content',
        wordRange: [50, 100],
        wordCount: 50,
        estimatedReadingTime: 15,
      },
    ],
    suggestedTitle: 'Test Title',
    ...overrides,
  };
}

// ============================================================
// TEST SUITES
// ============================================================

describe('TextPreview Component', () => {
  const defaultProps = {
    data: null,
    isLoading: false,
    error: null,
    onAnalyze: vi.fn(),
    showAnalyzeButton: false,
  };

  describe('Empty State', () => {
    it('should render empty state when no data', () => {
      render(<TextPreview {...defaultProps} />);

      expect(screen.getByText(/Pega un texto/)).toBeInTheDocument();
      expect(screen.getByText(/Mínimo 20 caracteres/)).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(<TextPreview {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Analizando texto...')).toBeInTheDocument();
    });

    it('should render error state', () => {
      render(<TextPreview {...defaultProps} error="Test error" />);

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should render analysis results when data is provided', () => {
      const mockData = createMockTextImportData();
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText('Análisis del Texto')).toBeInTheDocument();
    });
  });

  describe('stats display', () => {
    it('should display word count', () => {
      const mockData = createMockTextImportData({ wordCount: 150 });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should display phrase count', () => {
      const mockData = createMockTextImportData({ phraseCount: 8 });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('should display reading time estimate', () => {
      const mockData = createMockTextImportData({ wordCount: 400 });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText(/~2 min/)).toBeInTheDocument();
    });

    it('should display block count', () => {
      const mockData = createMockTextImportData({
        blocks: [
          { id: '1', content: 'Test', wordRange: [0, 10], wordCount: 10, estimatedReadingTime: 1 },
          { id: '2', content: 'Test', wordRange: [10, 20], wordCount: 10, estimatedReadingTime: 1 },
          { id: '3', content: 'Test', wordRange: [20, 30], wordCount: 10, estimatedReadingTime: 1 },
        ],
      });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('difficulty badge', () => {
    it('should display beginner difficulty', () => {
      const mockData = createMockTextImportData({ difficulty: 'beginner' });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText('Principiante')).toBeInTheDocument();
    });

    it('should display intermediate difficulty', () => {
      const mockData = createMockTextImportData({ difficulty: 'intermediate' });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText('Intermedio')).toBeInTheDocument();
    });

    it('should display advanced difficulty', () => {
      const mockData = createMockTextImportData({ difficulty: 'advanced' });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText('Avanzado')).toBeInTheDocument();
    });

    it('should use centralized colors for difficulty', () => {
      expect(DIFFICULTY_COLORS.beginner.color).toBe('text-emerald-400');
      expect(DIFFICULTY_COLORS.intermediate.color).toBe('text-amber-400');
      expect(DIFFICULTY_COLORS.advanced.color).toBe('text-rose-400');
    });
  });

  describe('metadata display', () => {
    it('should display suggested title', () => {
      const mockData = createMockTextImportData({ suggestedTitle: 'Test Title' });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should display detected language', () => {
      const mockData = createMockTextImportData({ language: 'fr-FR' });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText(/Francés/)).toBeInTheDocument();
    });
  });

  describe('blocks preview', () => {
    it('should display blocks preview when blocks exist', () => {
      const mockData = createMockTextImportData({
        blocks: [
          { id: '1', content: 'First block', wordRange: [0, 10], wordCount: 10, estimatedReadingTime: 1 },
          { id: '2', content: 'Second block', wordRange: [10, 20], wordCount: 10, estimatedReadingTime: 1 },
        ],
      });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText('Vista previa de bloques (2 total)')).toBeInTheDocument();
      expect(screen.getByText('First block')).toBeInTheDocument();
    });

    it('should show "more blocks" message when there are more than 3 blocks', () => {
      const mockData = createMockTextImportData({
        blocks: [
          { id: '1', content: 'Block 1', wordRange: [0, 10], wordCount: 10, estimatedReadingTime: 1 },
          { id: '2', content: 'Block 2', wordRange: [10, 20], wordCount: 10, estimatedReadingTime: 1 },
          { id: '3', content: 'Block 3', wordRange: [20, 30], wordCount: 10, estimatedReadingTime: 1 },
          { id: '4', content: 'Block 4', wordRange: [30, 40], wordCount: 10, estimatedReadingTime: 1 },
        ],
      });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText(/y 1 bloques más/)).toBeInTheDocument();
    });
  });

  describe('analyze button', () => {
    it('should show analyze button when showAnalyzeButton is true', () => {
      render(<TextPreview {...defaultProps} showAnalyzeButton={true} />);

      expect(screen.getByRole('button', { name: 'Analizar' })).toBeInTheDocument();
    });

    it('should call onAnalyze when button is clicked', () => {
      const onAnalyze = vi.fn();
      render(<TextPreview {...defaultProps} onAnalyze={onAnalyze} showAnalyzeButton={true} />);

      const button = screen.getByRole('button', { name: 'Analizar' });
      button.click();

      expect(onAnalyze).toHaveBeenCalled();
    });

    it('should disable button when loading', () => {
      render(<TextPreview {...defaultProps} isLoading={true} showAnalyzeButton={true} />);

      const button = screen.getByRole('button', { name: 'Analizando...' });
      expect(button).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<TextPreview {...defaultProps} />);

      expect(screen.getByRole('heading', { name: 'Análisis del Texto' })).toBeInTheDocument();
    });

    it('should show aria-hidden on decorative icons', () => {
      const mockData = createMockTextImportData();
      const { container } = render(<TextPreview {...defaultProps} data={mockData} />);

      const icons = container?.querySelectorAll('[aria-hidden="true"]');
      expect(icons?.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero word count', () => {
      const mockData = createMockTextImportData({ wordCount: 0 });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle empty blocks array', () => {
      const mockData = createMockTextImportData({ blocks: [] });
      render(<TextPreview {...defaultProps} data={mockData} />);

      // Should not show blocks preview section
      expect(screen.queryByText('Vista previa de bloques')).not.toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      const mockData = createMockTextImportData({ suggestedTitle: longTitle });
      render(<TextPreview {...defaultProps} data={mockData} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });
});
