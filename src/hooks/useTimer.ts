import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook for managing timer
 */
export const useTimer = (timeLimit: number, onTimeUp?: () => void) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isActive, setIsActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isActive || isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, timeLeft, onTimeUp]);

  const reset = useCallback(() => {
    setTimeLeft(timeLimit);
    setIsActive(true);
    setIsPaused(false);
  }, [timeLimit]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const percentage = useMemo(() => 
    (timeLeft / timeLimit) * 100,
    [timeLeft, timeLimit]
  );

  const isWarning = useMemo(() => 
    timeLeft <= timeLimit * 0.3 && timeLeft > timeLimit * 0.1,
    [timeLeft, timeLimit]
  );

  const isCritical = useMemo(() => 
    timeLeft <= timeLimit * 0.1,
    [timeLeft, timeLimit]
  );

  return { 
    timeLeft, 
    isActive, 
    isPaused,
    percentage,
    isWarning,
    isCritical,
    setIsActive, 
    reset,
    pause,
    resume,
    stop,
  };
};
