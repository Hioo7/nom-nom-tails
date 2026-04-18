import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
}

export default function PasswordField({
  value,
  onChange,
  disabled,
  error,
  label = 'Password',
  placeholder = '••••••••',
  autoComplete = 'current-password',
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={`input w-full pr-10${error ? ' input-error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm absolute right-0 top-0 h-full px-3 text-base-content/50 hover:text-base-content"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          disabled={disabled}
        >
          {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </fieldset>
  );
}
