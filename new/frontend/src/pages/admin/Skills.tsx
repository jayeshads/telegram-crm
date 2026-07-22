import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { BookOpen, Upload, FileText, CheckCircle2 } from 'lucide-react';

export const AdminSkills: React.FC = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const data: any = await apiRequest('/admin/skills');
      setSkills(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('lp_access_token');
      const res = await fetch('/api/admin/skills/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      setMessage(`Skill file ${selectedFile.name} uploaded successfully!`);
      setSelectedFile(null);
      loadSkills();
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">AI Knowledge Manager</h1>
        <p className="text-sm text-slate-400">Manage agent skills (.md files) loaded dynamically into multi-agent prompts</p>
      </div>

      {/* Upload Skill File Section */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-400" /> Upload New Skill File (.md)
        </h2>

        {message && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="flex items-center gap-3">
          <input
            type="file"
            accept=".md"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-white hover:file:bg-slate-700"
          />
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Skill'}
          </button>
        </form>
      </div>

      {/* Loaded Skills List */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" /> Active AI Agent Skills
        </h2>

        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading skill files...</div>
        ) : skills.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No skill files loaded. Upload a `.md` file to add knowledge.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white text-sm">{skill.filename}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-3 bg-slate-950 p-2 rounded border border-slate-800/50 font-mono">
                  {skill.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
