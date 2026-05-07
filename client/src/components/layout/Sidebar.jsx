import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, User, X, Zap } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import useAuthStore from '../../store/authStore';
import Badge from '../ui/Badge';

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function Sidebar({ isOpen, onClose }) {
  const user = useAuthStore((state) => state.user);
  const { isAdmin } = usePermission();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-100 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-surface-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-800">TaskFlow</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-100 lg:hidden transition-colors"
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navigation.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-800'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {name}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-surface-800 truncate">{user?.name}</p>
              <Badge className={isAdmin ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-600'}>
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
