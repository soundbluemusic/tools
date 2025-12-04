# 🎛️ 드럼 사운드 합성기 (Drum Sound Synth)

세밀한 파라미터 조절이 가능한 Web Audio 기반 드럼 사운드 합성기입니다.

## 경로

`/drum-synth`

## 기능

### 사운드 합성
- Web Audio API 기반 실시간 합성
- 다양한 드럼 사운드 프리셋
- 파라미터별 세밀한 조절

### 파라미터 컨트롤
- **피치**: 기본 주파수 조절
- **디케이**: 소리 감쇠 시간
- **톤**: 음색 조절
- **노이즈**: 노이즈 믹스 비율
- **필터**: 필터 주파수 및 레조넌스

### 내보내기
- WAV 포맷 내보내기
- MP3 포맷 내보내기
- 고품질 샘플 생성

## 드럼 사운드 타입

| 사운드 | 합성 방식 |
|:-------|:----------|
| Kick | 사인파 피치 엔벨로프 + 클릭 |
| Snare | 삼각파 + 노이즈 버스트 |
| Hi-Hat | 고주파 노이즈 + 밴드패스 필터 |
| Clap | 다중 노이즈 버스트 레이어 |
| Tom | 사인파 피치 엔벨로프 |
| Cymbal | 메탈릭 FM 합성 + 노이즈 |

## 기술 구현

### 오디오 그래프
```
Oscillator → Gain (Envelope) → Filter → Master Gain → Destination
     ↓
Noise Source → Gain (Mix) ──────────↑
```

### 사용된 Web Audio 노드
- `OscillatorNode`: 톤 생성
- `GainNode`: 볼륨 엔벨로프
- `BiquadFilterNode`: 톤 셰이핑
- `AudioBufferSourceNode`: 노이즈 생성
- `WaveShaperNode`: 디스토션 효과

## WASM 최적화

노이즈 생성, 디스토션 커브, WAV 인코딩에 WASM을 활용합니다.
자세한 내용은 [아키텍처 문서](../architecture.md#5-wasm-통합)를 참조하세요.

## 관련 링크

- [드럼머신](./drum.md) - 생성한 사운드로 패턴 만들기
- [메트로놈](./metronome.md) - 템포 연습
