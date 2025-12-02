<img src="public/icons/icon-72.png" alt="생활도구" width="32" height="32" align="left" style="margin-right: 8px;">

# Tools

[![CI](https://github.com/soundbluemusic/tools/actions/workflows/ci.yml/badge.svg)](https://github.com/soundbluemusic/tools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

React + TypeScript + Vite 기반의 유틸리티 앱 대시보드

🌐 **[English README](./README.md)**

## 앱 목록

| 앱 | 설명 | 경로 |
| --- | --- | --- |
| 🎵 메트로놈 | 음악가를 위한 정밀 메트로놈 | `/metronome` |
| 🥁 드럼머신 | 드럼 패턴 연습용 시퀀서 | `/drum` |
| 📱 QR 코드 생성기 | 투명 배경의 고해상도 QR 코드 생성 | `/qr` |
| 🎛️ 드럼 사운드 합성기 | 세밀한 파라미터 조절이 가능한 드럼 사운드 합성기 | `/drum-synth` |

> 📖 자세한 문서는 [/docs](./docs/README.md)를 참조하세요.
>
> ## 시작하기
>
> ```bash
> # 설치
> npm install
>
> # 개발 서버 실행
> npm run dev
>
> # 프로덕션 빌드
> npm run build
>
> # 전체 검증 (타입체크 + 린트 + 테스트)
> npm run validate
> ```
>
> ## 기술 스택
>
> | 분류 | 기술 |
> | --- | --- |
> | 프레임워크 | React 19 |
> | 라우팅 | React Router 7 |
> | 언어 | TypeScript 5 |
> | 빌드 | Vite 7 |
> | 테스트 | Vitest + React Testing Library |
> | 배포 | Cloudflare Pages |
>
> ## 주요 기능
>
> - 🎯 **PWA 지원** - 오프라인에서도 작동하는 Progressive Web App
> - - 🌙 **다크 모드** - 깔끔한 다크 테마 인터페이스
>   - - 📱 **반응형** - 다양한 화면 크기에 최적화
>     - - ♿ **접근성** - 접근성을 고려한 설계
>       - - 🚀 **빠른 성능** - 최적화된 번들 사이즈와 성능
>        
>         - ## 포크 & 배포 가이드
>        
>         - 이 프로젝트는 **포크 친화적**으로 설계되었습니다.
>        
>         - ### 1단계: 브랜드 변경
>
> `src/constants/brand.ts` 파일 하나만 수정하면 됩니다:
>
> ```typescript
> export const BRAND = {
>   name: 'Your App Name',
>   copyrightHolder: 'Your Name',
>   siteUrl: 'https://your-domain.com',
>   githubUrl: 'https://github.com/you/repo',
>   // ...
> };
> ```
>
> ### 2단계: 정적 파일 (선택)
>
> | 파일 | 수정 내용 |
> | --- | --- |
> | `index.html` | 메타 태그, 구조화된 데이터 (JSON-LD) |
> | `public/sitemap.xml` | 사이트맵 URL |
> | `public/robots.txt` | 사이트맵 URL |
> | `public/icons/` | 파비콘 및 PWA 아이콘 |
> | `public/og-image.png` | 소셜 미디어 공유 이미지 |
>
> ## 기여하기
>
> 기여를 환영합니다! 자세한 내용은 [기여 가이드](./CONTRIBUTING.md)를 참조하세요.
>
> PR을 제출하기 전에 다음을 실행해 주세요:
>
> ```bash
> npm run validate
> ```
>
> ## 라이선스
>
> 이 프로젝트는 [MIT 라이선스](./LICENSE)로 공개됩니다.
>
> 자유롭게 사용, 수정, 배포할 수 있습니다. 상업적 이용도 가능합니다.
>
> ## 아이콘 색상
>
> #9370DB
>
> ## 상표 가이드라인
>
> "SoundBlueMusic" 이름과 로고는 SoundBlueMusic의 상표입니다. 이 프로젝트를 포크하여 사용할 경우, `src/constants/brand.ts`를 수정하여 본인의 브랜드로 교체해 주세요.
>
> ## Inspiration
>
> 아이디어가 필요하신가요? [Claude Artifacts Gallery](https://claude.ai/artifacts)를 방문하여 **Inspiration** 탭에서 다른 사람들이 Claude로 만든 창의적인 작품들을 확인해 보세요.
>
> ---
>
> Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
