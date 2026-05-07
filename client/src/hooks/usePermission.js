import useAuthStore from '../store/authStore';
import { ROLES } from '../constants';

/**
 * Permission hook for role-based UI rendering
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  return {
    isAdmin: role === ROLES.ADMIN,
    isMember: role === ROLES.MEMBER,
    canCreateProject: role === ROLES.ADMIN,
    canEditProject: role === ROLES.ADMIN,
    canDeleteProject: role === ROLES.ADMIN,
    canManageMembers: role === ROLES.ADMIN,
    canCreateTask: true, // Both roles can create
    canDeleteTask: role === ROLES.ADMIN,
    canEditTask: (task) => {
      if (role === ROLES.ADMIN) return true;
      return task?.assignedTo?._id === user?._id || task?.assignedTo === user?._id;
    },
    canAssignTask: role === ROLES.ADMIN,
  };
}
