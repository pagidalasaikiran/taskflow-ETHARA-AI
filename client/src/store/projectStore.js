import { create } from 'zustand';
import { projectService } from '../services/projectService';
import toast from 'react-hot-toast';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  pagination: { total: 0, page: 1, pages: 1, limit: 12 },

  fetchProjects: async (params = {}) => {
    try {
      set({ isLoading: true });
      const { data } = await projectService.getAll(params);
      set({
        projects: data.data.projects,
        pagination: data.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch projects');
    }
  },

  fetchProject: async (id) => {
    try {
      set({ isLoading: true });
      const { data } = await projectService.getById(id);
      set({ currentProject: data.data.project, isLoading: false });
      return data.data.project;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch project');
      return null;
    }
  },

  createProject: async (projectData) => {
    try {
      const { data } = await projectService.create(projectData);
      set((state) => ({
        projects: [data.data.project, ...state.projects],
      }));
      toast.success('Project created successfully!');
      return { success: true, project: data.data.project };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project';
      toast.error(message);
      return { success: false };
    }
  },

  updateProject: async (id, projectData) => {
    try {
      const { data } = await projectService.update(id, projectData);
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === id ? data.data.project : p
        ),
        currentProject:
          state.currentProject?._id === id
            ? { ...state.currentProject, ...data.data.project }
            : state.currentProject,
      }));
      toast.success('Project updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update project';
      toast.error(message);
      return { success: false };
    }
  },

  deleteProject: async (id) => {
    try {
      await projectService.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== id),
      }));
      toast.success('Project deleted successfully!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete project');
      return { success: false };
    }
  },

  addMember: async (projectId, userId) => {
    try {
      const { data } = await projectService.addMember(projectId, userId);
      set((state) => ({
        currentProject:
          state.currentProject?._id === projectId
            ? data.data.project
            : state.currentProject,
        projects: state.projects.map((p) =>
          p._id === projectId ? { ...p, teamMembers: data.data.project.teamMembers } : p
        ),
      }));
      toast.success('Member added!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
      return { success: false };
    }
  },

  removeMember: async (projectId, userId) => {
    try {
      const { data } = await projectService.removeMember(projectId, userId);
      set((state) => ({
        currentProject:
          state.currentProject?._id === projectId
            ? data.data.project
            : state.currentProject,
        projects: state.projects.map((p) =>
          p._id === projectId ? { ...p, teamMembers: data.data.project.teamMembers } : p
        ),
      }));
      toast.success('Member removed!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to remove member');
      return { success: false };
    }
  },

  clearCurrentProject: () => set({ currentProject: null }),
}));

export default useProjectStore;
