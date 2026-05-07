// User roles
export const ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
};

// Task statuses
export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUSES.TODO]: 'To Do',
  [TASK_STATUSES.IN_PROGRESS]: 'In Progress',
  [TASK_STATUSES.COMPLETED]: 'Completed',
};

export const TASK_STATUS_COLORS = {
  [TASK_STATUSES.TODO]: 'bg-surface-200 text-surface-700',
  [TASK_STATUSES.IN_PROGRESS]: 'bg-amber-100 text-amber-800',
  [TASK_STATUSES.COMPLETED]: 'bg-emerald-100 text-emerald-800',
};

// Priorities
export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const PRIORITY_LABELS = {
  [PRIORITIES.LOW]: 'Low',
  [PRIORITIES.MEDIUM]: 'Medium',
  [PRIORITIES.HIGH]: 'High',
};

export const PRIORITY_COLORS = {
  [PRIORITIES.LOW]: 'bg-blue-100 text-blue-800',
  [PRIORITIES.MEDIUM]: 'bg-amber-100 text-amber-800',
  [PRIORITIES.HIGH]: 'bg-red-100 text-red-800',
};

// Project statuses
export const PROJECT_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUSES.ACTIVE]: 'Active',
  [PROJECT_STATUSES.COMPLETED]: 'Completed',
  [PROJECT_STATUSES.ARCHIVED]: 'Archived',
};

export const PROJECT_STATUS_COLORS = {
  [PROJECT_STATUSES.ACTIVE]: 'bg-emerald-100 text-emerald-800',
  [PROJECT_STATUSES.COMPLETED]: 'bg-blue-100 text-blue-800',
  [PROJECT_STATUSES.ARCHIVED]: 'bg-surface-200 text-surface-600',
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  TASKS: '/tasks',
  PROFILE: '/profile',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    PROFILE: 'auth/profile',
  },
  PROJECTS: 'projects',
  TASKS: 'tasks',
  TASK_STATS: 'tasks/stats',
  USERS: 'users',
  TEAM: 'users/team',
  ACTIVITIES: 'activities/recent',
};
