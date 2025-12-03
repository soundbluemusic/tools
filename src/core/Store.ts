/**
 * Reactive Store System
 * Replaces React Context and useState with a pub/sub pattern
 */

export type Listener<T> = (state: T, prevState: T) => void;
export type Selector<T, R> = (state: T) => R;
export type Unsubscribe = () => void;

/**
 * Reactive Store class
 * Provides centralized state management with subscriptions
 */
export class Store<T extends Record<string, unknown>> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();
  private selectorListeners: Map<Selector<T, unknown>, Set<Listener<unknown>>> =
    new Map();

  constructor(initialState: T) {
    this.state = initialState;
  }

  /**
   * Get current state
   */
  getState(): T {
    return this.state;
  }

  /**
   * Get a specific value from state using selector
   */
  select<R>(selector: Selector<T, R>): R {
    return selector(this.state);
  }

  /**
   * Update state and notify listeners
   */
  setState(updater: Partial<T> | ((prevState: T) => Partial<T>)): void {
    const prevState = this.state;
    const updates =
      typeof updater === 'function' ? updater(prevState) : updater;

    this.state = { ...this.state, ...updates };

    // Notify all listeners
    this.listeners.forEach((listener) => {
      listener(this.state, prevState);
    });

    // Notify selector listeners only if their selected value changed
    this.selectorListeners.forEach((listeners, selector) => {
      const prevValue = selector(prevState);
      const newValue = selector(this.state);

      if (!Object.is(prevValue, newValue)) {
        listeners.forEach((listener) => {
          listener(newValue, prevValue);
        });
      }
    });
  }

  /**
   * Subscribe to all state changes
   */
  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Subscribe to specific state changes using a selector
   */
  subscribeToSelector<R>(
    selector: Selector<T, R>,
    listener: Listener<R>
  ): Unsubscribe {
    if (!this.selectorListeners.has(selector as Selector<T, unknown>)) {
      this.selectorListeners.set(selector as Selector<T, unknown>, new Set());
    }

    const listeners = this.selectorListeners.get(
      selector as Selector<T, unknown>
    )!;
    listeners.add(listener as Listener<unknown>);

    return () => {
      listeners.delete(listener as Listener<unknown>);
      if (listeners.size === 0) {
        this.selectorListeners.delete(selector as Selector<T, unknown>);
      }
    };
  }

  /**
   * Reset state to initial value
   */
  reset(initialState: T): void {
    this.setState(initialState);
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
    this.selectorListeners.clear();
  }
}

/**
 * Create a store with the given initial state
 */
export function createStore<T extends Record<string, unknown>>(
  initialState: T
): Store<T> {
  return new Store(initialState);
}

/**
 * Computed value that updates when dependencies change
 */
export class Computed<T, R> {
  private store: Store<T>;
  private selector: Selector<T, R>;
  private cachedValue: R;
  private listeners: Set<Listener<R>> = new Set();

  constructor(store: Store<T>, selector: Selector<T, R>) {
    this.store = store;
    this.selector = selector;
    this.cachedValue = selector(store.getState());

    // Subscribe to store changes
    store.subscribeToSelector(selector, (newValue) => {
      const prevValue = this.cachedValue;
      this.cachedValue = newValue;

      this.listeners.forEach((listener) => {
        listener(newValue, prevValue);
      });
    });
  }

  get value(): R {
    return this.cachedValue;
  }

  subscribe(listener: Listener<R>): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/**
 * Create a computed value from a store
 */
export function computed<T extends Record<string, unknown>, R>(
  store: Store<T>,
  selector: Selector<T, R>
): Computed<T, R> {
  return new Computed(store, selector);
}

// ============================================
// Global Stores (replacing React Context)
// ============================================

export interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
}

export interface LanguageState {
  language: 'ko' | 'en';
}

export interface AppState {
  apps: Array<{
    id: string;
    name: { ko: string; en: string };
    desc: { ko: string; en: string };
    url: string;
    icon: string;
  }>;
  isLoading: boolean;
}

// Create global stores
export const themeStore = createStore<ThemeState>({
  theme: 'system',
  resolvedTheme: 'light',
});

export const languageStore = createStore<LanguageState>({
  language: 'en',
});

export const appStore = createStore<AppState>({
  apps: [],
  isLoading: true,
});
