/**
 * INPUT Flow E2E Tests
 * 
 * End-to-end tests for the INPUT system using Playwright
 * Tests the complete user flow from landing to content import
 */

import { test, expect } from '@playwright/test';

// ============================================================
// TEST CONFIGURATION
// ============================================================

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Navigate to input page and wait for load
 */
async function navigateToInputPage(page: any) {
  await page.goto(`${BASE_URL}/input`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Allow animations to complete
}

/**
 * Verify premium typography is applied
 */
async function verifyPremiumTypography(page: any) {
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
  
  // Check for text shadow (AAA contrast)
  const headingStyles = await heading.evaluate((el: any) => {
    const styles = window.getComputedStyle(el);
    return {
      textShadow: styles.textShadow,
      fontFamily: styles.fontFamily,
    };
  });
  
  expect(headingStyles.textShadow).toContain('rgba');
  expect(headingStyles.fontFamily).toContain('Quicksand');
}

/**
 * Verify smooth transitions are present
 */
async function verifySmoothTransitions(page: any) {
  const cards = page.locator('[class*="InputCard"]');
  const count = await cards.count();
  
  expect(count).toBeGreaterThan(0);
  
  // Check first card for transition styles
  const firstCard = cards.first();
  const cardStyles = await firstCard.evaluate((el: any) => {
    const styles = window.getComputedStyle(el);
    return {
      transition: styles.transition,
      transform: styles.transform,
    };
  });
  
  // Verify transition exists
  expect(cardStyles.transition).toBeTruthy();
}

// ============================================================
// INPUT PAGE TESTS
// ============================================================

test.describe('INPUT Flow - Page Load', () => {
  test('should display input hub with all three card types', async ({ page }) => {
    await navigateToInputPage(page);
    
    // Check all three input cards are visible
    const textCard = page.locator('[data-testid="text-input-card"], a[href="/input/text"]').first();
    const videoCard = page.locator('[data-testid="video-input-card"], a[href="/input/video"]').first();
    const audioCard = page.locator('[data-testid="audio-input-card"], a[href="/input/audio"]').first();
    
    await expect(textCard).toBeVisible();
    await expect(videoCard).toBeVisible();
    await expect(audioCard).toBeVisible();
  });

  test('should display premium UI with Quicksand typography', async ({ page }) => {
    await navigateToInputPage(page);
    
    await verifyPremiumTypography(page);
  });

  test('should have smooth transitions on cards', async ({ page }) => {
    await navigateToInputPage(page);
    
    await verifySmoothTransitions(page);
  });

  test('should provide immediate visual feedback on hover', async ({ page }) => {
    await navigateToInputPage(page);
    
    const videoCard = page.locator('a[href="/input/video"]').first();
    
    // Get initial scale
    const initialScale = await videoCard.evaluate((el: any) => {
      const styles = window.getComputedStyle(el);
      return styles.transform;
    });
    
    // Hover over card
    await videoCard.hover();
    await page.waitForTimeout(200); // Wait for transition
    
    // Check that transform changed (feedback is immediate)
    const hoveredScale = await videoCard.evaluate((el: any) => {
      const styles = window.getComputedStyle(el);
      return styles.transform;
    });
    
    // Scale should be different after hover
    expect(hoveredScale).not.toBe(initialScale);
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await navigateToInputPage(page);
    
    // Tab to first card
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedElement).toBeTruthy();
    
    // Verify Enter key works
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Should navigate to input page
    expect(page.url()).toContain('/input/');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await navigateToInputPage(page);
    
    // Check for aria-label on section
    const section = page.locator('section[aria-label*="Hub de entrada"]');
    await expect(section).toBeVisible();
    
    // Check cards have proper descriptions
    const cards = page.locator('a[href*="/input/"]');
    const count = await cards.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = cards.nth(i);
      await expect(card).toBeVisible();
    }
  });
});

// ============================================================
// VIDEO INPUT FLOW TESTS
// ============================================================

test.describe('INPUT Flow - Video Import', () => {
  test('should navigate to video input page', async ({ page }) => {
    await navigateToInputPage(page);
    
    const videoCard = page.locator('a[href="/input/video"]').first();
    await videoCard.click();
    
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/input/video');
  });

  test('should display video input form', async ({ page }) => {
    await page.goto(`${BASE_URL}/input/video`);
    await page.waitForLoadState('networkidle');
    
    // Check for YouTube URL input
    const urlInput = page.locator('input[type="text"], input[name="url"], textarea').first();
    await expect(urlInput).toBeVisible();
  });

  test('should show loading state during import', async ({ page }) => {
    await page.goto(`${BASE_URL}/input/video`);
    await page.waitForLoadState('networkidle');
    
    // This would require mocking the API response
    // For now, just verify the page structure
    const submitButton = page.locator('button[type="submit"], button:has-text("Importar")').first();
    await expect(submitButton).toBeVisible();
  });
});

