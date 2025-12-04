import { type Component, Show } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n';
import { useSEO } from '../hooks';
import { BRAND } from '../constants';
import '../pages/Legal.css';

/**
 * Terms of Service Page
 */
const Terms: Component = () => {
  const { language } = useLanguage();

  const title = () => (language() === 'ko' ? '이용약관' : 'Terms of Service');
  const description = () =>
    language() === 'ko'
      ? '본 서비스의 이용에 관한 약관입니다'
      : 'Terms and conditions for using this service';

  useSEO({
    title: title(),
    description: description(),
    canonicalPath: '/terms',
    noindex: true,
  });

  return (
    <>
      <Title>{title()} | Tools</Title>
      <Meta name="robots" content="noindex, nofollow" />

      <PageLayout title={title()} description={description()}>
        <div class="legal-content">
          <Show
            when={language() === 'ko'}
            fallback={
              <>
                <section class="legal-section">
                  <h2>1. Acceptance of Terms</h2>
                  <p>
                    By using Tools (the "Service"), you agree to these Terms of
                    Service. If you do not agree to these terms, please
                    discontinue use of the Service.
                  </p>
                  <p class="legal-updated">Last updated: January 2025</p>
                </section>

                <section class="legal-section">
                  <h2>2. Service Description</h2>
                  <p>
                    This Service is a web application that provides various
                    productivity tools such as a metronome, QR code generator,
                    and more for free.
                  </p>
                </section>

                <section class="legal-section">
                  <h2>3. Intellectual Property</h2>
                  <h3>3.1 Open Source License</h3>
                  <p>
                    The source code of this Service is available under the MIT
                    License.
                  </p>

                  <h3>3.2 Protected Assets</h3>
                  <p>
                    The following items are NOT included under the MIT License:
                  </p>
                  <ul>
                    <li>
                      <strong>Brand Names:</strong> "{BRAND.copyrightHolder}"
                      and related trademarks
                    </li>
                    <li>
                      <strong>Logos and Icons:</strong> All logos and brand
                      imagery
                    </li>
                    <li>
                      <strong>Visual Assets:</strong> All graphics and visual
                      assets
                    </li>
                  </ul>
                </section>

                <section class="legal-section">
                  <h2>4. Disclaimer</h2>
                  <p>
                    This Service is provided "as is" without any express or
                    implied warranties. We do not guarantee the accuracy,
                    reliability, or availability of the Service.
                  </p>
                </section>

                <section class="legal-section">
                  <h2>5. Contact</h2>
                  <p>
                    For questions about these Terms of Service, please contact
                    us through Issues on our GitHub repository.
                  </p>
                </section>
              </>
            }
          >
            <section class="legal-section">
              <h2>1. 약관의 동의</h2>
              <p>
                Tools(이하 "서비스")를 이용함으로써 본 이용약관에 동의하는
                것으로 간주됩니다. 본 약관에 동의하지 않는 경우 서비스 이용을
                중단해 주시기 바랍니다.
              </p>
              <p class="legal-updated">최종 업데이트: 2025년 1월</p>
            </section>

            <section class="legal-section">
              <h2>2. 서비스 설명</h2>
              <p>
                본 서비스는 메트로놈, QR 코드 생성기 등 다양한 도구를 무료로
                제공하는 웹 애플리케이션입니다.
              </p>
            </section>

            <section class="legal-section">
              <h2>3. 지적재산권</h2>
              <h3>3.1 오픈소스 라이선스</h3>
              <p>
                본 서비스의 소스 코드는 MIT 라이선스 하에 공개되어 있습니다.
              </p>

              <h3>3.2 보호되는 자산</h3>
              <p>
                다음 항목들은 MIT 라이선스에 포함되지 않으며 별도로 보호됩니다:
              </p>
              <ul>
                <li>
                  <strong>브랜드:</strong> "{BRAND.copyrightHolder}" 및 관련
                  상표
                </li>
                <li>
                  <strong>로고 및 아이콘:</strong> 모든 로고와 브랜드 이미지
                </li>
                <li>
                  <strong>시각적 자산:</strong> 모든 그래픽 및 시각적 자산
                </li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>4. 면책조항</h2>
              <p>
                본 서비스는 "있는 그대로" 제공되며, 명시적이거나 묵시적인 어떠한
                보증도 제공하지 않습니다.
              </p>
            </section>

            <section class="legal-section">
              <h2>5. 문의</h2>
              <p>
                본 이용약관에 관한 문의사항은 GitHub 저장소의 Issues를 통해
                연락해 주시기 바랍니다.
              </p>
            </section>
          </Show>
        </div>
      </PageLayout>
    </>
  );
};

export default Terms;
