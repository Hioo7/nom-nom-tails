import type { IconType } from 'react-icons';
import { FiClipboard, FiTruck, FiCoffee } from 'react-icons/fi';
import LandingFeatureRow from './LandingFeatureRow';

interface Feature {
  icon: IconType;
  iconTileClassName: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: FiClipboard,
    iconTileClassName: 'bg-primary/10 text-primary',
    title: 'Order Management',
    description: 'Track daily orders and customer requests in real time.',
  },
  {
    icon: FiTruck,
    iconTileClassName: 'bg-warning/15 text-warning',
    title: 'Delivery Dispatch',
    description: 'Assign partners, monitor routes, and confirm drop-offs.',
  },
  {
    icon: FiCoffee,
    iconTileClassName: 'bg-success/15 text-success',
    title: 'Meal Plans & Menu',
    description: 'Curate subscription plans, dishes, and ingredients.',
  },
];

export default function LandingFeatures() {
  return (
    <section className="px-6 pt-8 pb-4">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-base-content/50">
          What you can do
        </h2>
        <div className="h-px flex-1 bg-base-300" />
      </div>
      <div className="flex flex-col gap-2.5">
        {FEATURES.map((f) => (
          <LandingFeatureRow
            key={f.title}
            icon={f.icon}
            iconTileClassName={f.iconTileClassName}
            title={f.title}
            description={f.description}
          />
        ))}
      </div>
    </section>
  );
}
