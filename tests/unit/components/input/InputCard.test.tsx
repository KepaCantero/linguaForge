/**
 * InputCard Component Tests
 *
 * Tests for the InputCard component that displays input type cards
 * (text, video, audio) with stats, status indicators, and proper styling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { fireEvent, screen } from '@testing-library/dom';
import { InputCard, type InputCardData } from '@/components/input/InputCard';
import { INPUT_COLORS, DIFFICULTY_COLORS } from '@/lib/constants';

// ============================================================
// TEST DATA FACTORIES (using real types, no mocks)
// ============================================================

function createTestCardData(
  type: 'text' | 'video' | 'audio',
  overrides: Partial<InputCardData> = {}
): InputCardData {
  const colorConfig = INPUT_COLORS[type];

  return {
    id: `${type}-test`,
    type,
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Input`,
    description: `Test description for ${type} input`,
    icon: type === 'text' ? '📝' : type === 'video' ? '🎬' : '🎧',
    href: `/input/${type}`,
    gradient: colorConfig.gradient,
    color: colorConfig.hex,
    stats: [],
    status: 'empty',
    disabled: false,
    ...overrides,
  };
}

// ============================================================
// TEST SUITES
// ============================================================

describe('InputCard Component', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Rendering', () => {
    it('should render a text input card', () => {
      const testData = createTestCardData('text');
      const { getByRole } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      // Component formats aria-label as "Title: Description"
      const link = getByRole('link', { name: /text input: test description for text input/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/input/text');
    });

    it('should render a video input card', () => {
      const testData = createTestCardData('video');
      const { getByRole } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const link = getByRole('link', { name: /video input: test description for video input/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/input/video');
    });

    it('should render an audio input card', () => {
      const testData = createTestCardData('audio');
      const { getByRole } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const link = getByRole('link', { name: /audio input: test description for audio input/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/input/audio');
    });

    it('should display the card title', () => {
      const testData = createTestCardData('text', { title: 'Custom Title' });
      render(<InputCard data={testData} index={0} shouldAnimate={false} />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should display the card description', () => {
      const testData = createTestCardData('text', {
        description: 'Custom description text',
      });
      render(<InputCard data={testData} index={0} shouldAnimate={false} />);

      expect(screen.getByText('Custom description text')).toBeInTheDocument();
    });

    it('should display the card icon', () => {
      const testData = createTestCardData('text', { icon: '🔤' });
      render(<InputCard data={testData} index={0} shouldAnimate={false} />);

      expect(screen.getByText('🔤')).toBeInTheDocument();
    });
  });

  describe('Status Indicators', () => {
    it('should not show status indicator when status is empty', () => {
      const testData = createTestCardData('text', { status: 'empty' });
      const { container } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const statusIndicators = container.querySelectorAll('[class*="absolute top-3 right-3"]');
      expect(statusIndicators.length).toBe(0);
    });

    it('should show gray indicator when disabled', () => {
      const testData = createTestCardData('text', { disabled: true });
      const { container } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const indicator = container.querySelector('.bg-slate-500');
      expect(indicator).toBeInTheDocument();
    });

    it('should show loading indicator when status is loading', () => {
      const testData = createTestCardData('text', { status: 'loading' });
      const { container } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const indicator = container.querySelector('.bg-yellow-400');
      expect(indicator).toBeInTheDocument();
    });

    it('should show ready indicator with shadow when status is ready', () => {
      const testData = createTestCardData('text', { status: 'ready' });
      const { container } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const indicator = container.querySelector('.bg-green-400');
      expect(indicator).toBeInTheDocument();

      const shadowIndicator = container.querySelector('.shadow-green-400\\/50');
      expect(shadowIndicator).toBeInTheDocument();
    });
  });

  describe('Color Styling', () => {
    it('should apply correct emerald colors for text type', () => {
      const testData = createTestCardData('text');
      const { container } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const link = container.querySelector('a');
      expect(link?.className).toContain('border-emerald-500');
      expect(link?.className).toContain('hover:border-emerald-400');
    });

    it('should apply correct sky colors for video type', () => {
      const testData = createTestCardData('video');
      const { container } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const link = container.querySelector('a');
      expect(link?.className).toContain('border-sky-500');
      expect(link?.className).toContain('hover:border-sky-400');
    });

    it('should apply correct amber colors for audio type', () => {
      const testData = createTestCardData('audio');
      const { container } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const link = container.querySelector('a');
      expect(link?.className).toContain('border-amber-500');
      expect(link?.className).toContain('hover:border-amber-400');
    });
  });

  describe('Stats Display', () => {
    it('should display stats when provided', () => {
      const testData = createTestCardData('text', {
        stats: [
          { label: 'Importados', value: 10 },
          { label: 'Palabras', value: '5,000' },
        ],
      });
      render(<InputCard data={testData} index={0} shouldAnimate={false} />);

      // Component displays stats as "label: value" format
      expect(screen.getByText('Importados:')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Palabras:')).toBeInTheDocument();
      expect(screen.getByText('5,000')).toBeInTheDocument();
    });

    it('should not show stats section when stats array is empty', () => {
      const testData = createTestCardData('text', { stats: [] });
      const { container } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const statsSection = container.querySelector('[class*="border-t"]');
      expect(statsSection).not.toBeInTheDocument();
    });

    it('should display numeric stats as provided (no automatic formatting)', () => {
      const testData = createTestCardData('text', {
        stats: [{ label: 'Count', value: 1000000 }],
      });
      render(<InputCard data={testData} index={0} shouldAnimate={false} />);

      // Component displays value as-is without locale formatting
      expect(screen.getByText('1000000')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled styling when disabled prop is true', () => {
      const testData = createTestCardData('text', { disabled: true });
      const { container } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const link = container.querySelector('a');
      expect(link?.className).toContain('opacity-50');
      expect(link?.className).toContain('cursor-not-allowed');
    });

    it('should set tabIndex to -1 when disabled', () => {
      const testData = createTestCardData('text', { disabled: true });
      const { getByRole } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const link = getByRole('link');
      expect(link).toHaveAttribute('tabIndex', '-1');
    });

    it('should show "Próximamente" overlay when disabled', () => {
      const testData = createTestCardData('text', { disabled: true });
      render(<InputCard data={testData} index={0} shouldAnimate={false} />);

      expect(screen.getByText('Próximamente')).toBeInTheDocument();
    });

    it('should be clickable when not disabled', () => {
      const testData = createTestCardData('text', { disabled: false });
      const { getByRole } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const link = getByRole('link');
      expect(link).not.toHaveAttribute('tabIndex', '-1');
      expect(link?.className).not.toContain('cursor-not-allowed');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label describing the card', () => {
      const testData = createTestCardData('text', {
        title: 'Texto',
        description: 'Descripción de prueba',
      });
      const { getByRole } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const link = getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'Texto: Descripción de prueba');
    });

    it('should have aria-hidden on decorative elements', () => {
      const testData = createTestCardData('text');
      const { container } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      // Check for aria-hidden on motion.div elements (decorative)
      const motionDivs = container.querySelectorAll('div[aria-hidden="true"]');
      expect(motionDivs.length).toBeGreaterThan(0);
    });
  });

  describe('Links and Navigation', () => {
    it('should link to the correct href', () => {
      const testData = createTestCardData('video', { href: '/custom/path' });
      const { getByRole } = render(
        <InputCard data={testData} index={0} shouldAnimate={false} />
      );

      const link = getByRole('link');
      expect(link).toHaveAttribute('href', '/custom/path');
    });
  });
});
