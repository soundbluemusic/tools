# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_향후 변경사항이 여기에 기록됩니다._

---

## [0.1.4-베타] - 2025-12-02

### Added

- 전체화면 버튼 추가 (모든 인터랙티브 도구에 적용)
- sitemap.xml 자동 생성 스크립트 (`npm run generate-sitemap`)
- 빌드 시 sitemap.xml 자동 동기화 (prebuild 훅)
- 중앙 집중식 브랜드 설정 (`src/constants/brand.ts`) - 포크 친화적 설계

### Changed

- 푸터 공유 버튼이 현재 페이지 대신 홈페이지를 공유하도록 변경
- 푸터 공유 버튼과 앱 공유 버튼 스타일 차별화
- README 라이선스 섹션을 표준 MIT 스타일로 간소화
- 포크 & 배포 가이드 추가

### Fixed

- 사이드바 네비게이션 선택 오류 수정 (드럼 사운드 합성기 클릭 시 드럼머신도 선택되던 문제)
- UI 스터터링 성능 문제 수정 (스크롤 스로틀링, smooth scroll, mousemove 이벤트)
- sitemap.xml 누락 페이지 추가 (drum-synth, downloads)

### Refactored

- 미사용 코드 제거 및 번들 사이즈 최적화 (~3,810 bytes 절감)
- 스탠드얼론 앱 중복 코드 통합

---

## [0.1.3-베타] - 2024-12-02

### Changed

- ESLint 설정 파일을 TypeScript로 변환 (`eslint.config.ts`)
- 나머지 스크립트 파일들을 TypeScript로 변환

---

## [0.1.2-베타] - 2024-12-01

### Changed

- 빌드 스크립트를 JavaScript에서 TypeScript로 마이그레이션
  - `generate-icons.ts`
  - `generate-og-image.ts`
  - `convert-to-webp.ts`
  - `sync-readme.ts`

---

## [0.1.1-베타] - 2024-12-01

### Added

- 자동 버전 범프 및 릴리스 워크플로우 추가
- Husky pre-commit 훅으로 README 자동 동기화

### Fixed

- 버전 범프 시 '베타' 접미사 유지

---

## [0.1.0-베타] - 2024-11-30

### ⚠️ Beta Release Notice

> 이 버전은 베타 버전입니다. 기능과 인터페이스가 향후 릴리즈에서 변경될 수 있습니다.

### Added

#### 🎵 메트로놈 (Metronome)

- 정밀한 BPM 조절 (20-300 BPM)
- 다양한 박자 설정 (2/4, 3/4, 4/4, 6/8 등)
- 시각적 비트 표시
- 탭 템포 기능

#### 🥁 드럼머신 (Drum Machine)

- 드럼 패턴 시퀀서
- MIDI 가져오기/내보내기 지원
- 루프 재생 및 템포 조절
- Web Audio 기반 사운드 합성

#### 🎛️ 드럼 사운드 합성기 (Drum Sound Synth)

- Web Audio API 기반 드럼 사운드 합성
- 세밀한 파라미터 조절
- WAV/MP3 내보내기 지원

#### 📱 QR 코드 생성기 (QR Generator)

- 고해상도 QR 코드 생성
- 투명 배경 옵션
- 다양한 크기 지원
- PNG 다운로드 지원

#### 🛠️ 기술 스택

- React 19 + TypeScript 기반
- Vite 6 빌드 도구
- PWA 지원
- Cloudflare Pages 배포

---

[Unreleased]: https://github.com/soundbluemusic/tools/compare/v0.1.4-베타...HEAD
[0.1.4-베타]: https://github.com/soundbluemusic/tools/compare/v0.1.3-베타...v0.1.4-베타
[0.1.3-베타]: https://github.com/soundbluemusic/tools/compare/v0.1.2-베타...v0.1.3-베타
[0.1.2-베타]: https://github.com/soundbluemusic/tools/compare/v0.1.1-베타...v0.1.2-베타
[0.1.1-베타]: https://github.com/soundbluemusic/tools/compare/v0.1.0-베타...v0.1.1-베타
[0.1.0-베타]: https://github.com/soundbluemusic/tools/releases/tag/v0.1.0-베타
