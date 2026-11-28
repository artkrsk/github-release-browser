import { IStringKeys } from '../interfaces'
import { TRANSLATION_FALLBACKS } from '../constants'

/**
 * Get translated string by key from backend configuration
 * Falls back to TRANSLATION_FALLBACKS, then to the key itself
 */
export const getString = (key: keyof IStringKeys): string => {
  // Access global config passed from PHP backend
  if (window.githubReleaseBrowserConfig?.strings?.[key]) {
    return window.githubReleaseBrowserConfig.strings[key];
  }

  // Config absent (development/testing) or key missing from the PHP strings map
  return TRANSLATION_FALLBACKS[key] || key;
};
