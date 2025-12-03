import { memo } from 'react';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n';
import { useSEO } from '../hooks';
import { BRAND } from '../constants';
import './Legal.css';

/**
 * Terms of Service Page
 * Outlines usage terms and conditions
 */
const Terms = memo(function Terms() {
  const { language } = useLanguage();

  const title = language === 'ko' ? '이용약관' : 'Terms of Service';
  const description =
    language === 'ko'
      ? '본 서비스의 이용에 관한 약관입니다'
      : 'Terms and conditions for using this service';

  useSEO({
    title,
    description,
    canonicalPath: '/terms',
    noindex: true,
  });

  if (language === 'ko') {
    return (
      <PageLayout title={title} description={description}>
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. 약관의 동의</h2>
            <p>
              Tools(이하 "서비스")를 이용함으로써 본 이용약관에 동의하는 것으로
              간주됩니다. 본 약관에 동의하지 않는 경우 서비스 이용을 중단해
              주시기 바랍니다.
            </p>
            <p className="legal-updated">최종 업데이트: 2025년 1월</p>
          </section>

          <section className="legal-section">
            <h2>2. 서비스 설명</h2>
            <p>
              본 서비스는 메트로놈, QR 코드 생성기 등 다양한 도구를 무료로
              제공하는 웹 애플리케이션입니다.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. 지적재산권</h2>
            <h3>3.1 오픈소스 라이선스</h3>
            <p>
              본 서비스의 소스 코드는 MIT 라이선스 하에 공개되어 있습니다.
              라이선스 전문은 GitHub 저장소에서 확인하실 수 있습니다.
            </p>

            <h3>3.2 보호되는 자산</h3>
            <p>
              다음 항목들은 MIT 라이선스에 포함되지 않으며 별도로 보호됩니다:
            </p>
            <ul>
              <li>
                <strong>브랜드:</strong> "{BRAND.copyrightHolder}" 및 관련
                상표와 브랜드 명칭
              </li>
              <li>
                <strong>로고 및 아이콘:</strong> 모든 로고와 브랜드 이미지
              </li>
              <li>
                <strong>시각적 자산:</strong> 모든 그래픽 및 시각적 자산
              </li>
            </ul>

            <h3>3.3 포크(Fork) 시 주의사항</h3>
            <p>
              본 서비스를 포크하는 경우, 위에 명시된 보호 자산을 모두 제거하고
              자체 브랜딩으로 교체해야 합니다.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. 서비스 이용</h2>
            <h3>4.1 허용되는 사용</h3>
            <p>MIT 라이선스에 따라 다음과 같은 사용이 허용됩니다:</p>
            <ul>
              <li>개인적 및 상업적 목적으로 자유롭게 도구 사용</li>
              <li>코드 수정, 복사, 병합, 출판, 배포, 서브라이선스 및 판매</li>
              <li>단, 보호된 브랜드 자산(로고, 아이콘 등)은 제외</li>
            </ul>

            <h3>4.2 금지되는 사용</h3>
            <ul>
              <li>서비스 또는 서버에 대한 공격 시도</li>
              <li>다른 사용자의 서비스 이용 방해</li>
              <li>불법적인 목적으로 서비스 사용</li>
              <li>보호된 브랜드 자산의 무단 사용</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. 면책조항</h2>
            <h3>5.1 서비스 보증</h3>
            <p>
              본 서비스는 "있는 그대로" 제공되며, 명시적이거나 묵시적인 어떠한
              보증도 제공하지 않습니다. 서비스의 정확성, 신뢰성, 가용성에 대해
              보장하지 않습니다.
            </p>

            <h3>5.2 책임 제한</h3>
            <p>
              본 서비스 사용으로 인해 발생하는 어떠한 직접적, 간접적, 우발적,
              특수적, 결과적 손해에 대해서도 책임을 지지 않습니다.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. 서비스 변경 및 종료</h2>
            <p>
              서비스 제공자는 사전 통지 없이 서비스를 수정, 일시 중단 또는
              종료할 수 있는 권리를 가집니다.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. 약관 변경</h2>
            <p>
              본 이용약관은 법률 변경이나 서비스 정책 변경에 따라 수정될 수
              있습니다. 변경된 약관은 본 페이지에 게시됩니다.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. 문의</h2>
            <p>
              본 이용약관에 관한 문의사항은 GitHub 저장소의 Issues를 통해 연락해
              주시기 바랍니다.
            </p>
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
          <p>
            By using Tools (the "Service"), you agree to these Terms of Service.
            If you do not agree to these terms, please discontinue use of the
            Service.
          </p>
          <p className="legal-updated">Last updated: January 2025</p>
        </section>

        <section className="legal-section">
          <h2>2. Service Description</h2>
          <p>
            This Service is a web application that provides various productivity
            tools such as a metronome, QR code generator, and more for free.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Intellectual Property</h2>
          <h3>3.1 Open Source License</h3>
          <p>
            The source code of this Service is available under the MIT License.
            The full license text can be found in our GitHub repository.
          </p>

          <h3>3.2 Protected Assets</h3>
          <p>
            The following items are NOT included under the MIT License and are
            separately protected:
          </p>
          <ul>
            <li>
              <strong>Brand Names:</strong> "{BRAND.copyrightHolder}" and
              related trademarks
            </li>
            <li>
              <strong>Logos and Icons:</strong> All logos and brand imagery
            </li>
            <li>
              <strong>Visual Assets:</strong> All graphics and visual assets
            </li>
          </ul>

          <h3>3.3 Forking Guidelines</h3>
          <p>
            If you fork this Service, you must remove all protected assets
            listed above and replace them with your own branding.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Use of Service</h2>
          <h3>4.1 Permitted Use</h3>
          <p>Under the MIT License, the following uses are permitted:</p>
          <ul>
            <li>Personal and commercial use of the tools</li>
            <li>
              Modification, copying, merging, publishing, distributing,
              sublicensing, and selling of the code
            </li>
            <li>
              Note: Protected brand assets (logos, icons, etc.) are excluded
            </li>
          </ul>

          <h3>4.2 Prohibited Use</h3>
          <ul>
            <li>Attempting to attack the service or servers</li>
            <li>Interfering with other users' access to the service</li>
            <li>Using the service for illegal purposes</li>
            <li>Unauthorized use of protected brand assets</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Disclaimer</h2>
          <h3>5.1 Service Warranty</h3>
          <p>
            This Service is provided "as is" without any express or implied
            warranties. We do not guarantee the accuracy, reliability, or
            availability of the Service.
          </p>

          <h3>5.2 Limitation of Liability</h3>
          <p>
            We are not liable for any direct, indirect, incidental, special, or
            consequential damages arising from the use of this Service.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Service Modification and Termination</h2>
          <p>
            The service provider reserves the right to modify, suspend, or
            terminate the Service at any time without prior notice.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Changes to Terms</h2>
          <p>
            These Terms of Service may be updated due to legal changes or policy
            updates. Updated terms will be posted on this page.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Contact</h2>
          <p>
            For questions about these Terms of Service, please contact us
            through Issues on our GitHub repository.
          </p>
        </section>
      </div>
    </PageLayout>
  );
});

Terms.displayName = 'Terms';

export default Terms;
