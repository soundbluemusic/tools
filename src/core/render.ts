/**
 * DOM Rendering Utilities
 * Helper functions for working with the DOM
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * Use this for any user-provided content that will be rendered
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Escape HTML attributes (for use in attribute values)
 */
export function escapeAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Create an HTML element from a template string
 */
export function createElement(html: string): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild as HTMLElement;
}

/**
 * Create multiple elements from a template string
 */
export function createElements(html: string): NodeList {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.childNodes;
}

/**
 * Render an element into a container
 */
export function render(
  container: HTMLElement | string,
  content: string | HTMLElement
): void {
  const target =
    typeof container === 'string'
      ? document.querySelector(container)
      : container;

  if (!target) {
    console.error(`Render target not found: ${container}`);
    return;
  }

  if (typeof content === 'string') {
    target.innerHTML = content;
  } else {
    target.innerHTML = '';
    target.appendChild(content);
  }
}

/**
 * Append content to a container
 */
export function append(
  container: HTMLElement | string,
  content: string | HTMLElement
): void {
  const target =
    typeof container === 'string'
      ? document.querySelector(container)
      : container;

  if (!target) {
    console.error(`Append target not found: ${container}`);
    return;
  }

  if (typeof content === 'string') {
    target.insertAdjacentHTML('beforeend', content);
  } else {
    target.appendChild(content);
  }
}

/**
 * Prepend content to a container
 */
export function prepend(
  container: HTMLElement | string,
  content: string | HTMLElement
): void {
  const target =
    typeof container === 'string'
      ? document.querySelector(container)
      : container;

  if (!target) {
    console.error(`Prepend target not found: ${container}`);
    return;
  }

  if (typeof content === 'string') {
    target.insertAdjacentHTML('afterbegin', content);
  } else {
    target.insertBefore(content, target.firstChild);
  }
}

/**
 * Remove an element from the DOM
 */
export function remove(element: HTMLElement | string): void {
  const target =
    typeof element === 'string' ? document.querySelector(element) : element;

  target?.parentNode?.removeChild(target);
}

/**
 * Toggle a class on an element
 */
export function toggleClass(
  element: HTMLElement | string,
  className: string,
  force?: boolean
): void {
  const target =
    typeof element === 'string' ? document.querySelector(element) : element;

  target?.classList.toggle(className, force);
}

/**
 * Add classes to an element
 */
export function addClass(
  element: HTMLElement | string,
  ...classNames: string[]
): void {
  const target =
    typeof element === 'string' ? document.querySelector(element) : element;

  target?.classList.add(...classNames);
}

/**
 * Remove classes from an element
 */
export function removeClass(
  element: HTMLElement | string,
  ...classNames: string[]
): void {
  const target =
    typeof element === 'string' ? document.querySelector(element) : element;

  target?.classList.remove(...classNames);
}

/**
 * Set attributes on an element
 */
export function setAttributes(
  element: HTMLElement | string,
  attributes: Record<string, string | boolean | number>
): void {
  const target =
    typeof element === 'string'
      ? (document.querySelector(element) as HTMLElement)
      : element;

  if (!target) return;

  Object.entries(attributes).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        target.setAttribute(key, '');
      } else {
        target.removeAttribute(key);
      }
    } else {
      target.setAttribute(key, String(value));
    }
  });
}

/**
 * Set inline styles on an element
 */
export function setStyles(
  element: HTMLElement | string,
  styles: Partial<CSSStyleDeclaration>
): void {
  const target =
    typeof element === 'string'
      ? (document.querySelector(element) as HTMLElement)
      : element;

  if (!target) return;

  Object.assign(target.style, styles);
}

/**
 * Wait for DOM to be ready
 */
export function domReady(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Wait for next animation frame
 */
export function nextFrame(): Promise<number> {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

/**
 * Wait for a specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Conditionally render content
 */
export function when(condition: boolean, content: string): string {
  return condition ? content : '';
}

/**
 * Render a list of items
 */
export function each<T>(
  items: T[],
  renderer: (item: T, index: number) => string
): string {
  return items.map(renderer).join('');
}

/**
 * Join class names (like clsx/classnames)
 */
export function classNames(
  ...classes: (string | boolean | undefined | null | Record<string, boolean>)[]
): string {
  return classes
    .flatMap((cls) => {
      if (!cls) return [];
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object') {
        return Object.entries(cls)
          .filter(([, value]) => value)
          .map(([key]) => key);
      }
      return [];
    })
    .join(' ');
}

/**
 * Create a DocumentFragment from HTML string
 */
export function fragment(html: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}
