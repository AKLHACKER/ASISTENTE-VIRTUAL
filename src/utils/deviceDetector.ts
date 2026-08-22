// Real hardware battery & device model detection for Android and Browsers

export interface RealDeviceInfo {
  model: string;
  batteryLevel: number;
  isCharging: boolean;
}

// Asynchronous detection using Client Hints (Sec-CH-UA-Model) + UserAgent
export async function getDetailedDeviceModel(): Promise<string> {
  if (typeof window === 'undefined') return 'Dispositivo Android';

  // 1. Try Navigator User-Agent Data API (Modern Android Chrome provides exact device model e.g. "SM-G998B", "Pixel 8")
  if ('userAgentData' in navigator && (navigator as any).userAgentData) {
    try {
      const uad = (navigator as any).userAgentData;
      if (typeof uad.getHighEntropyValues === 'function') {
        const hints = await uad.getHighEntropyValues(['model', 'platform', 'platformVersion']);
        if (hints.model && hints.model.trim()) {
          const m = hints.model.trim();
          return formatModelName(m);
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Fallback to synchronous detection
  return detectDeviceModel();
}

function formatModelName(raw: string): string {
  if (!raw) return 'Android Phone';
  // Samsung models (SM-S918B -> Samsung Galaxy S23 Ultra, etc.)
  if (raw.startsWith('SM-') || raw.startsWith('GT-')) {
    return `Samsung Galaxy (${raw})`;
  }
  if (/Pixel/i.test(raw)) {
    return raw.includes('Google') ? raw : `Google ${raw}`;
  }
  if (/Redmi/i.test(raw) || /POCO/i.test(raw) || /Xiaomi/i.test(raw)) {
    return raw;
  }
  if (/Moto/i.test(raw)) {
    return `Motorola ${raw}`;
  }
  return raw;
}

// Extract human-readable device model from User-Agent
export function detectDeviceModel(): string {
  if (typeof window === 'undefined') return 'Dispositivo Android';

  const userAgent = navigator.userAgent || '';
  
  // Try matching Android specific models from User-Agent (e.g. "Android 14; SM-S918B", "Android 13; Pixel 7 Pro", "Android 12; M2101K6G")
  const androidDetailedMatch = userAgent.match(/Android\s+[\d.]+;\s*([^;)]+)(?:;\s*|\))/i);
  if (androidDetailedMatch && androidDetailedMatch[1]) {
    const rawCandidate = androidDetailedMatch[1].trim();
    // Exclude generic strings or build signatures like "wv", "K", "Build"
    if (
      rawCandidate &&
      !/^wv$/i.test(rawCandidate) &&
      !/^K$/i.test(rawCandidate) &&
      !rawCandidate.toLowerCase().includes('build/') &&
      rawCandidate.length > 2
    ) {
      return formatModelName(rawCandidate);
    }
  }

  // Common brands detection with specific series
  if (/Pixel\s*[\w\d\s]+/i.test(userAgent)) {
    const pixelMatch = userAgent.match(/Pixel\s*[\w\d\s]+/i);
    return pixelMatch ? `Google ${pixelMatch[0].trim()}` : 'Google Pixel';
  }
  if (/SM-[\w\d]+|GT-[\w\d]+/i.test(userAgent)) {
    const samMatch = userAgent.match(/SM-[\w\d]+|GT-[\w\d]+/i);
    return samMatch ? `Samsung Galaxy (${samMatch[0]})` : 'Samsung Galaxy';
  }
  if (/Redmi|POCO|Xiaomi|Mi\s/i.test(userAgent)) {
    const xiaomiMatch = userAgent.match(/(Redmi[^\s;)]*[\w\d\s]*|POCO[^\s;)]*[\w\d\s]*|Xiaomi[^\s;)]*[\w\d\s]*)/i);
    return xiaomiMatch ? xiaomiMatch[0].trim() : 'Xiaomi Android';
  }
  if (/Motorola|Moto/i.test(userAgent)) {
    const motoMatch = userAgent.match(/(Moto[^\s;)]*[\w\d\s]*|Motorola[^\s;)]*[\w\d\s]*)/i);
    return motoMatch ? motoMatch[0].trim() : 'Motorola Android';
  }
  if (/OnePlus|GM19|HD19|KB20|IN20|NE22/i.test(userAgent)) {
    return 'OnePlus Phone';
  }
  if (/Oppo|CPH\d+/i.test(userAgent)) {
    return 'OPPO Phone';
  }
  if (/Vivo|V2\d+/i.test(userAgent)) {
    return 'Vivo Phone';
  }
  if (/Realme|RMX\d+/i.test(userAgent)) {
    return 'Realme Phone';
  }
  if (/Huawei|HONOR|HW-|HMA-|VOG-|ELS-/i.test(userAgent)) {
    return 'Huawei / Honor';
  }
  if (/iPhone/i.test(userAgent)) {
    return 'Apple iPhone';
  }
  if (/Android/i.test(userAgent)) {
    return 'Teléfono Android';
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
