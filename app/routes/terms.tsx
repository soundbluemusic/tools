import { memo } from 'react';
import type { Route } from './+types/terms';
import { PageLayout } from '../../src/components/layout';
import { useLanguage } from '../../src/i18n';
import { useSEO } from '../../src/hooks';
import { BRAND } from '../../src/constants';

export const meta: Route.MetaFunction = () => [
  { title: 'Terms of Service - Tools' },
  { name: 'description', content: '이용약관' },
];

const Terms = memo(function Terms() {
  const { language } = useLanguage();

  const title = language === 'ko' ? '이용약관' : 'Terms of Service';
  const description = language === 'ko' ? '본 서비스의 이용에 관한 약관입니다' : 'Terms and conditions for using this service';

  useSEO({ title, description, canonicalPath: '/terms', noindex: true });

  if (language === 'ko') {
    return (
      <PageLayout title={title} description={description}>
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. 약관의 동의</h2>
            <p>Tools(이하 "서비스")를 이용함으로써 본 이용약관에 동의하는 것으로 간주됩니다.</p>
            <p className="legal-updated">최종 업데이트: 2025년 1월</p>
          </section>
          <section className="legal-section">
            <h2>2. 지적재산권</h2>
            <p>본 서비스의 소스 코드는 MIT 라이선스 하에 공개되어 있습니다. 단, "{BRAND.copyrightHolder}" 브랜드와 로고는 별도로 보호됩니다.</p>
          </section>
          <section className="legal-section">
            <h2>3. 면책조항</h2>
            <p>본 서비스는 "있는 그대로" 제공되며, 어떠한 보증도 제공하지 않습니다.</p>
          </section>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={title} description={description}>
      <div className="legal-content">
        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By using Tools (the "Service"), you agree to these Terms of Service.</p>
          <p className="legal-updated">Last updated: January 2025</p>
        </section>
        <section className="legal-section">
          <h2>2. Intellectual Property</h2>
          <p>The source code is available under the MIT License. However, the "{BRAND.copyrightHolder}" brand and logos are separately protected.</p>
        </section>
        <section className="legal-section">
          <h2>3. Disclaimer</h2>
          <p>This Service is provided "as is" without any warranties.</p>
        </section>
      </div>
    </PageLayout>
  );
});

Terms.displayName = 'Terms';

export default Terms;
