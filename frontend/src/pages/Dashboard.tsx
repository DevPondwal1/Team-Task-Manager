import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Clock, LayoutDashboard, Loader2 } from 'lucide-react';
import api from '../api/axios';

interface DashboardStats {
  totalTasks: number;
  statusCounts: { TODO: number; IN_PROGRESS: number; DONE: number };
  overdueTasks: number;
  myPendingTasks: number;
  recentActivity: Array<{
    id: string;
    title: string;
    updatedAt: string;
    project: { name: string };
    assignee?: { name: string };
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold mb-8 text-white">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-muted font-medium">Total Tasks</span>
            <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <LayoutDashboard size={20} />
            </div>
          </div>
          <span className="text-3xl font-bold text-white">{stats.totalTasks}</span>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between card-hover border-warning/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-muted font-medium">My Pending</span>
            <div className="w-10 h-10 rounded-lg bg-warning/20 text-warning flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <span className="text-3xl font-bold text-white">{stats.myPendingTasks}</span>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between card-hover border-success/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-muted font-medium">Tasks Completed</span>
            <div className="w-10 h-10 rounded-lg bg-success/20 text-success flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="text-3xl font-bold text-white">{stats.statusCounts.DONE}</span>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between card-hover border-error/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-muted font-medium">Overdue</span>
            <div className="w-10 h-10 rounded-lg bg-error/20 text-error flex items-center justify-center">
              <Activity size={20} />
            </div>
          </div>
          <span className="text-3xl font-bold text-white">{stats.overdueTasks}</span>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-6 font-display flex items-center gap-2">
          <Activity size={20} className="text-primary" />
          Recent Activity
        </h2>
        
        {stats.recentActivity.length === 0 ? (
          <p className="text-text-muted text-center py-4">No recent activity found.</p>
        ) : (
          <div className="space-y-4">
            {stats.recentActivity.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-surfaceHighlight/50 border border-surfaceHighlight/50">
                <div>
                  <h3 className="font-medium text-white">{task.title}</h3>
                  <p className="text-sm text-text-muted mt-1">
                    in {task.project.name} • Assigned to {task.assignee?.name || 'Unassigned'}
                  </p>
                </div>
                <div className="text-sm text-text-muted">
                  {new Date(task.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
