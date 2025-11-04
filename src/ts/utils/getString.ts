import { IStringKeys } from '../interfaces'
import { TRANSLATION_FALLBACKS } from '../constants'

/**
 * Get translated string by key from backend configuration
 * Falls back to user-friendly defaults if translation is not found
 */
export const getString = (key: keyof IStringKeys): string => {
  // Access global config passed from PHP backend
  if (window.githubReleaseBrowserConfig?.strings?.[key]) {
    return window.githubReleaseBrowserConfig.strings[key];
  }

  // Fallback to user-friendly defaults for development/testing
  return TRANSLATION_FALLBACKS[key] || key;
};
