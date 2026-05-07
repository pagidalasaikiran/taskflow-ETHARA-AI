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
      <Card 
        key={task._id} 
        className={`p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-surface-100 ${dueStatus === 'overdue' ? 'border-l-4 border-l-red-500' : ''}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h4 className="text-sm font-bold text-surface-900 leading-snug tracking-tight">{task.title}</h4>
          <Badge className={`${PRIORITY_COLORS[task.priority]} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md`}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>
        </div>

        {task.description && (
          <p className="text-xs text-surface-500 line-clamp-2 mb-4 leading-relaxed font-medium">{task.description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap mb-5">
          {task.project?.title && (
            <span className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
              {task.project.title}
            </span>
          )}
          {task.dueDate && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight flex items-center gap-1 ${dueDateClasses[dueStatus]}`}>
              <Calendar className="w-3 h-3" />
              {format(task.dueDate)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-surface-50">
          <div className="flex items-center gap-2">
            {task.assignedTo && (
              <div className="flex items-center gap-2" title={task.assignedTo.name}>
                <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-sm">
                  {task.assignedTo.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-[11px] font-bold text-surface-600 truncate max-w-[80px]">{task.assignedTo.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {canEditTask(task) && (
              <button
                onClick={() => setEditTask(task)}
                className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-primary-600 transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {canDeleteTask && (
              <button
                onClick={() => setDeleteTarget(task)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 w-full">
        <div>
          <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight">Tasks</h2>
          <p className="text-surface-500 font-medium">Manage and track all team tasks in one place</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          {/* View Toggle */}
          <div className="flex items-center bg-surface-100 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-500 hover:text-surface-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-500 hover:text-surface-700'}`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>

          {canCreateTask && (
            <Button onClick={() => setShowCreateModal(true)} className="shadow-lg shadow-primary-500/20">
              <Plus className="w-5 h-5" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 w-full bg-white p-4 rounded-2xl border border-surface-100 shadow-sm">
        <div className="flex-1 min-w-0 max-w-xl">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title or description..."
            className="w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 bg-surface-50 border border-surface-200 rounded-xl text-sm font-semibold text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer min-w-[160px] transition-all"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-11 px-4 bg-surface-50 border border-surface-200 rounded-xl text-sm font-semibold text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer min-w-[160px] transition-all"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-32 bg-surface-200 rounded animate-pulse mb-6" />
              {Array.from({ length: 3 }).map((_, j) => (
                <SkeletonCard key={j} />
              ))}
            </div>
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
        <div className="flex gap-8 overflow-x-auto pb-8 w-full snap-x scrollbar-thin scrollbar-thumb-surface-200 scrollbar-track-transparent">
          {kanbanColumns.map((col) => {
            const columnTasks = getTasksByStatus(col.id);
            return (
              <div key={col.id} className="w-[340px] shrink-0 snap-start flex flex-col h-full">
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-surface-900 tracking-tight">{col.label}</h3>
                    <span className="flex items-center justify-center px-2.5 py-0.5 bg-surface-100 text-surface-600 text-xs font-bold rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className={`w-8 h-1 bg-surface-200 rounded-full ${col.color.replace('border', 'bg')}`} />
                </div>
                
                <div className="flex flex-col gap-4 min-h-[500px] p-2 bg-surface-50/50 rounded-2xl border border-surface-100/50">
                  {columnTasks.map(renderTaskCard)}
                  {columnTasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 border-2 border-dashed border-surface-200 rounded-xl">
                      <p className="text-xs font-medium text-surface-400">No tasks in {col.label}</p>
                    </div>
                  )}
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
