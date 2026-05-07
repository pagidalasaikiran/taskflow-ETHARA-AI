import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import { usePermission } from '../../hooks/usePermission';
import { useDebounce } from '../../hooks/useDebounce';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import SearchInput from '../../components/ui/SearchInput';
import ProgressBar from '../../components/ui/ProgressBar';
import Pagination from '../../components/ui/Pagination';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ProjectForm from '../../components/projects/ProjectForm';
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '../../constants';
import { format } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, isLoading, pagination, fetchProjects, createProject, updateProject, deleteProject } = useProjectStore();
  const { canCreateProject, canEditProject, canDeleteProject } = usePermission();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProjects({ page: 1, search: debouncedSearch });
  }, [debouncedSearch]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    const result = await createProject(data);
    setFormLoading(false);
    if (result.success) {
      setShowCreateModal(false);
      return true;
    }
    return false;
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    const result = await updateProject(editProject._id, data);
    setFormLoading(false);
    if (result.success) {
      setEditProject(null);
      return true;
    }
    return false;
  };

  const handleDelete = async () => {
    const result = await deleteProject(deleteTarget._id);
    if (result.success) setDeleteTarget(null);
  };

  const handlePageChange = (page) => {
    fetchProjects({ page, search: debouncedSearch });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 w-full">
        <div>
          <h2 className="text-xl font-bold text-surface-800">Projects</h2>
          <p className="text-sm text-surface-500">Manage and track your team's projects</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
          <div className="flex-1 min-w-0 sm:w-64 max-w-lg">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search projects..."
              className="w-full"
            />
          </div>
          {canCreateProject && (
            <Button onClick={() => setShowCreateModal(true)} className="whitespace-nowrap">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={search ? 'Try a different search term' : 'Create your first project to get started'}
          actionLabel={canCreateProject && !search ? 'Create Project' : ''}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="p-6 cursor-pointer flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-surface-900 truncate pr-2 tracking-tight">{project.title}</h3>
                  <Badge className={`${PROJECT_STATUS_COLORS[project.status]} px-2.5 py-1 text-xs font-semibold rounded-full`}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                </div>

                <p className="text-sm text-surface-500 line-clamp-3 mb-6 min-h-[3rem] leading-relaxed">
                  {project.description || 'No description provided'}
                </p>

                <div className="space-y-4">
                  <ProgressBar value={project.progress} size="md" />
                </div>

                <div className="mt-auto pt-6 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {project.teamMembers?.slice(0, 4).map((m) => (
                        <div
                          key={m._id}
                          className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white ring-1 ring-surface-100"
                          title={m.name}
                        >
                          {m.name?.charAt(0)?.toUpperCase()}
                        </div>
                      ))}
                      {project.teamMembers?.length > 4 && (
                        <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center text-surface-600 text-xs font-bold border-2 border-white ring-1 ring-surface-100">
                          +{project.teamMembers.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-surface-400">{format(project.createdAt)}</span>
                  </div>

                  {/* Action buttons */}
                  {(canEditProject || canDeleteProject) && (
                    <div className="flex gap-4 pt-4 border-t border-surface-100 w-full">
                      {canEditProject && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditProject(project); }}
                          className="text-xs text-primary-600 hover:text-primary-700 font-bold uppercase tracking-wider transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {canDeleteProject && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}
                          className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <div className="pt-8">
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Project">
        <ProjectForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
        <ProjectForm
          initialData={editProject}
          onSubmit={handleUpdate}
          onCancel={() => setEditProject(null)}
          loading={formLoading}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All associated tasks will also be deleted.`}
        confirmText="Delete"
      />
    </div>
  );
}
