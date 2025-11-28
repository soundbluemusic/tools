import { memo } from 'react';
import { PageLayout } from '../components/layout';

/**
 * Metronome Tool Page
 */
const Metronome = memo(function Metronome() {
  return (
    <PageLayout
      title="메트로놈"
      description="Metronome"
    >
      <p>메트로놈 도구가 여기에 들어갑니다.</p>
    </PageLayout>
  );
});

Metronome.displayName = 'Metronome';

export default Metronome;
