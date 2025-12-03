/**
 * Core Application Type Definitions - Vanilla TypeScript
 * Using readonly for immutability optimization
 */

// ============================================
// App Types
// ============================================

/** Configuration for a single app/tool (bilingual) */
export interface AppConfig {
  readonly name: {
    readonly ko: string;
    readonly en: string;
  };
  readonly desc: {
    readonly ko: string;
    readonly en: string;
  };
  readonly icon: string;
  readonly size: number; // Size in bytes
  readonly order?: number; // Display order (lower = first)
}

/** Full app object with computed properties */
export interface App extends AppConfig {
  readonly id: number;
  readonly url: string;
}

/** Immutable list of apps */
export type AppList = readonly App[];

// ============================================
// Sort Types
// ============================================

/** Available sort options for apps */
export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'name-long'
  | 'name-short'
  | 'size-large'
  | 'size-small';

/** Sort option with label for UI */
export interface SortOptionItem {
  readonly value: SortOption;
  readonly label: string;
}

// ============================================
// Common Types
// ============================================

/** Generic callback function type */
export type Callback<T = void> = () => T;

/** Generic async callback function type */
export type AsyncCallback<T = void> = () => Promise<T>;

/** Makes specified keys required */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Makes specified keys optional */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/** Deep partial type */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/** Deep readonly type */
export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

/** Make all properties nullable */
export type Nullable<T> = { [P in keyof T]: T[P] | null };

// ============================================
// Component Props Types
// ============================================

/** Base props for all components */
export interface BaseComponentProps {
  /** Additional class names */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

/** Props with children (vanilla - using string) */
export interface WithChildren {
  children: string;
}

/** Props with optional children */
export interface WithOptionalChildren {
  children?: string;
}

// ============================================
// API / Data Types
// ============================================

/** Generic API response wrapper */
export interface ApiResponse<T> {
  readonly data: T;
  readonly success: boolean;
  readonly message?: string;
  readonly timestamp: number;
}

/** Error response type */
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

/** Pagination params */
export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly total?: number;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly pagination: Required<PaginationParams>;
  readonly hasMore: boolean;
}

// ============================================
// State Types
// ============================================

/** Loading states */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/** Generic async state */
export interface AsyncState<T, E = Error> {
  readonly data: T | null;
  readonly status: LoadingState;
  readonly error: E | null;
}

/** Create initial async state */
export function createAsyncState<T>(): AsyncState<T> {
  return {
    data: null,
    status: 'idle',
    error: null,
  };
}

// ============================================
// Event Types (Vanilla TypeScript)
// ============================================

/** Mouse event handler */
export type MouseEventHandler<T extends HTMLElement = HTMLElement> = (
  event: MouseEvent & { currentTarget: T }
) => void;

/** Keyboard event handler */
export type KeyboardEventHandler<T extends HTMLElement = HTMLElement> = (
  event: KeyboardEvent & { currentTarget: T }
) => void;

/** Change event handler */
export type ChangeEventHandler<T extends HTMLInputElement = HTMLInputElement> =
  (event: Event & { currentTarget: T }) => void;

/** Focus event handler */
export type FocusEventHandler<T extends HTMLElement = HTMLElement> = (
  event: FocusEvent & { currentTarget: T }
) => void;

/** Form event handler */
export type FormEventHandler<T extends HTMLFormElement = HTMLFormElement> = (
  event: Event & { currentTarget: T }
) => void;
