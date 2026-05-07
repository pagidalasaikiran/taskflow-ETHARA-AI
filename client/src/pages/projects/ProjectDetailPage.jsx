import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  CheckSquare,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';
import { userService } from '../../services/userService';
import { usePermission } from '../../hooks/usePermission';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { SkeletonTable } from '../../components/ui/Skeleton';
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from '../../constants';
import { format, getDueDateStatus } from '../../utils/dateUtils';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProject, addMember, removeMember, clearCurrentProject, isLoading } = useProjectStore();
  const { canManageMembers } = usePermission();

  const [showAddMember, setShowAddMember] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchProject(id);
    return () => clearCurrentProject();
  }, [id]);

  useEffect(() => {
    if (canManageMembers) {
      userService.getTeam().then((res) => setTeamMembers(res.data.data.users)).catch(() => {});
    }
  }, [canManageMembers]);

  if (isLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const project = currentProject;
  const tasks = project.tasks || [];
  const availableMembers = teamMembers.filter(
    (u) => !project.teamMembers?.some((m) => m._id === u._id)
  );

  const handleAddMember = async () => {
    if (!selectedUser) return;
    await addMember(project._id, selectedUser);
    setSelectedUser('');
    setShowAddMember(false);
    fetchProject(id);
  };

  const handleRemoveMember = async (userId) => {
    await removeMember(project._id, userId);
    fetchProject(id);
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      {/* Project Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-surface-800">{project.title}</h1>
              <Badge className={PROJECT_STATUS_COLORS[project.status]}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
            </div>
            <p className="text-surface-500 mb-4">{project.description || 'No description'}</p>
            <ProgressBar value={project.progress} />
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-surface-500">
              <span>{project.totalTasks} tasks</span>
              <span>{project.completedTasks} completed</span>
              <span>Created {format(project.createdAt, 'full')}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-surface-800">Tasks</h3>
          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks yet"
              description="Create tasks in the Tasks page for this project"
            />
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                const dueStatus = getDueDateStatus(task.dueDate, task.status);
                return (
                  <Card key={task._id} className="p-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-surface-800 truncate">{task.title}</span>
                        <Badge className={PRIORITY_COLORS[task.priority]}>
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-surface-400">
                        {task.assignedTo && <span>→ {task.assignedTo.name}</span>}
                        {task.dueDate && (
                          <span className={
                            dueStatus === 'overdue' ? 'text-red-500 font-medium' :
                            dueStatus === 'today' ? 'text-amber-500 font-medium' : ''
                          }>
                            {dueStatus === 'overdue' && '⚠ '}
                            Due {format(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={TASK_STATUS_COLORS[task.status]}>
                      {TASK_STATUS_LABELS[task.status]}
                    </Badge>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-surface-800 flex items-center gap-2">
              <Users className="w-4 h-4" /> Team
            </h3>
            {canManageMembers && (
              <Button size="sm" variant="outline" onClick={() => setShowAddMember(true)}>
                <Plus className="w-3 h-3" /> Add
              </Button>
            )}
          </div>

          <Card className="p-4">
            {project.teamMembers?.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-4">No team members</p>
            ) : (
              <div className="space-y-3">
                {project.teamMembers?.map((member) => (
                  <div key={member._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {member.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-700">{member.name}</p>
                        <p className="text-xs text-surface-400">{member.role}</p>
                      </div>
                    </div>
                    {canManageMembers && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="p-1 rounded hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Team Member" size="sm">
        <div className="space-y-4">
          <Select
            label="Select Member"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            placeholder="Choose a team member"
            options={availableMembers.map((u) => ({ value: u._id, label: `${u.name} (${u.role})` }))}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowAddMember(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={!selectedUser}>Add Member</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
