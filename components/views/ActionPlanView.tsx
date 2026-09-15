'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MODULES_LIST } from '@/lib/modulesData';
import { CorrectiveAction, ActionStatus, ActionPriority } from '@/lib/types';
import {
  CheckSquare,
  Plus,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Trash2,
  Download,
  ChevronRight,
  ShieldAlert,
  Send
} from 'lucide-react';

export function ActionPlanView() {
  const {
    language,
    t,
    activeCompany,
    activeUser,
    actions,
    createAction,
    updateAction,
    deleteAction,
    canMutate,
    isReviewer
  } = useApp();

  const [statusTab, setStatusTab] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [activeCommentActionId, setActiveCommentActionId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');

  // New action form state
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newModule, setNewModule] = useState('expense_management');
  const [newPriority, setNewPriority] = useState<ActionPriority>('high');
  const [newOwner, setNewOwner] = useState('Sarah Al-Otaibi');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const filteredActions = actions.filter((a) => {
    if (statusTab !== 'all' && a.status !== statusTab) return false;
    if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;
    if (moduleFilter !== 'all' && a.moduleId !== moduleFilter) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !canMutate) return;

    createAction({
      companyId: activeCompany.id,
      moduleId: newModule,
      title: newTitle,
      titleAr: newTitleAr || newTitle,
      description: newDesc,
      priority: newPriority,
      status: 'todo',
      ownerName: newOwner,
      ownerRole: 'finance_manager',
      dueDate: newDueDate,
      comments: [],
      evidenceIds: []
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewTitleAr('');
    setNewDesc('');
  };

  const handleStatusTransition = (action: CorrectiveAction, newStatus: ActionStatus) => {
    if (!canMutate) return;
    updateAction(action.id, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
    });
  };

  const handleAddComment = (actionId: string) => {
    if (!commentInput.trim()) return;
    const action = actions.find((a) => a.id === actionId);
    if (!action) return;

    const newComment = {
      id: `comm-${Date.now()}`,
      authorName: activeUser.name,
      authorRole: activeUser.role,
      text: commentInput.trim(),
      createdAt: new Date().toISOString()
    };

    updateAction(actionId, {
      comments: [...(action.comments || []), newComment]
    });

    setCommentInput('');
    setActiveCommentActionId(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Module', 'Priority', 'Status', 'Owner', 'Due Date', 'Created Date'];
    const rows = filteredActions.map((a) => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      a.moduleId,
      a.priority,
      a.status,
      `"${a.ownerName}"`,
      a.dueDate,
      a.createdAt.split('T')[0]
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ihkam_Action_Plan_${activeCompany.name.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('actionPlan')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track remediation tasks, assigned owners, execution deadlines, and reviewer verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>{t('exportCSV')}</span>
          </button>

          {canMutate && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('createAction')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: t('all'), count: actions.length },
            { id: 'todo', label: t('todo'), count: actions.filter((a) => a.status === 'todo').length },
            { id: 'in_progress', label: t('inProgress'), count: actions.filter((a) => a.status === 'in_progress').length },
            { id: 'awaiting_review', label: t('awaitingReview'), count: actions.filter((a) => a.status === 'awaiting_review').length },
            { id: 'completed', label: t('completed'), count: actions.filter((a) => a.status === 'completed').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                statusTab === tab.id
                  ? 'bg-teal-700 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusTab === tab.id ? 'bg-teal-900 text-teal-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Priority & Module Filters */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="all">All Modules</option>
            {MODULES_LIST.map((m) => (
              <option key={m.id} value={m.id}>{language === 'ar' ? m.nameAr : m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No actions found for this view.</p>
            <p className="mt-0.5">All tasks are currently completed or filtered out.</p>
          </div>
        ) : (
          filteredActions.map((action) => {
            const isOverdue = action.status !== 'completed' && new Date(action.dueDate) < new Date();

            return (
              <div
                key={action.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      action.priority === 'critical'
                        ? 'bg-rose-100 text-rose-900'
                        : action.priority === 'high'
                        ? 'bg-orange-100 text-orange-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {action.priority} Priority
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {action.moduleId}
                    </span>

                    {isOverdue && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Overdue</span>
                      </span>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-bold capitalize ${
                      action.status === 'completed'
                        ? 'text-emerald-700'
                        : action.status === 'awaiting_review'
                        ? 'text-amber-700'
                        : action.status === 'in_progress'
                        ? 'text-teal-700'
                        : 'text-slate-500'
                    }`}>
                      Status: {t(action.status as any)}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? action.titleAr || action.title : action.title}
                  </h3>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                {/* Metadata Row: Owner, Due Date, Comments */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned: <strong>{action.ownerName}</strong></span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: <strong>{action.dueDate}</strong></span>
                    </span>

                    <button
                      onClick={() => setActiveCommentActionId(activeCommentActionId === action.id ? null : action.id)}
                      className="flex items-center gap-1 text-teal-700 hover:underline font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{(action.comments || []).length} Comments</span>
                    </button>
                  </div>

                  {/* Workflow Transitions */}
                  {canMutate && (
                    <div className="flex items-center gap-2">
                      {action.status === 'todo' && (
                        <button
                          onClick={() => handleStatusTransition(action, 'in_progress')}
                          className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold"
                        >
                          Start Execution
                        </button>
                      )}

                      {action.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusTransition(action, 'awaiting_review')}
                          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold"
                        >
                          {t('markCompleted')}
                        </button>
                      )}

                      {action.status === 'awaiting_review' && isReviewer && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStatusTransition(action, 'completed')}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t('approveAction')}</span>
                          </button>
                          <button
                            onClick={() => handleStatusTransition(action, 'in_progress')}
                            className="px-2.5 py-1 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                          >
                            {t('reopenAction')}
                          </button>
                        </div>
                      )}

                      {action.status === 'completed' && isReviewer && (
                        <button
                          onClick={() => handleStatusTransition(action, 'in_progress')}
                          className="text-[11px] text-slate-500 hover:underline"
                        >
                          Reopen
                        </button>
                      )}

                      <button
                        onClick={() => deleteAction(action.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        title={t('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Comments Expandable Box */}
                {activeCommentActionId === action.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-xl space-y-2 text-xs">
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {(action.comments || []).length === 0 ? (
                        <p className="text-slate-400 text-xs italic">No comments yet.</p>
                      ) : (
                        (action.comments || []).map((c) => (
                          <div key={c.id} className="bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                              <span className="font-bold text-slate-800">
                                {c.authorName} {c.authorRole ? `(${c.authorRole})` : ''}
                              </span>
                              <span>{c.createdAt.split('T')[0]}</span>
                            </div>
                            <p className="text-slate-700">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* New comment input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Add progress note or audit reference..."
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(action.id);
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(action.id)}
                        className="p-1.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE ACTION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="bg-[#102D32] text-white p-5">
              <h2 className="text-base font-bold text-white">{t('createAction')}</h2>
              <p className="text-xs text-teal-200 mt-0.5">Assign remediation accountability and deadlines</p>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('actionTitle')} *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Formalize delegation authority matrix"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title (Arabic)</label>
                <input
                  type="text"
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder="مثال: اعتماد مصفوفة الصلاحيات المالية"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Financial Module</label>
                  <select
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {MODULES_LIST.map((m) => (
                      <option key={m.id} value={m.id}>{language === 'ar' ? m.nameAr : m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('priority')}</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ActionPriority)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('assignedTo')}</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('dueDate')}</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('actionDescription')}</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Outline step-by-step milestones or policy requirements..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 text-white rounded-lg font-bold hover:bg-teal-800"
                >
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
