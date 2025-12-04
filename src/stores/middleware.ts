/**
 * Zustand Middleware Utilities
 * 프로덕션 환경에서 불필요한 미들웨어 오버헤드 제거
 */
import { devtools as zustandDevtools } from 'zustand/middleware';
import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

/**
 * 개발 환경에서만 devtools 활성화
 * 프로덕션에서는 패스스루 함수로 대체 (zero overhead)
 */
export const devtools: typeof zustandDevtools = import.meta.env.DEV
  ? zustandDevtools
  : ((<
      T,
      Mps extends [StoreMutatorIdentifier, unknown][] = [],
      Mcs extends [StoreMutatorIdentifier, unknown][] = [],
    >(
      fn: StateCreator<T, Mps, Mcs>
    ) => fn) as typeof zustandDevtools);
