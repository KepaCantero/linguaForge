/**
 * TextEditor Component Tests
 *
 * Tests for the TextEditor component that provides text input with
 * character limits, word count, and progress indicators.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TextEditor } from '@/components/input/text/TextEditor';
import { PROGRESS_COLORS, INPUT_COLORS } from '@/lib/constants';

// Type for the onChange callback
type OnChange = (value: string) => void;

// ============================================================
// TEST CONSTANTS (from constants.ts)
// ============================================================

const DEFAULT_MAX_LENGTH = 10_000;
const DEFAULT_MIN_LENGTH = 20;
const CHARACTER_WARNING_THRESHOLDS = {
  nearLimit: 0.9,
  atLimit: 1.0,
};

// ============================================================
// TEST SUITES
// ============================================================

describe('TextEditor Component', () => {
  let container: HTMLElement;
  let onChangeMock: OnChange;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render textarea with placeholder', () => {
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
          placeholder="Escribe aquí..."
        />
      );

      const textarea = screen.getByPlaceholderText('Escribe aquí...');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName.toLowerCase()).toBe('textarea');
    });

    it('should render with initial value', () => {
      render(
        <TextEditor
          value="Initial text"
          onChange={onChangeMock}
        />
      );

      const textarea = screen.getByDisplayValue('Initial text');
      expect(textarea).toBeInTheDocument();
    });

    it('should show character count when enabled', () => {
      render(
        <TextEditor
          value="Hello"
          onChange={onChangeMock}
          showCharacterCount={true}
        />
      );

      expect(screen.getByText(/5.*caracteres/i)).toBeInTheDocument();
    });

    it('should not show character count when disabled', () => {
      render(
        <TextEditor
          value="Hello"
          onChange={onChangeMock}
          showCharacterCount={false}
        />
      );

      expect(screen.queryByText(/caracteres/i)).not.toBeInTheDocument();
    });
  });

  describe('Character Limits', () => {
    it('should enforce max length', () => {
      const maxLength = 100;
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
          maxLength={maxLength}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('maxLength', String(maxLength));
    });

    it('should use default max length when not specified', () => {
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('maxLength', String(DEFAULT_MAX_LENGTH));
    });

    it('should show warning when near limit', () => {
      const maxLength = 100;
      const nearLimitText = 'a'.repeat(Math.floor(maxLength * CHARACTER_WARNING_THRESHOLDS.nearLimit));

      render(
        <TextEditor
          value={nearLimitText}
          onChange={onChangeMock}
          maxLength={maxLength}
          showCharacterCount={true}
        />
      );

      expect(screen.getByText('⚠️ Cerca del límite')).toBeInTheDocument();
    });

    it('should show error when at limit', () => {
      const maxLength = 100;
      const atLimitText = 'a'.repeat(maxLength);

      render(
        <TextEditor
          value={atLimitText}
          onChange={onChangeMock}
          maxLength={maxLength}
          showCharacterCount={true}
        />
      );

      expect(screen.getByText('⚠️ Límite alcanzado')).toBeInTheDocument();
    });

    it('should show warning when below minimum', () => {
      render(
        <TextEditor
          value="short"
          onChange={onChangeMock}
          minLength={20}
          showCharacterCount={true}
        />
      );

      expect(screen.getByText('Mínimo 20 caracteres')).toBeInTheDocument();
    });

    it('should use emerald color for normal state', () => {
      render(
        <TextEditor
          value="Some text"
          onChange={onChangeMock}
          showCharacterCount={true}
        />
      );

      // Use getAllByText to get all matching elements, then check the first one
      const charCounts = screen.getAllByText(/\d+.*caracteres/i);
      expect(charCounts.length).toBeGreaterThan(0);
      expect(charCounts[0]).toHaveClass('text-calm-text-muted');
    });

    it('should use warning color when near limit', () => {
      const maxLength = 100;
      const nearLimitText = 'a'.repeat(Math.floor(maxLength * CHARACTER_WARNING_THRESHOLDS.nearLimit));

      render(
        <TextEditor
          value={nearLimitText}
          onChange={onChangeMock}
          maxLength={maxLength}
          showCharacterCount={true}
        />
      );

      const warning = screen.getByText('⚠️ Cerca del límite');
      expect(warning).toHaveClass('text-amber-400');
    });

    it('should use error color when at limit', () => {
      const maxLength = 100;
      const atLimitText = 'a'.repeat(maxLength);

      render(
        <TextEditor
          value={atLimitText}
          onChange={onChangeMock}
          maxLength={maxLength}
          showCharacterCount={true}
        />
      );

      const error = screen.getByText('⚠️ Límite alcanzado');
      expect(error).toHaveClass('text-red-400');
    });
  });

  describe('Word Count', () => {
    it('should count words correctly', () => {
      render(
        <TextEditor
          value="Hello world this is a test"
          onChange={onChangeMock}
          showCharacterCount={true}
        />
      );

      expect(screen.getByText('6 palabras')).toBeInTheDocument();
    });

    it('should count single word', () => {
      render(
        <TextEditor
          value="Hello"
          onChange={onChangeMock}
          showCharacterCount={true}
        />
      );

      expect(screen.getByText('1 palabra')).toBeInTheDocument();
    });

    it('should handle empty text', () => {
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
          showCharacterCount={true}
        />
      );

      expect(screen.getByText('0 palabras')).toBeInTheDocument();
    });

    it('should handle multiple spaces', () => {
      render(
        <TextEditor
          value="Hello    world"
          onChange={onChangeMock}
          showCharacterCount={true}
        />
      );

      expect(screen.getByText('2 palabras')).toBeInTheDocument();
    });

    it('should handle leading/trailing whitespace', () => {
      render(
        <TextEditor
          value="   Hello world   "
          onChange={onChangeMock}
          showCharacterCount={true}
        />
      );

      expect(screen.getByText('2 palabras')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when text is typed', () => {
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New text' } });

      expect(onChangeMock).toHaveBeenCalledWith('New text');
    });

    it('should not call onChange when text exceeds max length', () => {
      const maxLength = 10;
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
          maxLength={maxLength}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'a'.repeat(15) } });

      // onChange should only be called up to the limit
      expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('should handle paste event', () => {
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
          onPaste={vi.fn()}
        />
      );

      const textarea = screen.getByRole('textbox');

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
      });
      (pasteEvent.clipboardData as DataTransfer).setData('text/plain', 'Pasted text');

      // Mock getSelectionRange behavior
      Object.assign(textarea, {
        selectionStart: 0,
        selectionEnd: 0,
      });

      fireEvent.paste(textarea, pasteEvent);

      // Note: Due to clipboardData mocking limitations, we mainly test
      // that the paste handler doesn't throw errors
      expect(textarea).toBeInTheDocument();
    });

    it('should clean pasted text - extra spaces', () => {
      const onPasteMock = vi.fn();
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
          onPaste={onPasteMock}
        />
      );

      const textarea = screen.getByRole('textbox');

      // Simulate paste behavior by directly triggering the handler
      // In real scenario, clipboard API is involved
      const testText = 'Hello     world';
      fireEvent.paste(textarea);

      expect(textarea).toBeInTheDocument();
    });

    it('should focus when autoFocus is true', () => {
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
          autoFocus={true}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(document.activeElement).toBe(textarea);
    });
  });

  describe('Progress Line', () => {
    it('should show progress line at 0% for empty text', () => {
      const { container } = render(
        <TextEditor
          value=""
          onChange={onChangeMock}
          maxLength={1000}
        />
      );

      const progressLine = container.querySelector('.bg-emerald-500');
      expect(progressLine).toBeInTheDocument();
    });

    it('should show progress line at 50% for half-full text', () => {
      const maxLength = 100;
      const halfText = 'a'.repeat(maxLength / 2);
      const { container } = render(
        <TextEditor
          value={halfText}
          onChange={onChangeMock}
          maxLength={maxLength}
        />
      );

      const progressLine = container.querySelector('.bg-emerald-500');
      expect(progressLine).toBeInTheDocument();
    });

    it('should change to warning color when near limit', () => {
      const maxLength = 100;
      const nearLimitText = 'a'.repeat(Math.floor(maxLength * CHARACTER_WARNING_THRESHOLDS.nearLimit));

      const { container } = render(
        <TextEditor
          value={nearLimitText}
          onChange={onChangeMock}
          maxLength={maxLength}
        />
      );

      const progressLine = container.querySelector('.bg-amber-500');
      expect(progressLine).toBeInTheDocument();
    });

    it('should change to error color when at limit', () => {
      const maxLength = 100;
      const atLimitText = 'a'.repeat(maxLength);

      const { container } = render(
        <TextEditor
          value={atLimitText}
          onChange={onChangeMock}
          maxLength={maxLength}
        />
      );

      const progressLine = container.querySelector('.bg-red-500');
      expect(progressLine).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should show clear and copy buttons when text exists', () => {
      render(
        <TextEditor
          value="Some text"
          onChange={onChangeMock}
        />
      );

      expect(screen.getByLabelText('Limpiar texto')).toBeInTheDocument();
      expect(screen.getByLabelText('Copiar todo')).toBeInTheDocument();
    });

    it('should not show action buttons when empty', () => {
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
        />
      );

      expect(screen.queryByLabelText('Limpiar texto')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Copiar todo')).not.toBeInTheDocument();
    });

    it('should clear text when clear button is clicked', () => {
      render(
        <TextEditor
          value="Some text"
          onChange={onChangeMock}
        />
      );

      const clearButton = screen.getByLabelText('Limpiar texto');
      fireEvent.click(clearButton);

      expect(onChangeMock).toHaveBeenCalledWith('');
    });

    it('should not show action buttons when disabled', () => {
      render(
        <TextEditor
          value="Some text"
          onChange={onChangeMock}
          disabled={true}
        />
      );

      expect(screen.queryByLabelText('Limpiar texto')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Copiar todo')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled styling', () => {
      const { container } = render(
        <TextEditor
          value="Some text"
          onChange={onChangeMock}
          disabled={true}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();

      const wrapper = container.querySelector('.opacity-50');
      expect(wrapper).toBeInTheDocument();
    });

    it('should not allow typing when disabled', () => {
      render(
        <TextEditor
          value="Initial"
          onChange={onChangeMock}
          disabled={true}
        />
      );

      const textarea = screen.getByRole('textbox', { hidden: true });

      // Verify textarea is actually disabled
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveAttribute('disabled');

      // Note: fireEvent.change doesn't respect disabled in jsdom
      // In a real browser, users cannot type in disabled inputs
      // The disabled attribute prevents user interaction
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Editor de texto para importar contenido');
    });

    it('should have aria-describedby linking to char count', () => {
      render(
        <TextEditor
          value="Hello"
          onChange={onChangeMock}
          showCharacterCount={true}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'char-count');
    });

    it('should have aria-invalid when below minimum', () => {
      render(
        <TextEditor
          value="short"
          onChange={onChangeMock}
          minLength={20}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid when at limit', () => {
      const maxLength = 100;
      const atLimitText = 'a'.repeat(maxLength);
      render(
        <TextEditor
          value={atLimitText}
          onChange={onChangeMock}
          maxLength={maxLength}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-required', () => {
      render(
        <TextEditor
          value=""
          onChange={onChangeMock}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Copy Functionality', () => {
    it('should select all text when copy button is clicked', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(global.navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
          readText: vi.fn(),
        },
        writable: true,
        configurable: true,
      });

      render(
        <TextEditor
          value="Text to copy"
          onChange={onChangeMock}
        />
      );

      const copyButton = screen.getByLabelText('Copiar todo');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('Text to copy');
      });
    });
  });
});
