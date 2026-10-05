import { useState, useEffect } from 'react';

/**
 * Custom hook to smoothly animate a number counter from 0 to target value on mount / update.
 * Grounded 100% in the real API target value.
 *
 * @param {number} targetValue - The exact numerical value from API
 * @param {number} duration - Animation duration in ms (default: 1000)
 * @returns {number} The current animated value
 */
export const useCountUp = (targetValue, duration = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof targetValue !== 'number' || isNaN(targetValue) || targetValue <= 0) {
      setCount(targetValue || 0);
      return;
    }

    let startTimestamp = null;
    let animationFrameId = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const current = Math.floor(easedProgress * targetValue);
      setCount(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(targetValue);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetValue, duration]);

  return count;
};

export default useCountUp;
