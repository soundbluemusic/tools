import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { QRGenerator } from '../apps/qr/components/QRGenerator';

/**
 * QR Code Generator Tool Page
 */
const QR = memo(function QR() {
  const navigate = useNavigate();

  const handleBackClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (document.startViewTransition) {
        e.preventDefault();
        document.startViewTransition(() => {
          navigate('/');
        });
      }
    },
    [navigate]
  );

  return (
    <div className="qr-page">
      <Link to="/" className="back-link" onClick={handleBackClick}>
        ← 돌아가기
      </Link>
      <QRGenerator />
    </div>
  );
});

QR.displayName = 'QR';

export default QR;
