import { Outlet } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">TaskFlow</h1>
          <p className="text-lg text-primary-200 text-center max-w-md">
            Streamline your team's workflow with powerful project management and real-time collaboration.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold">100+</p>
              <p className="text-sm text-primary-300">Active Teams</p>
            </div>
            <div>
              <p className="text-3xl font-bold">5K+</p>
              <p className="text-sm text-primary-300">Tasks Managed</p>
            </div>
            <div>
              <p className="text-3xl font-bold">99%</p>
              <p className="text-sm text-primary-300">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface-50 min-h-screen">
        <div className="w-full max-w-md animate-slide-up bg-white p-8 rounded-2xl shadow-sm border border-surface-200">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
