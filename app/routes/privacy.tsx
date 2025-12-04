import { memo } from 'react';
import type { Route } from './+types/privacy';
import { PageLayout } from '../../src/components/layout';
import { useLanguage } from '../../src/i18n';
import { useSEO } from '../../src/hooks';

export const meta: Route.MetaFunction = () => [
  { title: 'Privacy Policy - Tools' },
  { name: 'description', content: '개인정보 처리방침' },
];

const Privacy = memo(function Privacy() {
  const { language } = useLanguage();

  const title = language === 'ko' ? '개인정보 처리방침' : 'Privacy Policy';
  const description = language === 'ko' ? '본 서비스의 개인정보 처리에 관한 정책입니다' : 'Our privacy policy regarding data collection and usage';

  useSEO({ title, description, canonicalPath: '/privacy', noindex: true });

  if (language === 'ko') {
    return (
      <PageLayout title={title} description={description}>
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. 개요</h2>
            <p>Tools(이하 "서비스")는 사용자의 개인정보를 중요하게 생각합니다.</p>
            <p className="legal-updated">최종 업데이트: 2025년 1월</p>
          </section>
          <section className="legal-section">
            <h2>2. 수집하는 정보</h2>
            <p>본 서비스는 언어 설정과 테마 설정을 브라우저의 로컬 저장소에 저장합니다. 이 정보는 외부 서버로 전송되지 않습니다.</p>
          </section>
          <section className="legal-section">
            <h2>3. 문의</h2>
            <p>개인정보 처리에 관한 문의사항은 GitHub 저장소의 Issues를 통해 연락해 주시기 바랍니다.</p>
          </section>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={title} description={description}>
      <div className="legal-content">
        <section className="legal-section">
          <h2>1. Overview</h2>
          <p>Tools (the "Service") values your privacy.</p>
          <p className="legal-updated">Last updated: January 2025</p>
        </section>
        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>This Service stores language and theme preferences in your browser's local storage. This information is not transmitted to any external servers.</p>
        </section>
        <section className="legal-section">
          <h2>3. Contact</h2>
          <p>For questions about privacy practices, please contact us through Issues on our GitHub repository.</p>
        </section>
      </div>
    </PageLayout>
  );
});

Privacy.displayName = 'Privacy';

export default Privacy;
