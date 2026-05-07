import { useEffect, useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import useTaskStore from '../../store/taskStore';
import useProjectStore from '../../store/projectStore';
import { userService } from '../../services/userService';
import { usePermission } from '../../hooks/usePermission';
import { useDebounce } from '../../hooks/useDebounce';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import SearchInput from '../../components/ui/SearchInput';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import { SkeletonCard } from '../../components/ui/Skeleton';
import TaskForm from '../../components/tasks/TaskForm';
import {
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from '../../constants';
import { format, getDueDateStatus } from '../../utils/dateUtils';
import { CheckSquare, Calendar, User, Edit, Trash2 } from 'lucide-react';

export default function TasksPage() {
  const { tasks, isLoading, pagination, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { canCreateTask, canDeleteTask, canEditTask, isAdmin } = usePermission();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('kanban');
  const debouncedSearch = useDebounce(search);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProjects({ limit: 100 });
    userService.getTeam().then((res) => setMembers(res.data.data.users)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchTasks({
      page: 1,
      search: debouncedSearch,
      status: statusFilter,
      priority: priorityFilter,
      limit: 50,
    });
  }, [debouncedSearch, statusFilter, priorityFilter]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    const result = await createTask(data);
    setFormLoading(false);
    if (result.success) {
      setShowCreateModal(false);
      return true;
    }
    return false;
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    const result = await updateTask(editTask._id, data);
    setFormLoading(false);
    if (result.success) {
      setEditTask(null);
      return true;
    }
    return false;
  };

  const handleDelete = async () => {
    const result = await deleteTask(deleteTarget._id);
    if (result.success) setDeleteTarget(null);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  // Group tasks by status for Kanban
  const kanbanColumns = [
    { id: TASK_STATUSES.TODO, label: 'To Do', color: 'border-surface-300' },
    { id: TASK_STATUSES.IN_PROGRESS, label: 'In Progress', color: 'border-amber-400' },
    { id: TASK_STATUSES.COMPLETED, label: 'Completed', color: 'border-emerald-400' },
  ];

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const renderTaskCard = (task) => {
    const dueStatus = getDueDateStatus(task.dueDate, task.status);
    const dueDateClasses = {
      overdue: 'text-red-600 bg-red-50',
      today: 'text-amber-600 bg-amber-50',
      completed: 'text-emerald-600 bg-emerald-50',
      upcoming: 'text-surface-500 bg-surface-50',
      none: '',
    };

    return (
      <Card key={task._id} className={`p-4 ${dueStatus === 'overdue' ? 'border-l-3 border-l-red-400' : ''}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium text-surface-800 line-clamp-2">{task.title}</h4>
          <Badge className={PRIORITY_COLORS[task.priority]}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>
        </div>

        {task.description && (
          <p className="text-xs text-surface-400 line-clamp-2 mb-3">{task.description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {task.project?.title && (
            <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md">
              {task.project.title}
            </span>
          )}
          {task.dueDate && (
            <span className={`text-xs px-2 py-0.5 rounded-md ${dueDateClasses[dueStatus]}`}>
              {dueStatus === 'overdue' ? '⚠ ' : ''}{format(task.dueDate)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.assignedTo && (
              <div className="flex items-center gap-1.5" title={task.assignedTo.name}>
                <div className="w-5 h-5 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-[10px] font-semibold">
                  {task.assignedTo.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-xs text-surface-500">{task.assignedTo.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {canEditTask(task) && (
              <button
                onClick={() => setEditTask(task)}
                className="p-1 rounded hover:bg-surface-100 text-surface-400 hover:text-primary-500 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
            {canDeleteTask && (
              <button
                onClick={() => setDeleteTarget(task)}
                className="p-1 rounded hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div>
          <h2 className="text-xl font-bold text-surface-800">Tasks</h2>
          <p className="text-sm text-surface-500">Manage and track all team tasks</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          {/* View Toggle */}
          <div className="flex items-center bg-surface-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {canCreateTask && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full">
        <div className="flex-1 min-w-0 max-w-lg">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search tasks..."
            className="w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 bg-white border border-surface-200 rounded-lg text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-11 px-4 bg-white border border-surface-200 rounded-lg text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer min-w-[140px]"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Task Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={search || statusFilter || priorityFilter ? 'Try adjusting your filters' : 'Create your first task to get started'}
          actionLabel={canCreateTask && !search ? 'Create Task' : ''}
          onAction={() => setShowCreateModal(true)}
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="flex gap-6 overflow-x-auto pb-6 w-full snap-x">
          {kanbanColumns.map((col) => {
            const columnTasks = getTasksByStatus(col.id);
            return (
              <div key={col.id} className={`w-[340px] shrink-0 snap-start bg-surface-50 rounded-xl p-3 border-t-4 ${col.color}`}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-surface-700">{col.label}</h3>
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full text-surface-500 font-medium">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {columnTasks.map(renderTaskCard)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="overflow-hidden w-full">
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">Task</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">Assignee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">Due Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {tasks.map((task) => {
                  const dueStatus = getDueDateStatus(task.dueDate, task.status);
                  return (
                    <tr key={task._id} className={`hover:bg-surface-50/50 ${dueStatus === 'overdue' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3 min-w-[200px]">
                        <span className="text-sm font-medium text-surface-800">{task.title}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-500 whitespace-nowrap">{task.project?.title || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-[10px] font-semibold">
                              {task.assignedTo.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-sm text-surface-600">{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-surface-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge className={PRIORITY_COLORS[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          disabled={!canEditTask(task)}
                          className="text-xs border border-surface-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {task.dueDate ? (
                          <span className={`text-xs font-medium ${
                            dueStatus === 'overdue' ? 'text-red-600' :
                            dueStatus === 'today' ? 'text-amber-600' :
                            'text-surface-500'
                          }`}>
                            {format(task.dueDate)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {canEditTask(task) && (
                            <button onClick={() => setEditTask(task)} className="p-1 rounded hover:bg-surface-100 text-surface-400 hover:text-primary-500 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteTask && (
                            <button onClick={() => setDeleteTarget(task)} className="p-1 rounded hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Pagination pagination={pagination} onPageChange={(page) => fetchTasks({ page, search: debouncedSearch, status: statusFilter, priority: priorityFilter, limit: 50 })} />

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Task" size="lg">
        <TaskForm
          projects={projects}
          members={members}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        <TaskForm
          initialData={editTask}
          projects={projects}
          members={members}
          onSubmit={handleUpdate}
          onCancel={() => setEditTask(null)}
          loading={formLoading}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Delete"
      />
    </div>
  );
}
