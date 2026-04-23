import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALLED_KEY = 'pwa_installed';

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

async function checkInstalledRelatedApps(): Promise<boolean> {
  if (!('getInstalledRelatedApps' in navigator)) return false;
  try {
    const apps = await (
      navigator as unknown as {
        getInstalledRelatedApps: () => Promise<{ id?: string; platform: string }[]>;
      }
    ).getInstalledRelatedApps();
    return apps.length > 0;
  } catch {
    return false;
  }
}

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(
    () => isStandaloneMode() || localStorage.getItem(INSTALLED_KEY) === 'true'
  );

  // Re-check via getInstalledRelatedApps in case localStorage was cleared
  useEffect(() => {
    if (isInstalled) return;
    checkInstalledRelatedApps().then((installed) => {
      if (installed) {
        localStorage.setItem(INSTALLED_KEY, 'true');
        setIsInstalled(true);
      }
    });
  }, [isInstalled]);

  useEffect(() => {
    if (isInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [isInstalled]);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setIsInstalled(true);
    }
    setPromptEvent(null);
  };

  const isDev = import.meta.env.DEV;
  return { canInstall: !isInstalled && (!!promptEvent || isDev), install };
}
