# 기여 가이드

Tools 프로젝트에 기여해 주셔서 감사합니다!

## 기여 방법

### 이슈 리포트

버그를 발견하셨거나 새 기능을 제안하고 싶으시다면:

1. [GitHub Issues](https://github.com/soundbluemusic/tools/issues)에서 기존 이슈 확인
2. 중복이 없다면 새 이슈 생성
3. 이슈 템플릿에 맞춰 상세히 작성

### Pull Request

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 개발 가이드라인

### 코드 스타일

- **TypeScript**: 엄격 모드 사용
- **ESLint**: 린트 규칙 준수
- **Prettier**: 자동 포맷팅

PR 전 반드시 실행:

```bash
npm run validate
```

### 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 규칙 준수:

| 타입       | 설명                      |
| :--------- | :------------------------ |
| `feat`     | 새 기능                   |
| `fix`      | 버그 수정                 |
| `docs`     | 문서 변경                 |
| `refactor` | 리팩토링 (기능 변경 없음) |
| `perf`     | 성능 개선                 |
| `test`     | 테스트 추가/수정          |
| `chore`    | 빌드/설정 변경            |

**예시:**

```
feat: Add metronome tap tempo feature
fix: Resolve audio timing issue in drum machine
docs: Update installation instructions
```

### 테스트

- 새 기능에는 테스트 추가
- 기존 테스트가 통과하는지 확인

```bash
# 유닛 테스트
npm run test:run

# E2E 테스트
npm run test:e2e
```

### 문서화

- 새 앱 추가 시 `docs/apps/` 문서 작성
- 공개 API 변경 시 관련 문서 업데이트
- CHANGELOG.md 업데이트

## 새 앱 추가하기

1. `src/apps/[app-name]/config.ts` 생성

```typescript
import type { AppConfig } from '../../types';

const config: AppConfig = {
  name: { ko: '앱 이름', en: 'App Name' },
  desc: { ko: '설명', en: 'Description' },
  icon: '🔧',
  size: 1024,
  order: 1,
};

export default config;
```

2. `src/pages/[AppName].tsx` 페이지 컴포넌트 생성

3. `src/App.tsx`에 라우트 추가

```tsx
const MyApp = lazy(() => import('./pages/MyApp'));
// ROUTES 배열에:
{ path: '/my-app', element: <MyApp />, lazy: true },
```

4. `src/i18n/translations/[app-name].ts` 번역 추가

5. `docs/apps/[app-name].md` 문서 작성

## 라이선스

기여하신 코드는 MIT 라이선스로 배포됩니다.

## 행동 강령

- 존중과 배려로 소통합니다
- 건설적인 피드백을 제공합니다
- 다양성을 존중합니다
