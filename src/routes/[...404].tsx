import type { Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { useLanguage } from '../i18n';

/**
 * 404 Not Found Page
 */
const NotFound: Component = () => {
  const { language } = useLanguage();

  return (
    <>
      <Title>
        {language() === 'ko' ? '페이지를 찾을 수 없습니다' : 'Page Not Found'} | Tools
      </Title>
      <Meta name="robots" content="noindex, nofollow" />

      <div class="not-found-page">
        <div class="not-found-content">
          <h1 class="not-found-code">404</h1>
          <h2 class="not-found-title">
            {language() === 'ko' ? '페이지를 찾을 수 없습니다' : 'Page Not Found'}
          </h2>
          <p class="not-found-description">
            {language() === 'ko'
              ? '요청하신 페이지가 존재하지 않거나 이동되었습니다.'
              : "The page you're looking for doesn't exist or has been moved."}
          </p>
          <A
            href={language() === 'ko' ? '/ko' : '/'}
            class="not-found-link"
          >
            {language() === 'ko' ? '홈으로 돌아가기' : 'Go back home'}
          </A>
        </div>
      </div>
    </>
  );
};

export default NotFound;
