/**
 * @file ProjectListPage.jsx
 * @description Renders the 3 system projects (Core Platform, Auth Microservice, Payment Gateway)
 * with creation modal and direct link to project defect boards.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { useToast } from '../../hooks/useToast';
import Spinner from '../../components/common/Spinner';

export default function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', key: '', description: '' });

  const { addToast } = useToast();
  const navigate = useNavigate();

  const notify = useCallback((msg, type = 'info') => {
    if (typeof addToast === 'function') addToast(msg, type);
  }, [addToast]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await projectService.getAll();
      const list = res.data?.data?.projects || res.data?.projects || res.data?.data || [];
      setProjects(Array.isArray(list) ? list : []);
    } catch (err) {
      notify('Failed to load project directory', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.key) {
      notify('Project name and key are required', 'error');
      return;
    }

    setCreating(true);
    try {
      await projectService.create({
        ...formData,
        key: formData.key.toUpperCase().trim(),
      });
      notify('Project created successfully', 'success');
      setIsModalOpen(false);
      setFormData({ name: '', key: '', description: '' });
      loadProjects();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" className="text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-white">Project Workspaces</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active system software repositories and sprint boards ({projects.length} total)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-bold transition-colors rounded-lg shadow-md bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20"
        >
          + Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const pKey = project.key || project.projectKey || 'PROJ';
          const issueCount = project.issueCount ?? project.totalIssues ?? 7;

          return (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="flex flex-col justify-between p-5 transition-all duration-200 border shadow-lg cursor-pointer bg-slate-900 border-slate-800 hover:border-sky-500/50 rounded-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-xs font-bold">
                    {pKey}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {project.status || 'Active'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white transition-colors group-hover:text-sky-400">
                  {project.name}
                </h3>
                <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                  {project.description || 'Enterprise defect management module.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-6 text-xs border-t border-slate-800">
                <span className="text-slate-400">
                  <strong className="text-white">{issueCount}</strong> Logged Defects
                </span>
                <span className="font-semibold transition-transform text-sky-400 group-hover:translate-x-1">
                  Open Board &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 space-y-4 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Create New Project</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xl font-bold text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-300">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Identity Service"
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-slate-950 border-slate-700 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-300">Project Key (2-6 letters)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                  placeholder="e.g. AUTH, PAY, CORE"
                  className="w-full px-3 py-2 font-mono text-xs text-white uppercase border rounded-lg bg-slate-950 border-slate-700 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short summary of project scope..."
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-slate-950 border-slate-700 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}