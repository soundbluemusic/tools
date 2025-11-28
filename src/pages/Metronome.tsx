import { memo } from 'react';
import { Link } from 'react-router-dom';

const Metronome = memo(function Metronome() {
  return (
    <main className="container tool-page">
      <Link to="/" className="back-link">&larr; 돌아가기</Link>
      <h1>메트로놈</h1>
      <p className="tool-desc">Metronome</p>
      <div className="tool-content">
        <p>메트로놈 도구가 여기에 들어갑니다.</p>
      </div>
    </main>
  );
});

export default Metronome;
