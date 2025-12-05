import { APPS } from '../constants/apps';
import type { App } from '../types';

interface AppsContextValue {
  apps: readonly App[];
  isLoading: boolean;
}

/**
 * 정적 앱 목록 반환값 (Context 오버헤드 제거)
 * APPS는 빌드 타임에 결정되는 정적 상수이므로
 * Context Provider 없이 직접 반환
 */
const STATIC_APPS_VALUE: AppsContextValue = {
  apps: APPS,
  isLoading: false,
} as const;

/**
 * Hook to access the apps list
 * 정적 상수를 반환하므로 리렌더링 유발 없음
 * @returns Object containing apps array and loading state
 */
export function useApps(): AppsContextValue {
  return STATIC_APPS_VALUE;
}
