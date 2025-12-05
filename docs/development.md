# 개발 가이드

로컬 개발 환경 설정 및 명령어 가이드입니다.

## 요구사항

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 (Node.js와 함께 설치됨)

## 설치

```bash
# 저장소 클론 (본인의 저장소 URL로 변경)
git clone https://github.com/YOUR_USERNAME/tools.git
cd tools

# 의존성 설치
npm install
```

## 개발 명령어

### 개발 서버

```bash
# 개발 서버 실행 (http://localhost:5173)
npm run dev
```

### 빌드

```bash
# 프로덕션 빌드 (타입체크 포함)
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 코드 품질

```bash
# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format

# 포맷팅 검사
npm run format:check

# 타입 검사
npm run typecheck

# 전체 검증 (타입체크 + 린트 + 테스트)
npm run validate
```

### 테스트

```bash
# 유닛 테스트 (감시 모드)
npm run test

# 유닛 테스트 (단일 실행)
npm run test:run

# 커버리지 리포트
npm run test:coverage

# 테스트 UI
npm run test:ui

# E2E 테스트
npm run test:e2e

# E2E 테스트 (브라우저 표시)
npm run test:e2e:headed

# E2E 테스트 UI
npm run test:e2e:ui
```

### 에셋 생성

```bash
# PWA 아이콘 생성
npm run generate-icons

# OpenGraph 이미지 생성
npm run generate-og-image

# 이미지 WebP 변환
npm run convert-webp
```

### WASM 빌드

```bash
# AssemblyScript → WASM 컴파일
npm run wasm:build
```

**참고:** 컴파일된 `src/wasm/processing.wasm`은 저장소에 커밋됩니다. Cloudflare Pages 등 AssemblyScript가 없는 환경에서도 빌드가 가능합니다.

## 개발 워크플로우

### 1. 브랜치 생성

```bash
git checkout -b feature/my-feature
```

### 2. 개발

```bash
npm run dev
```

### 3. 검증

```bash
npm run validate
```

### 4. 커밋

```bash
git add .
git commit -m "feat: Add my feature"
```

커밋 메시지 컨벤션:

- `feat:` 새 기능
- `fix:` 버그 수정
- `docs:` 문서 변경
- `refactor:` 리팩토링
- `perf:` 성능 개선
- `test:` 테스트 추가/수정
- `chore:` 빌드/설정 변경

### 5. 푸시 및 PR

```bash
git push -u origin feature/my-feature
```

## 환경 설정

### VS Code 추천 확장

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

### 디버깅

SolidJS DevTools와 브라우저 개발자 도구를 사용하여 디버깅하세요.

```bash
# 개발 서버 실행 후 브라우저에서 SolidJS DevTools 사용
npm run dev
```

## 문제 해결

### 의존성 문제

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 포트 충돌

```bash
# 다른 포트로 실행
npm run dev -- --port 3000
```

### 타입 에러

```bash
# TypeScript 캐시 초기화
rm -rf node_modules/.cache
npm run typecheck
```
