import React, { useState } from 'react';

interface BuckCardProps {
  name: string;
  last4: string;
  cvv: string;
}

const toSignature = (name: string) =>
  name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

// Tap to flip: front shows the masked number, back shows the cardholder name,
// a handwritten signature and the CVV.
export const BuckCard: React.FC<BuckCardProps> = ({ name, last4, cvv }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className={`buckme-card ${flipped ? 'is-flipped' : ''}`}
      onClick={() => setFlipped((value) => !value)}
      aria-label="Flip card"
    >
      <div className="buckme-card-inner">
        <div className="buckme-card-face buckme-card-front">
          <span className="buckme-card-number">•••• •••• •••• {last4}</span>
        </div>
        <div className="buckme-card-face buckme-card-back">
          <span className="buckme-card-name">{name}</span>
          <div className="buckme-card-strip">
            <span className="buckme-card-signature">{toSignature(name)}</span>
          </div>
          <span className="buckme-card-cvv">{cvv}</span>
        </div>
      </div>
    </button>
  );
};
