import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="text-center max-w-md animate-slide-up">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[8rem] font-black text-surface-100 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-surface-800 mb-3">Page not found</h2>
        <p className="text-surface-500 mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard">
            <Button>
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Link to={-1}>
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
