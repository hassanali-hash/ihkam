'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  CheckCircle2,
  FileText,
  ShieldCheck,
  BookmarkPlus
} from 'lucide-react';

export function ActivityLogView() {
  const { language, t, auditLogs } = useApp();

  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== 'all' && !log.action.toLowerCase().includes(filterAction)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const actor = (log.actorName || log.userName || '').toLowerCase();
      if (!log.action.toLowerCase().includes(q) && !log.details.toLowerCase().includes(q) && !actor.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('activityLog')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable chronological audit trail capturing user actions, evidence uploads, scoring mutations, and control reviews.
          </p>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total recorded events: <strong>{auditLogs.length}</strong>
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity by actor, action or detail..."
            className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 w-full sm:w-auto"
          >
            <option value="all">All Event Types</option>
            <option value="assessment">Assessments</option>
            <option value="evidence">Evidence</option>
            <option value="action">Action Plan</option>
            <option value="test">Control Testing</option>
            <option value="plan">Governance Plan</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No activity events found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-medium text-slate-600">
                        {log.actorName || log.userName || 'System'}
                      </span>
                      {log.userRole && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 capitalize">
                          {log.userRole.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 text-[11px] whitespace-nowrap text-right rtl:text-left shrink-0">
                  <div className="flex items-center gap-1 justify-end rtl:justify-start">
                    <Clock className="w-3 h-3" />
                    <span>{log.timestamp.split('T')[0]}</span>
                  </div>
                  <span className="text-[10px] font-mono">{log.timestamp.split('T')[1]?.slice(0, 5)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
