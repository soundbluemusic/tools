<img src="public/icons/icon-72.png" alt="생활도구" width="32" height="32" align="left" style="margin-right: 8px;">

# Productivity Tools

React + TypeScript + Vite 기반의 유틸리티 앱 대시보드

## 앱 목록

| 앱                    | 설명                                             | 경로          |
| :-------------------- | :----------------------------------------------- | :------------ |
| 🎵 메트로놈           | 음악가를 위한 정밀 메트로놈                      | `/metronome`  |
| 🥁 드럼머신           | 드럼 패턴 연습용 시퀀서                          | `/drum`       |
| 📱 QR 코드 생성기     | 투명 배경의 고해상도 QR 코드 생성                | `/qr`         |
| 🎛️ 드럼 사운드 합성기 | 세밀한 파라미터 조절이 가능한 드럼 사운드 합성기 | `/drum-synth` |

> 📖 자세한 문서는 [/docs](./docs/README.md)를 참조하세요.

## 시작하기

```bash
# 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 전체 검증 (타입체크 + 린트 + 테스트)
npm run validate
```

## 기술 스택

| 분류       | 기술                           |
| :--------- | :----------------------------- |
| 프레임워크 | React 19                       |
| 라우팅     | React Router 7                 |
| 언어       | TypeScript 5                   |
| 빌드       | Vite 7                         |
| 테스트     | Vitest + React Testing Library |
| 배포       | Cloudflare Pages               |

## UI 최적화

- UI는 **14인치 MacBook** 기준으로 1차 최적화되어 있습니다
- 다른 화면 크기에서도 사용 가능하지만, 14인치 MacBook에서 가장 최적의 경험을 제공합니다

## 라이선스

이 프로젝트는 [MIT License](./LICENSE)로 공개됩니다.

자유롭게 사용, 수정, 배포할 수 있습니다. 상업적 이용도 가능합니다.

### 상표 가이드라인

"SoundBlueMusic" 이름과 로고는 SoundBlueMusic의 상표입니다. 이 프로젝트를 포크하여 사용할 경우, `src/constants/brand.ts`를 수정하여 본인의 브랜드로 교체해 주세요.

## 포크 & 배포 가이드

이 프로젝트는 **포크 친화적**으로 설계되었습니다.

### 1단계: 브랜드 변경

`src/constants/brand.ts` 파일 하나만 수정하면 됩니다:

```typescript
export const BRAND = {
  name: 'Your App Name',
  copyrightHolder: 'Your Name',
  siteUrl: 'https://your-domain.com',
  githubUrl: 'https://github.com/you/repo',
  // ...
};
```

### 2단계: 정적 파일 (선택)

| 파일                  | 수정 내용                            |
| :-------------------- | :----------------------------------- |
| `index.html`          | 메타 태그, 구조화된 데이터 (JSON-LD) |
| `public/sitemap.xml`  | 사이트맵 URL                         |
| `public/robots.txt`   | 사이트맵 URL                         |
| `public/icons/`       | 파비콘 및 PWA 아이콘                 |
| `public/og-image.png` | 소셜 미디어 공유 이미지              |

---

## Inspiration

Looking for ideas? Visit the [Claude Artifacts Gallery](https://claude.ai/artifacts) and check out the **Inspiration** tab to discover creative artifacts built by others with Claude.

---

Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
