/**
 * Vanilla TypeScript Component Base Class
 * Replaces React functional components with a class-based approach
 */

export interface ComponentOptions {
  /** Target element or selector to mount the component */
  target?: HTMLElement | string;
  /** Initial props */
  props?: Record<string, unknown>;
}

/**
 * Base Component class for vanilla TypeScript components
 * Provides lifecycle methods and reactive rendering
 */
export abstract class Component<
  TProps extends Record<string, unknown> = Record<string, unknown>,
  TState extends Record<string, unknown> = Record<string, unknown>,
> {
  protected element: HTMLElement | null = null;
  protected props: TProps;
  protected state: TState;
  private mounted = false;
  private eventListeners: Array<{
    element: EventTarget;
    type: string;
    handler: EventListener;
    options?: AddEventListenerOptions;
  }> = [];

  constructor(props: TProps = {} as TProps) {
    this.props = props;
    this.state = this.getInitialState();
  }

  /**
   * Override to provide initial state
   */
  protected getInitialState(): TState {
    return {} as TState;
  }

  /**
   * Override to define the component's HTML template
   */
  protected abstract render(): string;

  /**
   * Override to run after component is mounted to DOM
   */
  protected onMount(): void {}

  /**
   * Override to run before component is unmounted
   */
  protected onDestroy(): void {}

  /**
   * Override to run after each update
   * @param prevState - Previous state before update
   * @param prevProps - Previous props before update
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onUpdate(prevState: TState, prevProps: TProps): void {}

  /**
   * Mount the component to a target element
   */
  mount(target: HTMLElement | string): this {
    const container =
      typeof target === 'string' ? document.querySelector(target) : target;

    if (!container) {
      console.error(`Mount target not found: ${target}`);
      return this;
    }

    this.element = container as HTMLElement;
    this.update();
    this.mounted = true;
    this.onMount();

    return this;
  }

  /**
   * Unmount the component and cleanup
   */
  unmount(): void {
    if (!this.mounted) return;

    this.onDestroy();
    this.removeAllEventListeners();

    if (this.element) {
      this.element.innerHTML = '';
    }

    this.mounted = false;
    this.element = null;
  }

  /**
   * Update state and trigger re-render
   */
  protected setState(newState: Partial<TState>): void {
    const prevState = { ...this.state };
    const prevProps = { ...this.props };

    this.state = { ...this.state, ...newState };
    this.update();

    if (this.mounted) {
      this.onUpdate(prevState, prevProps);
    }
  }

  /**
   * Update props and trigger re-render
   */
  setProps(newProps: Partial<TProps>): void {
    const prevState = { ...this.state };
    const prevProps = { ...this.props };

    this.props = { ...this.props, ...newProps };
    this.update();

    if (this.mounted) {
      this.onUpdate(prevState, prevProps);
    }
  }

  /**
   * Re-render the component
   */
  protected update(): void {
    if (!this.element) return;

    // Store scroll position
    const scrollTop = this.element.scrollTop;

    // Remove old event listeners before updating DOM
    this.removeAllEventListeners();

    // Update innerHTML
    this.element.innerHTML = this.render();

    // Restore scroll position
    this.element.scrollTop = scrollTop;

    // Re-bind event listeners
    this.bindEvents();
  }

  /**
   * Override to bind event listeners after each render
   */
  protected bindEvents(): void {}

  /**
   * Helper to add event listeners that will be auto-cleaned up
   */
  protected addEventListener<K extends keyof HTMLElementEventMap>(
    selector: string | HTMLElement,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): void {
    const elements =
      typeof selector === 'string'
        ? this.element?.querySelectorAll(selector)
        : [selector];

    elements?.forEach((el) => {
      const boundHandler = handler.bind(this) as EventListener;
      el.addEventListener(type, boundHandler, options);
      this.eventListeners.push({
        element: el,
        type,
        handler: boundHandler,
        options,
      });
    });
  }

  /**
   * Helper to add a single event listener by ID
   */
  protected addEventListenerById<K extends keyof HTMLElementEventMap>(
    id: string,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): void {
    const el = this.element?.querySelector(`#${id}`);
    if (el) {
      const boundHandler = handler.bind(this) as EventListener;
      el.addEventListener(type, boundHandler, options);
      this.eventListeners.push({
        element: el,
        type,
        handler: boundHandler,
        options,
      });
    }
  }

  /**
   * Remove all registered event listeners
   */
  private removeAllEventListeners(): void {
    this.eventListeners.forEach(({ element, type, handler, options }) => {
      element.removeEventListener(type, handler, options);
    });
    this.eventListeners = [];
  }

  /**
   * Query an element within this component
   */
  protected query<T extends HTMLElement = HTMLElement>(
    selector: string
  ): T | null {
    return this.element?.querySelector(selector) as T | null;
  }

  /**
   * Query all elements within this component
   */
  protected queryAll<T extends HTMLElement = HTMLElement>(
    selector: string
  ): NodeListOf<T> {
    return (
      this.element?.querySelectorAll(selector) ??
      ([] as unknown as NodeListOf<T>)
    );
  }

  /**
   * Check if component is mounted
   */
  get isMounted(): boolean {
    return this.mounted;
  }
}

/**
 * Create a simple functional component (for static content)
 */
export function createComponent(
  render: (props: Record<string, unknown>) => string
): (props?: Record<string, unknown>) => string {
  return (props = {}) => render(props);
}

/**
 * HTML template tag for syntax highlighting and escaping
 */
export function html(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return strings.reduce((result, str, i) => {
    const value = values[i];
    if (value === undefined || value === null) {
      return result + str;
    }
    if (Array.isArray(value)) {
      return result + str + value.join('');
    }
    return result + str + String(value);
  }, '');
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
