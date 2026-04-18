interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function EmailField({ value, onChange, disabled, error }: EmailFieldProps) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">Email</legend>
      <input
        type="email"
        className={`input w-full${error ? ' input-error' : ''}`}
        placeholder="you@example.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="email"
      />
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </fieldset>
  );
}
