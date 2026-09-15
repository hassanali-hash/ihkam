'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Mail,
  Building,
  Check,
  Info
} from 'lucide-react';

export function TeamView() {
  const { language, t, users, activeUser, addUser, isAdmin, activeRole, setActiveRole } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('finance_manager');
  const [title, setTitle] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !isAdmin) return;

    addUser({
      name,
      email,
      role,
      title: title || 'Finance Specialist',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`
    });

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setTitle('');
  };

  const roleDescriptions: Record<UserRole, { titleEn: string; titleAr: string; desc: string; permissions: string[] }> = {
    admin: {
      titleEn: 'Company Admin',
      titleAr: 'مدير المنشأة',
      desc: 'Full administrative access across settings, team provisioning, and company profile.',
      permissions: ['Manage Users', 'Edit Company Profile', 'Run Assessments', 'Approve Actions', 'Reset Data']
    },
    finance_manager: {
      titleEn: 'Finance Manager',
      titleAr: 'مدير الحسابات والمالية',
      desc: 'Operational financial control lead. Runs assessments, uploads evidence, executes corrective actions.',
      permissions: ['Run Assessments', 'Upload Evidence', 'Create Actions', 'Add Comments', 'Request Advisory']
    },
    reviewer: {
      titleEn: 'Financial Reviewer',
      titleAr: 'المراجع والخبير المالي',
      desc: 'Independent assurance expert. Approves evidence, executes sample tests, configures methodology.',
      permissions: ['Review Evidence', 'Run Control Tests', 'Approve Actions', 'Adjust Methodology Weights']
    },
    viewer: {
      titleEn: 'Viewer (Read-only)',
      titleAr: 'مراقب (اطلاع فقط)',
      desc: 'Executive stakeholder or auditor with inspect-only visibility to dashboards and plans.',
      permissions: ['View Dashboard', 'Inspect Risk Register', 'Read Governance Plan', 'Export Reports']
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('team')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Role-Based Access Control (RBAC) governance framework and team permissions.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* Role Matrix Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['admin', 'finance_manager', 'reviewer', 'viewer'] as UserRole[]).map((r) => {
          const item = roleDescriptions[r];
          const isCurrentDemoRole = activeRole === r;

          return (
            <div
              key={r}
              className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrentDemoRole
                  ? 'border-teal-700 ring-2 ring-teal-700/20 shadow-xs'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900">
                    {language === 'ar' ? item.titleAr : item.titleEn}
                  </span>
                  {isCurrentDemoRole && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900">
                      Active Role
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  {item.desc}
                </p>

                <div className="space-y-1 text-[11px] text-slate-600 mb-4">
                  {item.permissions.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveRole(r)}
                className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isCurrentDemoRole
                    ? 'bg-teal-50 text-teal-900 cursor-default'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {isCurrentDemoRole ? 'Selected' : 'Simulate This Role'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Assigned Team Members ({users.length})</h2>
          <span className="text-xs text-slate-400">Scoped to local workspace</span>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((user) => (
            <div key={user.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-900 font-bold flex items-center justify-center text-sm">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{user.name}</span>
                    {user.id === activeUser.id && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-amber-100 text-amber-900 font-semibold">
                        Logged in
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px]">{user.title} • {user.email}</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                user.role === 'admin'
                  ? 'bg-slate-900 text-white'
                  : user.role === 'reviewer'
                  ? 'bg-amber-100 text-amber-900'
                  : user.role === 'finance_manager'
                  ? 'bg-teal-100 text-teal-900'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="bg-[#102D32] text-white p-5">
              <h2 className="text-base font-bold text-white">Invite Team Member</h2>
              <p className="text-xs text-teal-200 mt-0.5">Add an internal or external collaborator</p>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Khalid Al-Harbi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. khalid@company.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Internal Auditor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="finance_manager">Finance Manager</option>
                  <option value="reviewer">Financial Reviewer</option>
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="admin">Company Admin</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 text-white rounded-lg font-bold hover:bg-teal-800"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
