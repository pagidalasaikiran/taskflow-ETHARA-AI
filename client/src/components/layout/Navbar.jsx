import { useState } from 'react';
import { Menu, LogOut, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/profile': 'Profile',
};

export default function Navbar({ onMenuClick }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const getTitle = () => {
    if (location.pathname.startsWith('/projects/')) return 'Project Details';
    return pageTitles[location.pathname] || 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-surface-100">
      <div className="flex items-center justify-between h-16 w-full px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-surface-100 lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5 text-surface-600" />
          </button>
          <h1 className="text-lg font-semibold text-surface-800">{getTitle()}</h1>
        </div>

        <div className="flex items-center justify-end flex-1 gap-2 sm:gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-surface-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <Bell className="w-5 h-5 text-surface-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
            </button>
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-surface-200 rounded-2xl shadow-lg p-4 z-50 overflow-hidden">
                <h3 className="text-sm font-semibold text-surface-800 mb-3">Notifications</h3>
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-surface-50 rounded-lg text-sm text-surface-600 text-center">
                    No new notifications
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-surface-200">
            <span className="text-sm text-surface-600">{user?.name}</span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-red-50 text-surface-500 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
