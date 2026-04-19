import { useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { SCANNER_DEBOUNCE_MS } from '../constants/config';

interface UseScannerReturn {
  handleScan: (qrCode: string) => boolean;
  sessionCount: React.MutableRefObject<number>;
  lastScannedCode: React.MutableRefObject<string | null>;
}

export function useScanner(): UseScannerReturn {
  const lastScannedCode = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);
  const sessionCount = useRef<number>(0);

  const handleScan = useCallback((qrCode: string): boolean => {
    const now = Date.now();

    if (qrCode === lastScannedCode.current && now - lastScanTime.current < SCANNER_DEBOUNCE_MS) {
      return false;
    }

    lastScannedCode.current = qrCode;
    lastScanTime.current = now;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    return true;
  }, []);

  return { handleScan, sessionCount, lastScannedCode };
}
