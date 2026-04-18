import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import DogIllustration from './DogIllustration';

export default function NotFoundContent() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm">
      <div className="relative">
        <div className="text-[8rem] font-black text-primary/10 leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <DogIllustration />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-base-content">Page not found</h1>
        <p className="text-base-content/60 text-sm">
          Oops! This page ran away like a dog. Let's get you back on track.
        </p>
      </div>

      <button
        className="btn btn-primary gap-2"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/login', { replace: true }))}
      >
        <FiArrowLeft size={16} />
        Go Back
      </button>
    </div>
  );
}
