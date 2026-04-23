import { FaPaw } from 'react-icons/fa';
import LoginCard from '../components/Login/LoginCard';

const PAWS = [
  { top: '6%',  left: '8%',  rotate: -25, size: 28 },
  { top: '12%', left: '72%', rotate:  35, size: 20 },
  { top: '28%', left: '88%', rotate: -10, size: 24 },
  { top: '42%', left: '3%',  rotate:  15, size: 18 },
  { top: '58%', left: '80%', rotate: -30, size: 26 },
  { top: '70%', left: '18%', rotate:  20, size: 22 },
  { top: '82%', left: '60%', rotate: -15, size: 20 },
  { top: '90%', left: '40%', rotate:  40, size: 16 },
];

export default function LoginPage() {
  return (
    <div
      className="min-h-dvh w-full relative flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #fef3c7 0%, #fde68a 55%, #fef9ee 100%)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PAWS.map((p, i) => (
          <FaPaw
            key={i}
            size={p.size}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              transform: `rotate(${p.rotate}deg)`,
              opacity: 0.12,
              color: '#f59e0b',
            }}
          />
        ))}
      </div>
      <div className="relative z-10 w-full flex justify-center">
        <LoginCard />
      </div>
    </div>
  );
}
