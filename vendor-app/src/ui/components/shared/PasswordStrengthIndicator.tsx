type Strength = 'weak' | 'fair' | 'strong';

function getStrength(password: string): Strength {
  if (password.length < 8) return 'weak';
  const checks = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  if (password.length >= 12 && score >= 3) return 'strong';
  if (password.length >= 8 && score >= 2) return 'fair';
  return 'weak';
}

const CONFIG: Record<Strength, { label: string; textClass: string; width: string }> = {
  weak: { label: 'Weak', textClass: 'text-error', width: 'w-1/3' },
  fair: { label: 'Fair', textClass: 'text-warning', width: 'w-2/3' },
  strong: { label: 'Strong', textClass: 'text-success', width: 'w-full' },
};

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;
  const strength = getStrength(password);
  const { label, textClass, width } = CONFIG[strength];

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 bg-base-300 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${width} ${
          strength === 'weak' ? 'bg-error' : strength === 'fair' ? 'bg-warning' : 'bg-success'
        }`} />
      </div>
      <span className={`text-xs font-medium ${textClass}`}>{label}</span>
    </div>
  );
}
