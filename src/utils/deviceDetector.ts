// Real hardware battery & device model detection for Android and Browsers

export interface RealDeviceInfo {
  model: string;
  batteryLevel: number;
  isCharging: boolean;
}

// Extract human-readable device model from User-Agent or Client Hints
export function detectDeviceModel(): string {
  if (typeof window === 'undefined') return 'Android Phone';

  const userAgent = navigator.userAgent || '';
  
  // Try matching Android specific models from User-Agent (e.g. "SM-G991B", "Pixel 7", "Redmi Note 12", "Xiaomi 13")
  const androidModelMatch = userAgent.match(/Android[^;]+;\s*([^;)]+)\s*[;)]/i);
  if (androidModelMatch && androidModelMatch[1]) {
    const rawModel = androidModelMatch[1].trim();
    // Filter out build numbers or generic strings
    if (!rawModel.toLowerCase().includes('k/') && !rawModel.toLowerCase().includes('wv')) {
      return rawModel;
    }
  }

  // Common brands detection
  if (/Pixel/i.test(userAgent)) {
    const pixelMatch = userAgent.match(/Pixel\s*[\w\d]+/i);
    return pixelMatch ? pixelMatch[0] : 'Google Pixel';
  }
  if (/Samsung|SM-|GT-/i.test(userAgent)) {
    const samMatch = userAgent.match(/SM-[\w\d]+/i);
    return samMatch ? `Samsung Galaxy (${samMatch[0]})` : 'Samsung Galaxy';
  }
  if (/Xiaomi|Redmi|POCO/i.test(userAgent)) {
    const xiaomiMatch = userAgent.match(/(Redmi[^;)]+|POCO[^;)]+|Xiaomi[^;)]+)/i);
    return xiaomiMatch ? xiaomiMatch[0].trim() : 'Xiaomi Android';
  }
  if (/Motorola|Moto/i.test(userAgent)) {
    const motoMatch = userAgent.match(/(Moto[^;)]+|Motorola[^;)]+)/i);
    return motoMatch ? motoMatch[0].trim() : 'Motorola Phone';
  }
  if (/Huawei|HONOR/i.test(userAgent)) {
    return 'Huawei / Honor';
  }
  if (/iPhone/i.test(userAgent)) {
    return 'Apple iPhone';
  }
  if (/Android/i.test(userAgent)) {
    return 'Dispositivo Android';
  }

  // Desktop or generic fallback
  if (/Mac/i.test(userAgent)) return 'Mac OS';
  if (/Windows/i.test(userAgent)) return 'Windows PC';
  if (/Linux/i.test(userAgent)) return 'Linux Device';

  return 'Mi Teléfono Android';
}

// Hook to listen to real Battery API events
export function initRealBatteryListener(
  onUpdate: (level: number, charging: boolean) => void
): () => void {
  let batteryObj: any = null;

  const updateBattery = () => {
    if (!batteryObj) return;
    const level = Math.round((batteryObj.level ?? 1) * 100);
    const charging = Boolean(batteryObj.charging);
    onUpdate(level, charging);
  };

  // navigator.getBattery() is standard on Chrome/Android
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      batteryObj = battery;
      updateBattery();

      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    }).catch(() => {
      // Ignored if unsupported
    });
  }

  return () => {
    if (batteryObj) {
      batteryObj.removeEventListener('levelchange', updateBattery);
      batteryObj.removeEventListener('chargingchange', updateBattery);
    }
  };
}
