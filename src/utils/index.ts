/**
 * Utility functions barrel export
 */
export { cn, cx } from './cn';
export {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  createEnumValidator,
  type Validator,
} from './storage';
export { getSizeClass, SIZE_CLASSES, type Size } from './sizeClass';
export { copyToClipboard } from './clipboard';
export { debounce, type DebouncedFunction } from './debounce';
export {
  type Theme,
  THEMES,
  THEME_STORAGE_KEY,
  isTheme,
  getSystemTheme,
  getStoredTheme,
  getInitialTheme,
  saveTheme,
  applyTheme,
  getOppositeTheme,
} from './theme';
export {
  KO_PREFIX,
  getLanguageFromPath,
  getBasePath,
  buildLocalizedPath,
  buildLocalizedUrl,
} from './localization';
export {
  type SEOConfig,
  type SEOMetaData,
  updateMetaTag,
  updateCanonicalLink,
  updateHreflangLink,
  updateDocumentTitle,
  buildSEOMetaData,
  applySEOMetaTags,
} from './seo';
export {
  isViewTransitionSupported,
  startViewTransition,
  createTransitionNavigate,
} from './viewTransition';
export {
  isClickOutside,
  onClickOutside,
  onEscapeKey,
  onScroll,
  focusElement,
  containsNode,
} from './dom';
export {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  allTranslations,
  getTranslations,
  getOppositeLanguage,
  updateHtmlLang,
  detectBrowserLanguage,
  isValidLanguage,
} from './i18n';
