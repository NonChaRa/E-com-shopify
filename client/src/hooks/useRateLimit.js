import { useState, useCallback, useEffect, useRef } from 'react';

const useRateLimit = (key, cooldownSeconds = 30) => {
  const storageKey = `rl_${key}`;
  const intervalRef = useRef(null);

  const getSecondsLeft = useCallback(() => {
    const last = parseInt(localStorage.getItem(storageKey) || '0', 10);
    if (!last) return 0;
    const elapsed = Math.floor((Date.now() - last) / 1000);
    return Math.max(0, cooldownSeconds - elapsed);
  }, [storageKey, cooldownSeconds]);

  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft());

  // Resume countdown if a cooldown was active before the component mounted
  useEffect(() => {
    const left = getSecondsLeft();
    if (left <= 0) return;

    setSecondsLeft(left);
    intervalRef.current = setInterval(() => {
      const remaining = getSecondsLeft();
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [getSecondsLeft]);

  const recordSubmission = useCallback(() => {
    localStorage.setItem(storageKey, String(Date.now()));
    if (intervalRef.current) clearInterval(intervalRef.current);

    setSecondsLeft(cooldownSeconds);
    intervalRef.current = setInterval(() => {
      const remaining = getSecondsLeft();
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);
  }, [storageKey, cooldownSeconds, getSecondsLeft]);

  return { canSubmit: secondsLeft === 0, recordSubmission, secondsLeft };
};

export default useRateLimit;
