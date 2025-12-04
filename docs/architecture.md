# 아키텍처

프로젝트 구조 및 설계 원칙에 대한 문서입니다.

## 디렉토리 구조

```
assembly/                    # AssemblyScript WASM 소스
├── index.ts                 # WASM 함수 구현
└── tsconfig.json            # AS 컴파일러 설정

src/
├── apps/                    # 앱 모듈 (자동 로드)
│   └── [app-name]/
│       ├── config.ts        # 앱 메타데이터
│       ├── constants.ts     # 앱별 상수
│       ├── components/      # 앱별 컴포넌트
│       └── utils/           # 앱별 유틸리티
│
├── components/              # 공유 React 컴포넌트
│   ├── layout/              # 레이아웃 컴포넌트
│   ├── navigation/          # 네비게이션 시스템
│   └── ui/                  # 기본 UI 컴포넌트
│
├── pages/                   # 라우트 페이지 컴포넌트
├── hooks/                   # 커스텀 React 훅
├── i18n/                    # 국제화 (한국어/영어)
├── constants/               # 앱 메타데이터 및 상수
├── utils/                   # 유틸리티 함수
├── wasm/                    # WebAssembly 모듈
│   ├── wasmProcessor.ts     # WASM 로더 및 래퍼
│   ├── processing.wasm      # 컴파일된 바이너리
│   └── index.ts             # 배럴 export
├── types/                   # TypeScript 타입 정의
├── styles/                  # 글로벌 스타일시트
└── test/                    # 테스트 유틸리티
```

## 핵심 패턴

### 1. 앱 자동 로드 시스템

앱은 Vite의 `import.meta.glob()`을 통해 자동으로 발견됩니다.

**새 앱 추가 방법:**

1. `src/apps/[app-name]/config.ts` 생성
2. `src/pages/[AppName].tsx` 페이지 생성
3. `src/App.tsx`에 lazy import 및 라우트 추가
4. `src/i18n/translations/[app-name].ts` 번역 추가

**config.ts 구조:**

```typescript
import type { AppConfig } from '../../types';

const config: AppConfig = {
  name: {
    ko: '앱 이름',
    en: 'App Name',
  },
  desc: {
    ko: '설명',
    en: 'Description',
  },
  icon: '🔧',
  size: 1024,
  order: 1,
};

export default config;
```

### 2. 네비게이션 시스템

반응형 네비게이션 시스템:

- **데스크톱 (≥768px)**: 사이드바
- **모바일 (<768px)**: 하단 네비게이션
- **명령 팔레트**: Cmd/Ctrl+K

### 3. 국제화 (i18n)

Context 기반 시스템으로 localStorage에 영속화됩니다.

```tsx
import { useLanguage } from '../i18n';

function MyComponent() {
  const { language, t } = useLanguage();
  return <span>{t.common.myKey}</span>;
}
```

### 4. 테마 시스템

세 가지 모드: `system`, `light`, `dark`

```tsx
import { useTheme } from '../hooks';

function ThemeExample() {
  const { theme, setTheme, resolvedTheme } = useTheme();
}
```

### 5. WASM 통합

AssemblyScript 기반 WASM 모듈로 계산 집약적 작업 최적화:

**적용 영역:**

| 기능 | 용도 | 성능 향상 |
|:-----|:-----|:---------|
| `makeTransparent` | QR 투명 배경 | 10-25x |
| `generateNoiseBuffer` | 노이즈 생성 | 3-5x |
| `makeDistortionCurve` | 디스토션 커브 | 5-10x |
| `floatToInt16` | WAV 인코딩 | 2-4x |

**사용 패턴:**

```typescript
import { isWasmLoaded, makeTransparentWasm } from '../wasm';

// WASM 사용 가능 시 사용, 아니면 JS 폴백
if (isWasmLoaded()) {
  makeTransparentWasm(imageData, isWhite);
} else {
  makeTransparentJS(imageData, isWhite);
}
```

## 컴포넌트 패턴

### 메모이제이션

성능을 위해 `memo()`, `useMemo()`, `useCallback()` 사용:

```tsx
const MemoizedComponent = memo(function Component({ data }) {
  const processed = useMemo(() => processData(data), [data]);
  return <div>{processed}</div>;
});
```

### 에러 바운더리

기능 컴포넌트를 `withErrorBoundary` HOC로 래핑:

```tsx
import { withErrorBoundary } from '../components/ErrorBoundary';

const SafeComponent = withErrorBoundary(MyComponent);
```

### 지연 로딩

도구 페이지는 코드 스플리팅을 위해 지연 로딩:

```tsx
const MyTool = lazy(() => import('./pages/MyTool'));
```

## 스타일링

### CSS Custom Properties

디자인 토큰은 `src/styles/variables.css`에 정의:

```css
/* 색상 */
--color-bg-primary
--color-text-primary
--color-border-primary

/* 타이포그래피 */
--font-size-sm, --font-size-md, --font-size-lg

/* 간격 */
--spacing-1 to --spacing-16

/* 트랜지션 */
--transition-fast: 150ms
--transition-normal: 250ms
```

### 다크 모드

`data-theme` 속성으로 제어:

```css
:root {
  --color-bg-primary: #ffffff;
}

[data-theme='dark'] {
  --color-bg-primary: #1a1a1a;
}
```

## 성능 최적화

1. **코드 스플리팅**: `React.lazy()`로 페이지 지연 로딩
2. **벤더 청크**: React, Router 등 별도 청크
3. **프리페칭**: 앱 카드 호버 시 프리페치
4. **CSS Containment**: `contain: layout style`
5. **PWA 캐싱**: Service Worker 에셋 캐싱
