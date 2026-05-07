import { useEffect, useState } from 'react';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  CalendarClock,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import useTaskStore from '../../store/taskStore';
import useProjectStore from '../../store/projectStore';
import { activityService } from '../../services/activityService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonStats, SkeletonChart, SkeletonTable } from '../../components/ui/Skeleton';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from '../../constants';
import { formatDistanceToNow, format, isAfter, isBefore, isToday } from '../../utils/dateUtils';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981'];
const PRIORITY_CHART_COLORS = ['#3b82f6', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { stats, upcomingDeadlines, recentTasks, fetchStats } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchProjects({ limit: 100 }),
        activityService.getRecent(10).then((res) => setActivities(res.data.data.activities)).catch(() => {}),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStats key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonTable rows={5} />
          <SkeletonTable rows={5} />
        </div>
      </div>
    );
  }

  const statusData = [
    { name: 'To Do', value: stats.todoTasks },
    { name: 'In Progress', value: stats.inProgressTasks },
    { name: 'Completed', value: stats.completedTasks },
  ];

  const priorityData = [
    { name: 'Low', value: stats.priorities.low },
    { name: 'Medium', value: stats.priorities.medium },
    { name: 'High', value: stats.priorities.high },
  ];

  const statCards = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: FolderKanban,
      color: 'bg-primary-50 text-primary-600',
      iconBg: 'bg-primary-100',
    },
    {
      label: 'Total Tasks',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Completed',
      value: stats.completedTasks,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100',
      sub: `${stats.completedThisWeek} this week`,
    },
    {
      label: 'Overdue',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      iconBg: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ label, value, icon: Icon, color, iconBg, sub }, i) => (
          <Card key={i} className="p-6 min-h-[120px] flex flex-col justify-center border-surface-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-500 mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-surface-900 tracking-tight">{value}</p>
                  {sub && <span className="text-xs text-emerald-600 font-medium">{sub}</span>}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg} shadow-sm`}>
                <Icon className={`w-6 h-6 ${color.split(' ')[1]}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 flex flex-col h-full">
          <h3 className="text-base font-bold text-surface-900 mb-8 tracking-tight">Task Distribution</h3>
          {stats.totalTasks > 0 ? (
            <div className="relative w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-surface-400">No data available</div>
          )}
          
          <div className="flex justify-center flex-wrap gap-6 mt-8">
            {statusData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-surface-600 font-medium">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                {entry.name}: {entry.value}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 flex flex-col h-full">
          <h3 className="text-base font-bold text-surface-900 mb-8 tracking-tight">Priority Breakdown</h3>
          {stats.totalTasks > 0 ? (
            <div className="relative w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 13, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 13, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                    {priorityData.map((_, i) => (
                      <Cell key={i} fill={PRIORITY_CHART_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-surface-400">No data available</div>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Recent Activity</h3>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 8).map((activity) => (
                <div key={activity._id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-primary-700">
                    {activity.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-surface-700 truncate">{activity.details}</p>
                    <p className="text-xs text-surface-400">{formatDistanceToNow(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 text-center py-8">No recent activity</p>
          )}
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4 h-4 text-surface-500" />
            <h3 className="text-sm font-semibold text-surface-700">Upcoming Deadlines</h3>
          </div>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-surface-700 truncate">{task.title}</p>
                    <p className="text-xs text-surface-400">{task.project?.title}</p>
                  </div>
                  <Badge className={getDueDateColor(task.dueDate)}>
                    {format(task.dueDate)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 text-center py-8">No upcoming deadlines</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function getDueDateColor(dueDate) {
  if (!dueDate) return 'bg-surface-100 text-surface-600';
  const due = new Date(dueDate);
  const now = new Date();
  if (isBefore(due, now)) return 'bg-red-100 text-red-700';
  if (isToday(due)) return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}
