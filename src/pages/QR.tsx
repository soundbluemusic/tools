import { memo } from 'react';
import { Link } from 'react-router-dom';

const QR = memo(function QR() {
  return (
    <main className="container tool-page">
      <Link to="/" className="back-link">&larr; 돌아가기</Link>
      <h1>QR 코드 생성기</h1>
      <p className="tool-desc">QR Code Generator</p>
      <div className="tool-content">
        <p>QR 코드 생성기가 여기에 들어갑니다.</p>
      </div>
    </main>
  );
});

export default QR;
