import type { IconType } from 'react-icons';
import { FiChevronRight } from 'react-icons/fi';

interface LandingFeatureRowProps {
  icon: IconType;
  iconTileClassName: string;
  title: string;
  description: string;
}

export default function LandingFeatureRow({
  icon: Icon,
  iconTileClassName,
  title,
  description,
}: LandingFeatureRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-base-100 p-4 border border-base-200">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconTileClassName}`}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-base-content">{title}</p>
        <p className="text-xs leading-snug text-base-content/60 mt-0.5">{description}</p>
      </div>
      <FiChevronRight size={18} className="shrink-0 text-base-content/30" />
    </div>
  );
}
