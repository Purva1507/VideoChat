import { useRef, useCallback } from 'react';

/**
 * Custom hook for playing notification sounds
 * Uses Web Audio API to generate simple notification tones
 */
export function useNotificationSound() {
  const audioContextRef = useRef(null);

  // Initialize Audio Context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Play a notification sound
   * @param {string} type - 'join', 'leave', or 'message'
   */
  const playSound = useCallback((type) => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure sound based on type
      switch (type) {
        case 'join':
          // Rising tone for user join
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
          oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1); // A5
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;

        case 'leave':
          // Falling tone for user leave
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
          oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.15); // A4
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;

        case 'message':
          // Double beep for message
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);

          // Second beep
          setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            oscillator2.frequency.setValueAtTime(700, audioContext.currentTime);
            gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.1);
          }, 100);
          break;

        default:
          console.warn(`Unknown notification type: ${type}`);
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [getAudioContext]);

  return { playSound };
}
