/**
 * InputHub Component Tests
 *
 * Tests for the InputHub component that displays all input type cards
 * and statistics from useInputHubStats hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputHub } from '@/components/input/InputHub';
import { INPUT_COLORS } from '@/lib/constants';

// Mock the useInputHubStats hook
vi.mock('@/app/input/hooks/useInputHubStats', () => ({
  useInputHubStats: () => ({
    textCount: 5,
    wordsRead: 12500,
    videoViews: 3,
    videoHours: '2.50',
    audioCount: 2,
    audioHours: '1.25',
  }),
}));

// Mock the useInputStore
vi.mock('@/store/useInputStore', () => ({
  useInputStore: () => ({
    stats: {},
    events: [],
    markTextAsRead: vi.fn(),
    markVideoWatched: vi.fn(),
    markAudioListened: vi.fn(),
  }),
}));

// Mock the useProgressStore
vi.mock('@/store/useProgressStore', () => ({
  useProgressStore: () => ({
    activeLanguage: 'fr',
    activeLevel: 'A1',
  }),
}));

// ============================================================
// TEST SUITES
// ============================================================

describe('InputHub Component', () => {
  describe('Rendering', () => {
    it('should render the hub title', () => {
      render(<InputHub />);

      expect(screen.getByText('Importar Contenido')).toBeInTheDocument();
    });

    it('should render the hub description', () => {
      render(<InputHub />);

      expect(
        screen.getByText('Elige cómo quieres agregar nuevo material para estudiar')
      ).toBeInTheDocument();
    });

    it('should render all three input cards', () => {
      render(<InputHub />);

      // Check for all input types
      expect(screen.getByText('Texto')).toBeInTheDocument();
      expect(screen.getByText('Video')).toBeInTheDocument();
      expect(screen.getByText('Audio')).toBeInTheDocument();
    });

    it('should render with animations when shouldAnimate is true', () => {
      const { container } = render(<InputHub shouldAnimate={true} />);

      // When animations are enabled, orbital accent should render
      expect(container.querySelector('[class*="h-32"]')).toBeInTheDocument();
    });
  });

  describe('Input Type Cards', () => {
    it('should display text input card with description', () => {
      render(<InputHub />);

      expect(screen.getByText('Texto')).toBeInTheDocument();
      expect(
        screen.getByText('Pega texto para analizar, escuchar con TTS premium y estudiar en bloques')
      ).toBeInTheDocument();
    });

    it('should display video input card with description', () => {
      render(<InputHub />);

      expect(screen.getByText('Video')).toBeInTheDocument();
      expect(
        screen.getByText('Importa videos de YouTube con transcripción y controles premium')
      ).toBeInTheDocument();
    });

    it('should display audio input card with description', () => {
      render(<InputHub />);

      expect(screen.getByText('Audio')).toBeInTheDocument();
      expect(
        screen.getByText('Sube archivos de audio para transcribir y estudiar fragmentos')
      ).toBeInTheDocument();
    });

    it('should show correct icons for each card type', () => {
      render(<InputHub />);

      expect(screen.getByText('📝')).toBeInTheDocument(); // Text
      expect(screen.getByText('🎬')).toBeInTheDocument(); // Video
      expect(screen.getByText('🎧')).toBeInTheDocument(); // Audio
    });
  });

  describe('Statistics Display', () => {
    it('should display text input statistics', () => {
      render(<InputHub />);

      expect(screen.getByText('Importados')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Palabras')).toBeInTheDocument();
      expect(screen.getByText('12,500')).toBeInTheDocument();
    });

    it('should display video input statistics', () => {
      render(<InputHub />);

      expect(screen.getByText('Vistos')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Horas')).toBeInTheDocument();
      expect(screen.getByText('2.50')).toBeInTheDocument();
    });

    it('should display audio input statistics', () => {
      render(<InputHub />);

      expect(screen.getByText('Escuchados')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1.25')).toBeInTheDocument();
    });
  });

  describe('Card Status', () => {
    it('should show ready status for text when there are imports', () => {
      const { container } = render(<InputHub />);

      // Text has 5 imports > 0, so should be ready
      const textCard = container.querySelector('[href="/input/text"]');
      expect(textCard).toBeInTheDocument();
    });

    it('should show ready status for video when there are views', () => {
      const { container } = render(<InputHub />);

      // Video has 3 views > 0, so should be ready
      const videoCard = container.querySelector('[href="/input/video"]');
      expect(videoCard).toBeInTheDocument();
    });

    it('should show ready status for audio when there are listens', () => {
      const { container } = render(<InputHub />);

      // Audio has 2 listens > 0, so should be ready
      const audioCard = container.querySelector('[href="/input/audio"]');
      expect(audioCard).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should link text card to /input/text', () => {
      const { container } = render(<InputHub />);

      const textLink = container.querySelector('[href="/input/text"]');
      expect(textLink).toBeInTheDocument();
    });

    it('should link video card to /input/video', () => {
      const { container } = render(<InputHub />);

      const videoLink = container.querySelector('[href="/input/video"]');
      expect(videoLink).toBeInTheDocument();
    });

    it('should link audio card to /input/audio', () => {
      const { container } = render(<InputHub />);

      const audioLink = container.querySelector('[href="/input/audio"]');
      expect(audioLink).toBeInTheDocument();
    });
  });

  describe('Orbital Accent Animation', () => {
    it('should render orbital accent when shouldAnimate is true', () => {
      const { container } = render(<InputHub shouldAnimate={true} />);

      const orbitalContainer = container.querySelector('[class*="overflow-hidden"]');
      expect(orbitalContainer).toBeInTheDocument();
    });

    it('should not render animated elements when shouldAnimate is false', () => {
      const { container } = render(<InputHub shouldAnimate={false} />);

      // With animations disabled, the orbital particles should not render
      const particles = container.querySelectorAll('[class*="w-1.5 h-1.5 rounded-full"]');
      expect(particles.length).toBe(0);
    });
  });

  describe('Layout', () => {
    it('should use grid layout for cards', () => {
      const { container } = render(<InputHub />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid?.className).toContain('md:grid-cols-3');
    });

    it('should have proper section label for accessibility', () => {
      render(<InputHub />);

      const section = screen.getByLabelText(/Hub de entrada.*Selecciona tipo de contenido/i);
      expect(section).toBeInTheDocument();
    });
  });

  describe('Color Theming', () => {
    it('should use correct colors from INPUT_COLORS constant for text', () => {
      const { container } = render(<InputHub />);

      const expectedColor = INPUT_COLORS.text.hex;
      expect(expectedColor).toBe('#10B981');
    });

    it('should use correct colors from INPUT_COLORS constant for video', () => {
      const { container } = render(<InputHub />);

      const expectedColor = INPUT_COLORS.video.hex;
      expect(expectedColor).toBe('#0EA5E9');
    });

    it('should use correct colors from INPUT_COLORS constant for audio', () => {
      const { container } = render(<InputHub />);

      const expectedColor = INPUT_COLORS.audio.hex;
      expect(expectedColor).toBe('#F59E0B');
    });
  });
});
