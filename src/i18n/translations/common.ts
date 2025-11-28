import type { CommonTranslation } from '../types';

export const commonKo: CommonTranslation = {
  footer: {
    about: '제작배경',
    terms: '이용약관',
    opensource: '오픈소스목록',
    toolsUsed: '사용된툴',
  },
  home: {
    searchPlaceholder: '검색...',
    searchAriaLabel: '도구 검색',
    clearSearchAriaLabel: '검색어 지우기',
    sortAriaLabel: '정렬 방식',
    noResults: '에 대한 검색 결과가 없습니다',
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
};

export const commonEn: CommonTranslation = {
  footer: {
    about: 'About',
    terms: 'Terms of Service',
    opensource: 'Open Source',
    toolsUsed: 'Tools Used',
  },
  home: {
    searchPlaceholder: 'Search...',
    searchAriaLabel: 'Search tools',
    clearSearchAriaLabel: 'Clear search',
    sortAriaLabel: 'Sort by',
    noResults: 'No results found for',
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
};
