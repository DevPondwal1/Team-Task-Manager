import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, LayoutList, Loader2 } from 'lucide-react';
import api from '../api/axios';

interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  _count: { members: number; tasks: number };
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name: newProjectName, description: newProjectDesc });
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Projects</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-surfaceHighlight rounded-full flex items-center justify-center mb-4">
            <LayoutList size={32} className="text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No projects yet</h2>
          <p className="text-text-muted mb-6">Create your first project to get started.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="block">
              <div className="glass-panel p-6 card-hover h-full flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                <p className="text-text-muted text-sm flex-1 mb-6 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
                <div className="flex items-center gap-4 text-sm text-text-muted pt-4 border-t border-surfaceHighlight">
                  <div className="flex items-center gap-1.5">
                    <LayoutList size={16} />
                    <span>{project._count.tasks} Tasks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={16} />
                    <span>{project._count.members} Members</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-surfaceHighlight rounded-xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="input-field"
                    placeholder="E.g. Website Redesign"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Description (Optional)</label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="input-field min-h-[100px] resize-y"
                    placeholder="Briefly describe this project..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Create
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
