import { memo } from 'react';
import { PageLayout } from '../components/layout';

/**
 * Contract Analysis Tool Page
 */
const Contract = memo(function Contract() {
  return (
    <PageLayout
      title="계약서 분석 도구"
      description="Contract Risk Analysis"
    >
      <p>계약서 분석 도구가 여기에 들어갑니다.</p>
    </PageLayout>
  );
});

Contract.displayName = 'Contract';

export default Contract;
