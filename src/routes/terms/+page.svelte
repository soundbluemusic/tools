<script lang="ts">
  import PageLayout from '../../components/layout/PageLayout.svelte';
  import { language } from '../../stores';
  import '../../pages/Legal.css';

  $: title = $language === 'ko' ? '이용약관' : 'Terms of Service';
  $: description = $language === 'ko'
    ? '본 서비스 이용에 관한 약관입니다'
    : 'Terms and conditions for using this service';
</script>

<PageLayout {title} {description}>
  <div class="legal-content">
    {#if $language === 'ko'}
      <section class="legal-section">
        <h2>1. 서비스 소개</h2>
        <p>
          Productivity Tools(이하 "서비스")는 무료로 제공되는 온라인 생산성
          도구 모음입니다. 본 서비스는 QR 코드 생성기, 메트로놈 등 다양한
          도구를 제공합니다.
        </p>
        <p class="legal-updated">최종 업데이트: 2025년 1월</p>
      </section>

      <section class="legal-section">
        <h2>2. 이용 조건</h2>
        <ul>
          <li>본 서비스는 누구나 무료로 이용할 수 있습니다</li>
          <li>회원가입이나 개인정보 제공 없이 이용할 수 있습니다</li>
          <li>상업적 또는 비상업적 목적으로 자유롭게 이용할 수 있습니다</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>3. 서비스 제공</h2>
        <p>
          본 서비스는 "있는 그대로" 제공됩니다. 서비스 제공자는 서비스의
          정확성, 완전성, 신뢰성에 대해 명시적 또는 묵시적 보증을 하지
          않습니다.
        </p>
      </section>

      <section class="legal-section">
        <h2>4. 책임 제한</h2>
        <p>
          서비스 사용으로 인해 발생하는 직접적, 간접적, 우발적, 특수적,
          결과적 손해에 대해 서비스 제공자는 책임을 지지 않습니다.
        </p>
      </section>

      <section class="legal-section">
        <h2>5. 오픈소스</h2>
        <p>
          본 서비스는 MIT 라이선스 하에 오픈소스로 공개되어 있습니다.
          소스 코드는 GitHub에서 확인할 수 있습니다.
        </p>
      </section>

      <section class="legal-section">
        <h2>6. 약관 변경</h2>
        <p>
          본 이용약관은 사전 통지 없이 변경될 수 있습니다. 변경된 약관은
          서비스에 게시됨과 동시에 효력이 발생합니다.
        </p>
      </section>
    {:else}
      <section class="legal-section">
        <h2>1. Service Introduction</h2>
        <p>
          Productivity Tools (the "Service") is a collection of free online
          productivity tools. This Service provides various tools including QR
          code generator, metronome, and more.
        </p>
        <p class="legal-updated">Last updated: January 2025</p>
      </section>

      <section class="legal-section">
        <h2>2. Terms of Use</h2>
        <ul>
          <li>This Service is free for everyone to use</li>
          <li>No registration or personal information required</li>
          <li>Free to use for commercial or non-commercial purposes</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>3. Service Provision</h2>
        <p>
          This Service is provided "as is". The Service provider makes no
          express or implied warranties regarding the accuracy, completeness,
          or reliability of the Service.
        </p>
      </section>

      <section class="legal-section">
        <h2>4. Limitation of Liability</h2>
        <p>
          The Service provider shall not be liable for any direct, indirect,
          incidental, special, or consequential damages arising from the use
          of this Service.
        </p>
      </section>

      <section class="legal-section">
        <h2>5. Open Source</h2>
        <p>
          This Service is open source under the MIT License. The source code
          is available on GitHub.
        </p>
      </section>

      <section class="legal-section">
        <h2>6. Changes to Terms</h2>
        <p>
          These Terms of Service may be modified without prior notice. Modified
          terms become effective upon posting on the Service.
        </p>
      </section>
    {/if}
  </div>
</PageLayout>
