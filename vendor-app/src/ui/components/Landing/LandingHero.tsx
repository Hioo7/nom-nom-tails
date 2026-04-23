import nomnomlogo from '../../../assets/nomnomlogo.webp';

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-12 bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] text-[6rem] leading-none select-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%23b45309'><circle cx='30' cy='55' r='7'/><circle cx='50' cy='42' r='7'/><circle cx='70' cy='42' r='7'/><circle cx='90' cy='55' r='7'/><ellipse cx='60' cy='78' rx='16' ry='13'/></g></svg>\")",
          backgroundSize: '140px 140px',
        }}
      />

      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-primary/25 blur-2xl animate-pulse" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-base-100 shadow-xl">
            <img src={nomnomlogo} alt="NomNom Tails" className="h-20 w-auto" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">NomNom Tails</h1>
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-base-content/50">
            <span>•</span>
            <span>Staff Portal</span>
            <span>•</span>
          </div>
        </div>

        <p className="max-w-[18rem] text-base leading-relaxed text-base-content/70">
          Keep tails wagging. Sign in to manage orders, deliveries, and meal plans.
        </p>
      </div>
    </section>
  );
}
