/**
 * useClock.js
 * ───────────
 * Live clock hook. Updates every second.
 * Returns a stable { now, timeStr, dateStr, dayStr, greeting } object.
 *
 * Usage:
 *   const { timeStr, dateStr, dayStr, greeting } = useClock();
 */

import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';

function getGreeting(date) {
  const h = date.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function useClock() {
  const [now, setNow] = useState(() => new Date());
  const timerRef = useRef(null);

  useEffect(() => {
    // Align to the next full second
    const msUntilNextSecond = 1000 - (Date.now() % 1000);
    const startId = setTimeout(() => {
      setNow(new Date());
      timerRef.current = setInterval(() => setNow(new Date()), 1000);
    }, msUntilNextSecond);

    return () => {
      clearTimeout(startId);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    now,
    timeStr:  format(now, 'hh:mm:ss a'),
    time24:   format(now, 'HH:mm:ss'),
    dateStr:  format(now, 'd MMMM yyyy'),
    dayStr:   format(now, 'EEEE'),
    monthStr: format(now, 'MMMM yyyy'),
    greeting: getGreeting(now),
    hour:     now.getHours(),
    minute:   now.getMinutes(),
  };
}
