import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function LandingCTACard() {
  const navigate = useNavigate();

  return (
    <section className="px-6 pt-4 pb-10">
      <button
        className="btn btn-primary w-full gap-2 text-base h-12"
        onClick={() => navigate('/login')}
      >
        Staff Login
        <FiArrowRight size={18} />
      </button>
    </section>
  );
}
