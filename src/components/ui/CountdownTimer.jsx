import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <span key={interval} style={{ fontSize: '12px', fontWeight: 900, color: 'inherit' }}>
        {timeLeft[interval].toString().padStart(2, '0')}{interval === 's' ? '' : ':'}
      </span>
    );
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 160px 10px 16px', backgroundColor: 'var(--brand-blue)', color: '#fff', borderRadius: '2px', width: 'fit-content' }}>
       <Timer size={14} style={{ color: '#fff' }} />
       <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', marginRight: '4px' }}>FLASH ENDS:</span>
       <div style={{ display: 'flex', gap: '2px' }}>
          {timerComponents.length ? timerComponents : <span style={{ fontSize: '10px', fontWeight: 900 }}>SALE ENDED</span>}
       </div>
    </div>
  );
};

export default CountdownTimer;
