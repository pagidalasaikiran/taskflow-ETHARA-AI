import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckSquare,
  FolderKanban,
  Clock,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useTaskStore from '../../store/taskStore';
import useProjectStore from '../../store/projectStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '../../constants';
import { format, formatFull, getDueDateStatus } from '../../utils/dateUtils';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore();
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjectStore();

  useEffect(() => {
    fetchTasks({ limit: 100 });
    fetchProjects({ limit: 100 });
  }, []);

  const myTasks = tasks.filter(
    (t) => t.assignedTo?._id === user?._id || t.assignedTo === user?._id
  );
  const isLoading = tasksLoading || projectsLoading;

  return (
    <div className="space-y-8 w-full">
      {/* User Info Card */}
      <Card className="p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-200 shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 w-full">
            <h1 className="text-2xl font-bold text-surface-800 mb-3 sm:mb-1">{user?.name}</h1>
            <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-center justify-center sm:justify-start gap-3 sm:gap-4 text-sm text-surface-500">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <Badge className={user?.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-600'}>
                  {user?.role}
                </Badge>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Joined {formatFull(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Tasks', value: myTasks.length, icon: CheckSquare, color: 'text-primary-600 bg-primary-100' },
          { label: 'Completed', value: myTasks.filter((t) => t.status === 'completed').length, icon: CheckSquare, color: 'text-emerald-600 bg-emerald-100' },
          { label: 'In Progress', value: myTasks.filter((t) => t.status === 'in-progress').length, icon: Clock, color: 'text-amber-600 bg-amber-100' },
          { label: 'Projects', value: projects.length, icon: FolderKanban, color: 'text-blue-600 bg-blue-100' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <Card key={i} className="p-4 text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-surface-800">{value}</p>
            <p className="text-xs text-surface-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Recent Tasks */}
      <div>
        <h3 className="text-lg font-semibold text-surface-800 mb-4">My Recent Tasks</h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : myTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-surface-400">No tasks assigned to you yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {myTasks.slice(0, 10).map((task) => {
              const dueStatus = getDueDateStatus(task.dueDate, task.status);
              return (
                <Card key={task._id} className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-surface-800 truncate">{task.title}</span>
                      <Badge className={PRIORITY_COLORS[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-surface-400">
                      <span>{task.project?.title}</span>
                      {task.dueDate && (
                        <span className={dueStatus === 'overdue' ? 'text-red-500' : dueStatus === 'today' ? 'text-amber-500' : ''}>
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
    </div>
  );
}
