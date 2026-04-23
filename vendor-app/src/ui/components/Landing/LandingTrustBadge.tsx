import { FiLock } from 'react-icons/fi';

export default function LandingTrustBadge() {
  return (
    <section className="px-6 pt-2 pb-6">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/60">
          <FiLock size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-base-content/70">Secure staff access</p>
          <p className="text-xs text-base-content/50">Authorized users only</p>
        </div>
      </div>
    </section>
  );
}
