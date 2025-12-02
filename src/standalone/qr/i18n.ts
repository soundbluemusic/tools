/**
 * Simplified i18n for standalone QR Generator
 */

export type Language = 'ko' | 'en';

export interface Translations {
  title: string;
  urlInput: string;
  urlLabel: string;
  urlPlaceholder: string;
  urlHelp: string;
  errorCorrectionLevel: string;
  level: string;
  recoveryRate: string;
  recommendedEnvironment: string;
  description: string;
  onlineOnly: string;
  noDamageRisk: string;
  smallPrint: string;
  coatedSurface: string;
  generalPrint: string;
  paperLabel: string;
  outdoorLarge: string;
  highDamageRisk: string;
  errorLevelInfo: string;
  qrCodeColor: string;
  black: string;
  white: string;
  generatedQrCode: string;
  blackQrCode: string;
  whiteQrCode: string;
  enterUrl: string;
  transparentBg: string;
  footer: string;
  copyImage: string;
  copied: string;
  download: string;
  popupBlocked: string;
  downloadFailed: string;
  imageCopyNotSupported: string;
  imageOpenedInNewTab: string;
  imageDownloaded: string;
  imageCopyConfirm: string;
  lightMode: string;
  darkMode: string;
  language: string;
}

export const translations: Record<Language, Translations> = {
  ko: {
    title: 'QR 코드 생성기',
    urlInput: 'URL 입력',
    urlLabel: 'URL 또는 텍스트',
    urlPlaceholder: 'https://example.com',
    urlHelp: 'QR 코드로 변환할 URL 또는 텍스트를 입력하세요',
    errorCorrectionLevel: '오류 복구 레벨',
    level: '레벨',
    recoveryRate: '복구율',
    recommendedEnvironment: '권장 환경',
    description: '설명',
    onlineOnly: '온라인 전용',
    noDamageRisk: '손상 위험 없음',
    smallPrint: '소형 인쇄',
    coatedSurface: '코팅된 표면',
    generalPrint: '일반 인쇄',
    paperLabel: '종이/라벨',
    outdoorLarge: '야외/대형',
    highDamageRisk: '손상 위험 높음',
    errorLevelInfo: '높은 복구율 = 더 큰 QR 코드, 낮은 복구율 = 더 작은 QR 코드',
    qrCodeColor: 'QR 코드 색상',
    black: '검정',
    white: '흰색',
    generatedQrCode: '생성된 QR 코드',
    blackQrCode: '검정 QR 코드',
    whiteQrCode: '흰색 QR 코드',
    enterUrl: 'URL을 입력하세요',
    transparentBg: '투명 배경 PNG (1024x1024)',
    footer: '고복구 투명 배경 QR 코드 생성기',
    copyImage: '이미지 복사',
    copied: '복사됨!',
    download: '다운로드',
    popupBlocked: '팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요.',
    downloadFailed: '다운로드에 실패했습니다.',
    imageCopyNotSupported: '이 브라우저에서는 이미지 복사가 지원되지 않습니다. 대신 다운로드합니다.',
    imageOpenedInNewTab: '새 탭에서 이미지가 열렸습니다. 길게 눌러 저장하세요.',
    imageDownloaded: '이미지가 다운로드되었습니다.',
    imageCopyConfirm: '클립보드 복사가 지원되지 않습니다. 대신 다운로드하시겠습니까?',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    language: '언어',
  },
  en: {
    title: 'QR Code Generator',
    urlInput: 'URL Input',
    urlLabel: 'URL or Text',
    urlPlaceholder: 'https://example.com',
    urlHelp: 'Enter URL or text to convert to QR code',
    errorCorrectionLevel: 'Error Correction Level',
    level: 'Level',
    recoveryRate: 'Recovery',
    recommendedEnvironment: 'Recommended',
    description: 'Description',
    onlineOnly: 'Online only',
    noDamageRisk: 'No damage risk',
    smallPrint: 'Small print',
    coatedSurface: 'Coated surface',
    generalPrint: 'General print',
    paperLabel: 'Paper/Label',
    outdoorLarge: 'Outdoor/Large',
    highDamageRisk: 'High damage risk',
    errorLevelInfo: 'Higher recovery = larger QR code, Lower recovery = smaller QR code',
    qrCodeColor: 'QR Code Color',
    black: 'Black',
    white: 'White',
    generatedQrCode: 'Generated QR Code',
    blackQrCode: 'Black QR Code',
    whiteQrCode: 'White QR Code',
    enterUrl: 'Enter URL',
    transparentBg: 'Transparent PNG (1024x1024)',
    footer: 'High Recovery Transparent QR Code Generator',
    copyImage: 'Copy Image',
    copied: 'Copied!',
    download: 'Download',
    popupBlocked: 'Popup blocked. Please allow popups and try again.',
    downloadFailed: 'Download failed.',
    imageCopyNotSupported: 'Image copy not supported in this browser. Downloading instead.',
    imageOpenedInNewTab: 'Image opened in new tab. Long press to save.',
    imageDownloaded: 'Image downloaded.',
    imageCopyConfirm: 'Clipboard copy not supported. Would you like to download instead?',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function detectLanguage(): Language {
  const stored = localStorage.getItem('qr-lang');
  if (stored === 'ko' || stored === 'en') return stored;

  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('ko') ? 'ko' : 'en';
}
