import { create } from 'zustand';
import { taskService } from '../services/taskService';
import toast from 'react-hot-toast';

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  pagination: { total: 0, page: 1, pages: 1, limit: 20 },
  stats: null,
  upcomingDeadlines: [],
  recentTasks: [],

  fetchTasks: async (params = {}) => {
    try {
      set({ isLoading: true });
      const { data } = await taskService.getAll(params);
      set({
        tasks: data.data.tasks,
        pagination: data.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch tasks');
    }
  },

  fetchTasksByProject: async (projectId, params = {}) => {
    try {
      set({ isLoading: true });
      const { data } = await taskService.getByProject(projectId, params);
      set({
        tasks: data.data.tasks,
        pagination: data.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch tasks');
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await taskService.getStats();
      set({
        stats: data.data.stats,
        upcomingDeadlines: data.data.upcomingDeadlines,
        recentTasks: data.data.recentTasks,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  createTask: async (taskData) => {
    try {
      const { data } = await taskService.create(taskData);
      set((state) => ({
        tasks: [data.data.task, ...state.tasks],
      }));
      toast.success('Task created successfully!');
      return { success: true, task: data.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      return { success: false };
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const { data } = await taskService.update(id, taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? data.data.task : t)),
      }));
      toast.success('Task updated successfully!');
      return { success: true, task: data.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      return { success: false };
    }
  },

  deleteTask: async (id) => {
    try {
      await taskService.delete(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== id),
      }));
      toast.success('Task deleted successfully!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete task');
      return { success: false };
    }
  },
}));

export default useTaskStore;
