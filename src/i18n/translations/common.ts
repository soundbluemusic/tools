import type { CommonTranslation } from '../types';

export const commonKo: CommonTranslation = {
  footer: {
    about: '소개',
    sitemap: '사이트맵',
    opensource: '오픈소스',
    toolsUsed: '사용된 도구',
  },
  home: {
    searchPlaceholder: '검색...',
    searchAriaLabel: '도구 검색',
    clearSearchAriaLabel: '검색어 지우기',
    sortAriaLabel: '정렬 방식',
    noResults: '"{query}"에 대한 검색 결과가 없습니다',
    sort: {
      nameAsc: '이름순 (A-Z)',
      nameDesc: '이름역순 (Z-A)',
      nameLong: '이름 긴 순',
      nameShort: '이름 짧은 순',
      sizeLarge: '용량 큰 순',
      sizeSmall: '용량 작은 순',
    },
  },
  common: {
    copyImage: '이미지 복사',
    copied: '복사 완료!',
    download: '다운로드',
    cancel: '취소',
    confirm: '확인',
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    success: '성공!',
    backButton: '← 돌아가기',
  },
  errorBoundary: {
    title: '문제가 발생했습니다',
    message: '예상치 못한 오류가 발생했습니다.',
    retry: '다시 시도',
  },
  pwa: {
    installTitle: '앱 설치',
    installMessage: 'Productivity Tools (Beta)를 앱으로 설치하면 더 빠르고 편리하게 사용할 수 있습니다.',
    installButton: '설치',
    dismissButton: '나중에',
    updateTitle: '업데이트 가능',
    updateMessage: '새 버전이 있습니다. 지금 업데이트하시겠습니까?',
    updateButton: '업데이트',
    offlineTitle: '오프라인',
    offlineMessage: '인터넷 연결이 없습니다. 일부 기능이 제한될 수 있습니다.',
  },
  notFound: {
    title: '페이지를 찾을 수 없습니다',
    message: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
    backToHome: '← 홈으로 돌아가기',
  },
  languageToggle: {
    switchToEnglish: 'Switch to English',
    switchToKorean: '한국어로 전환',
  },
  a11y: {
    availableTools: '사용 가능한 도구',
  },
};

export const commonEn: CommonTranslation = {
  footer: {
    about: 'About',
    sitemap: 'Sitemap',
    opensource: 'Open Source',
    toolsUsed: 'Tools Used',
  },
  home: {
    searchPlaceholder: 'Search...',
    searchAriaLabel: 'Search tools',
    clearSearchAriaLabel: 'Clear search',
    sortAriaLabel: 'Sort by',
    noResults: 'No results found for "{query}"',
    sort: {
      nameAsc: 'Name (A-Z)',
      nameDesc: 'Name (Z-A)',
      nameLong: 'Longest name',
      nameShort: 'Shortest name',
      sizeLarge: 'Largest size',
      sizeSmall: 'Smallest size',
    },
  },
  common: {
    copyImage: 'Copy Image',
    copied: 'Copied!',
    download: 'Download',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    backButton: '← Back',
  },
  errorBoundary: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred.',
    retry: 'Try again',
  },
  pwa: {
    installTitle: 'Install App',
    installMessage:
      'Install Productivity Tools (Beta) as an app for a faster and more convenient experience.',
    installButton: 'Install',
    dismissButton: 'Later',
    updateTitle: 'Update Available',
    updateMessage: 'A new version is available. Would you like to update now?',
    updateButton: 'Update',
    offlineTitle: 'Offline',
    offlineMessage: 'No internet connection. Some features may be limited.',
  },
  notFound: {
    title: 'Page Not Found',
    message: 'The page you requested does not exist or has been moved.',
    backToHome: '← Back to Home',
  },
  languageToggle: {
    switchToEnglish: 'Switch to English',
    switchToKorean: '한국어로 전환',
  },
  a11y: {
    availableTools: 'Available tools',
  },
};
