import { memo } from 'react';
import { Link } from 'react-router-dom';

const Contract = memo(function Contract() {
  return (
    <main className="container tool-page">
      <Link to="/" className="back-link">&larr; 돌아가기</Link>
      <h1>계약서 분석 도구</h1>
      <p className="tool-desc">Contract Risk Analysis</p>
      <div className="tool-content">
        <p>계약서 분석 도구가 여기에 들어갑니다.</p>
      </div>
    </main>
  );
});

export default Contract;
