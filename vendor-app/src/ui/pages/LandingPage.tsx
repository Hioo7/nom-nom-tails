import { useState } from 'react';
import LandingHero from '../components/Landing/LandingHero';
import LandingInstallBanner from '../components/Landing/LandingInstallBanner';
import LandingFeatures from '../components/Landing/LandingFeatures';
import LandingCTACard from '../components/Landing/LandingCTACard';
import PWAInstallModal from '../components/shared/PWAInstallModal';

export default function LandingPage() {
  const [installModalOpen, setInstallModalOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-base-200">
      <LandingHero />
      <LandingInstallBanner onInstallClick={() => setInstallModalOpen(true)} />
      <LandingFeatures />
      <LandingCTACard />
      <PWAInstallModal open={installModalOpen} onClose={() => setInstallModalOpen(false)} />
    </div>
  );
}
