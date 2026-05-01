import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, User, MoreHorizontal, Loader2, Edit2, Trash2 } from 'lucide-react';
import api from '../api/axios';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  assignee: { name: string; email: string } | null;
}

interface Project {
  id: string;
  name: string;
  owner: { name: string; email: string };
  members: Array<{ user: { name: string; email: string; id: string } }>;
}

export default function ProjectBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`)
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (error) {
      console.error('Failed to fetch project data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const handleCreateOrEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.patch(`/projects/${projectId}/tasks/${editingTask.id}`, {
          title: newTaskTitle,
          description: newTaskDesc,
          priority: newTaskPriority
        });
      } else {
        await api.post(`/projects/${projectId}/tasks`, {
          title: newTaskTitle,
          description: newTaskDesc,
          priority: newTaskPriority,
          status: 'TODO'
        });
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority('MEDIUM');
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Failed to save task', error);
    }
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDesc(task.description || '');
    setNewTaskPriority(task.priority);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const prevTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      setTasks(prevTasks);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'border-slate-500/30 bg-slate-500/10 text-slate-400' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-primary/30 bg-primary/10 text-primary-light' },
    { id: 'DONE', title: 'Done', color: 'border-success/30 bg-success/10 text-success' }
  ];

  const priorityColors = {
    LOW: 'text-success bg-success/10 border-success/20',
    MEDIUM: 'text-warning bg-warning/10 border-warning/20',
    HIGH: 'text-error bg-error/10 border-error/20',
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/projects" className="text-text-muted hover:text-white flex items-center gap-2 mb-2 text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Projects
          </Link>
          <h1 className="text-3xl font-display font-bold text-white">{project.name}</h1>
        </div>
        <button onClick={() => { setEditingTask(null); setNewTaskTitle(''); setNewTaskDesc(''); setIsTaskModalOpen(true); }} className="btn-primary">
          <Plus size={18} />
          Add Task
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex-1 min-w-[320px] max-w-[400px] flex flex-col bg-surface/30 border border-surfaceHighlight rounded-xl overflow-hidden">
              <div className={`p-4 border-b ${col.color.split(' ')[0]} flex justify-between items-center bg-surface/50`}>
                <h3 className={`font-bold font-display ${col.color.split(' ')[2]}`}>{col.title}</h3>
                <span className="text-xs font-medium bg-surfaceHighlight px-2 py-1 rounded-full text-text-muted">
                  {colTasks.length}
                </span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-4 min-h-[200px]">
                {colTasks.map(task => (
                  <div key={task.id} className="glass-panel p-4 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <div className="relative group/menu">
                        <button className="text-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={16} />
                        </button>
                        <div className="absolute right-0 mt-1 w-40 bg-surface border border-surfaceHighlight rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 py-1">
                          {columns.map(c => c.id !== task.status && (
                            <button 
                              key={c.id} 
                              onClick={() => handleStatusChange(task.id, c.id)}
                              className="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-surfaceHighlight hover:text-white transition-colors"
                            >
                              Move to {c.title}
                            </button>
                          ))}
                          <div className="border-t border-surfaceHighlight my-1"></div>
                          <button 
                            onClick={() => openEditTaskModal(task)}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:bg-surfaceHighlight hover:text-white transition-colors"
                          >
                            <Edit2 size={14} /> Edit Task
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                          >
                            <Trash2 size={14} /> Delete Task
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-white text-sm mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-text-muted mb-4 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-surfaceHighlight/50">
                      <div className="flex items-center text-xs text-text-muted gap-1">
                        <Calendar size={12} />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                      <div className="flex items-center text-xs text-text-muted gap-1" title={task.assignee?.name || 'Unassigned'}>
                        {task.assignee ? (
                          <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-surfaceHighlight flex items-center justify-center">
                            <User size={10} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-surfaceHighlight rounded-lg text-text-muted text-sm">
                    No tasks yet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-surfaceHighlight rounded-xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
              <form onSubmit={handleCreateOrEditTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="input-field"
                    placeholder="E.g. Update user authentication"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Description</label>
                  <textarea
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="input-field min-h-[80px] resize-y"
                    placeholder="Task details..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Priority</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="input-field appearance-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