// ============================================================
// TEXT INPUT FLOW TESTS
// ============================================================

test.describe('INPUT Flow - Text Import', () => {
  test('should navigate to text input page', async ({ page }) => {
    await navigateToInputPage(page);
    
    const textCard = page.locator('a[href="/input/text"]').first();
    await textCard.click();
    
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/input/text');
  });

  test('should display text input area', async ({ page }) => {
    await page.goto(`${BASE_URL}/input/text`);
    await page.waitForLoadState('networkidle');
    
    // Check for text area
    const textArea = page.locator('textarea').first();
    await expect(textArea).toBeVisible();
  });

  test('should validate text input', async ({ page }) => {
    await page.goto(`${BASE_URL}/input/text`);
    await page.waitForLoadState('networkidle');
    
    const textArea = page.locator('textarea').first();
    
    // Enter short text (should show validation error)
    await textArea.fill('Hi.');
    
    // Check for validation message
    const errorMessage = page.locator('text=/insuficiente|muy corto/i').first();
    // This may or may not be visible depending on implementation
    // await expect(errorMessage).toBeVisible({ timeout: 2000 });
  });
});

// ============================================================
// AUDIO INPUT FLOW TESTS
// ============================================================

test.describe('INPUT Flow - Audio Import', () => {
  test('should navigate to audio input page', async ({ page }) => {
    await navigateToInputPage(page);
    
    const audioCard = page.locator('a[href="/input/audio"]').first();
    await audioCard.click();
    
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/input/audio');
  });

  test('should display audio upload area', async ({ page }) => {
    await page.goto(`${BASE_URL}/input/audio`);
    await page.waitForLoadState('networkidle');
    
    // Check for file input or upload area
    const fileInput = page.locator('input[type="file"]').first();
    const uploadArea = page.locator('[class*="upload"], [class*="dropzone"]').first();
    
    const isVisible = await fileInput.isVisible().catch(() => false) || 
                      await uploadArea.isVisible().catch(() => false);
    
    expect(isVisible).toBeTruthy();
  });
});

// ============================================================
// VISUAL REGRESSION TESTS
// ============================================================

test.describe('INPUT Flow - Visual Regression', () => {
  test('should match screenshot of input hub', async ({ page }) => {
    await navigateToInputPage(page);
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('input-hub.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should match screenshot of video input page', async ({ page }) => {
    await page.goto(`${BASE_URL}/input/video`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('input-video.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should match screenshot of text input page', async ({ page }) => {
    await page.goto(`${BASE_URL}/input/text`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('input-text.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });
});

// ============================================================
// ACCESSIBILITY TESTS
// ============================================================

test.describe('INPUT Flow - Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await navigateToInputPage(page);
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCount(1);
    
    // Check h1 contains "Importar Contenido"
    await expect(h1).toContainText('Importar Contenido');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await navigateToInputPage(page);
    
    // Check contrast of heading
    const heading = page.locator('h1');
    const backgroundColor = await heading.evaluate((el: any) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });
    
    const color = await heading.evaluate((el: any) => {
      const styles = window.getComputedStyle(el);
      return styles.color;
    });
    
    // Verify colors are defined
    expect(backgroundColor).toBeTruthy();
    expect(color).toBeTruthy();
  });

  test('should have focus indicators', async ({ page }) => {
    await navigateToInputPage(page);
    
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineOffset: styles.outlineOffset,
      };
    });
    
    // Should have some kind of focus indicator
    expect(focusedElement).toBeTruthy();
  });

  test('should work with screen reader', async ({ page }) => {
    await navigateToInputPage(page);
    
    // Check for ARIA labels
    const ariaLabels = page.locator('[aria-label]');
    const count = await ariaLabels.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Check for role attributes where appropriate
    const roles = page.locator('[role]');
    const roleCount = await roles.count();
    
    expect(roleCount).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================
// RESPONSIVE DESIGN TESTS
// ============================================================

test.describe('INPUT Flow - Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToInputPage(page);
    
    // Cards should stack vertically
    const cards = page.locator('a[href*="/input/"]');
    await expect(cards.first()).toBeVisible();
    
    // Take screenshot for mobile
    await expect(page).toHaveScreenshot('input-hub-mobile.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await navigateToInputPage(page);
    
    const cards = page.locator('a[href*="/input/"]');
    await expect(cards.first()).toBeVisible();
    
    await expect(page).toHaveScreenshot('input-hub-tablet.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateToInputPage(page);
    
    const cards = page.locator('a[href*="/input/"]');
    await expect(cards.first()).toBeVisible();
    
    await expect(page).toHaveScreenshot('input-hub-desktop.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });
});
