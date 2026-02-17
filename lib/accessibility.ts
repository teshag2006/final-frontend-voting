/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

export const ARIA_LABELS = {
  // Navigation
  mainNav: 'Main navigation',
  mobileMenu: 'Mobile menu',
  closeMenu: 'Close menu',
  
  // Forms
  searchButton: 'Search',
  submitForm: 'Submit form',
  clearField: 'Clear input field',
  
  // Voting
  voteButton: 'Cast vote',
  voteConfirm: 'Confirm vote',
  voteCancel: 'Cancel voting',
  
  // Leaderboard
  sortAscending: 'Sort in ascending order',
  sortDescending: 'Sort in descending order',
  filterResults: 'Filter results',
  
  // Admin
  editButton: 'Edit',
  deleteButton: 'Delete',
  approveButton: 'Approve',
  rejectButton: 'Reject',
  
  // Profile
  editProfile: 'Edit profile information',
  changePassword: 'Change password',
  enableTwoFactor: 'Enable two-factor authentication',
};

export const KEYBOARD_SHORTCUTS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  TAB: 'Tab',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
};

// Focus management
export function focusElement(element: HTMLElement | null) {
  if (element) {
    element.focus();
    // Ensure the element is visible
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function restoreFocus(previousElement: HTMLElement | null) {
  if (previousElement && document.contains(previousElement)) {
    previousElement.focus();
  }
}

// Announce to screen readers
export function announceToScreenReaders(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

// Screen reader only text
export const srOnlyClasses = 'sr-only';

// Keyboard event handler
export function isKeyboardEvent(event: React.KeyboardEvent, keys: string[]): boolean {
  return keys.includes(event.key);
}

// Color contrast helper (for text readability)
export const MIN_CONTRAST_RATIO = 4.5; // WCAG AA standard for normal text

// Reduced motion support
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// High contrast mode support
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: more)').matches;
}

// Dark mode preference
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
