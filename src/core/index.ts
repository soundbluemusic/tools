/**
 * Core Vanilla TypeScript Framework
 *
 * This module provides the foundation for building vanilla TypeScript
 * applications without React.
 *
 * @example
 * ```ts
 * import { Component, html, router, createStore } from './core';
 *
 * class MyComponent extends Component {
 *   render() {
 *     return html`<div>Hello World</div>`;
 *   }
 * }
 * ```
 */

// Component system
export {
  Component,
  createComponent,
  html,
  escapeHtml,
  type ComponentOptions,
} from './Component';

// State management
export {
  Store,
  createStore,
  Computed,
  computed,
  themeStore,
  languageStore,
  appStore,
  type Listener,
  type Selector,
  type Unsubscribe,
  type ThemeState,
  type LanguageState,
  type AppState,
} from './Store';

// Router
export {
  router,
  handleLinkClick,
  createLink,
  initializeLinks,
  type RouteConfig,
  type RouteMatch,
  type RouteChangeListener,
} from './Router';

// Render utilities
export {
  createElement,
  createElements,
  render,
  append,
  prepend,
  remove,
  toggleClass,
  addClass,
  removeClass,
  setAttributes,
  setStyles,
  domReady,
  nextFrame,
  wait,
  when,
  each,
  classNames,
  fragment,
  safeHTML,
} from './render';
