import { useState, useEffect, useCallback, useRef } from 'react';

const IDLE_MS = 10 * 60 * 1000; // 10 minutes

export function useIdleTimer(timeout = IDLE_MS) {
  const [isIdle, setIsIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const resetTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setIsIdle(false);
    if (timeout <= 0) return;
    timer.current = setTimeout(() => setIsIdle(true), timeout);
  }, [timeout]);

  const wakeUp = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [resetTimer]);

  return { isIdle, wakeUp };
}
