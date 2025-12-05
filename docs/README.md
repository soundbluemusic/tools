# Tools 문서

SolidJS + TypeScript + Vite 기반의 유틸리티 앱 대시보드 공식 문서입니다.

## 목차

### 앱 가이드

| 앱                                            | 설명                                             |
| :-------------------------------------------- | :----------------------------------------------- |
| [🎵 메트로놈](./apps/metronome.md)            | 음악가를 위한 정밀 메트로놈                      |
| [🥁 드럼머신](./apps/drum.md)                 | 드럼 패턴 연습용 시퀀서                          |
| [📱 QR 코드 생성기](./apps/qr.md)             | 투명 배경의 고해상도 QR 코드 생성                |
| [🎛️ 드럼 사운드 합성기](./apps/drum-synth.md) | 세밀한 파라미터 조절이 가능한 드럼 사운드 합성기 |

### 개발 문서

| 문서                              | 설명                          |
| :-------------------------------- | :---------------------------- |
| [개발 가이드](./development.md)   | 로컬 개발 환경 설정 및 명령어 |
| [아키텍처](./architecture.md)     | 프로젝트 구조 및 설계 원칙    |
| [기여 가이드](../CONTRIBUTING.md) | 프로젝트 기여 방법            |

## 빠른 시작

```bash
# 저장소 클론 (본인의 저장소 URL로 변경)
git clone https://github.com/YOUR_USERNAME/tools.git
cd tools

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 앱을 확인하세요.

## 기술 스택

| 분류           | 기술                | 버전  |
| :------------- | :------------------ | :---- |
| 프레임워크     | SolidJS             | 1.9   |
| 메타 프레임워크 | SolidStart          | 1.1   |
| 라우팅         | @solidjs/router     | -     |
| 언어           | TypeScript          | 5     |
| 빌드           | Vinxi + Vite        | -     |
| WASM           | AssemblyScript      | -     |
| 테스트         | Vitest + Playwright | -     |
| 배포           | Cloudflare Pages    | -     |

## 주요 기능

- **PWA 지원**: 오프라인에서도 사용 가능
- **다크 모드**: 시스템 설정 자동 감지 + 수동 전환
- **다국어 지원**: 한국어/영어 지원
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **키보드 단축키**: Cmd/Ctrl+K로 빠른 앱 전환

## 아이콘 색상

#9370DB

## 라이선스

- **소스코드**: MIT License
- **브랜드 자산**: 각 브랜드 소유자의 권리가 보호됩니다

자세한 내용은 [LICENSE](../LICENSE) 및 [TRADEMARKS](../TRADEMARKS.md)를 참조하세요.

## 포크 시 브랜드 변경

`src/constants/brand.ts` 파일을 수정하여 브랜드를 커스터마이징하세요.
자세한 내용은 [README.md](../README.md)의 "포크 & 배포 가이드" 섹션을 참조하세요.
