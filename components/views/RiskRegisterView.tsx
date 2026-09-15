'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MODULES_LIST } from '@/lib/modulesData';
import { identifyGapsForAssessment, exportGapsCSV } from '@/lib/scoring';
import { IdentifiedGap, GapSeverity } from '@/lib/types';
import {
  AlertTriangle,
  ShieldAlert,
  Download,
  Filter,
  ArrowUpDown,
  Plus,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';

export function RiskRegisterView() {
  const {
    language,
    t,
    activeCompany,
    assessments,
    evidence,
    actions,
    createAction,
    setActiveRoute,
    canMutate
  } = useApp();

  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'weight' | 'module'>('severity');
  const [selectedGapDetails, setSelectedGapDetails] = useState<IdentifiedGap | null>(null);

  // Compute all gaps dynamically across all assessments for the company
  const allGaps = useMemo(() => {
    const list: IdentifiedGap[] = [];
    const evidenceByControl = new Map<string, string[]>();
    for (const ev of evidence) {
      if (ev.controlId && ev.reviewStatus === 'approved') {
        const arr = evidenceByControl.get(ev.controlId) || [];
        arr.push(ev.id);
        evidenceByControl.set(ev.controlId, arr);
      }
    }

    for (const asmt of assessments) {
      const mod = MODULES_LIST.find((m) => m.id === asmt.moduleId);
      if (mod) {
        const modGaps = identifyGapsForAssessment(mod, asmt, evidenceByControl);
        list.push(...modGaps);
      }
    }
    return list;
  }, [assessments, evidence]);

  // Filtering
  const filteredGaps = useMemo(() => {
    return allGaps.filter((g) => {
      if (selectedModuleFilter !== 'all' && g.moduleId !== selectedModuleFilter) return false;
      if (selectedSeverityFilter !== 'all' && g.severity !== selectedSeverityFilter) return false;
      if (selectedTypeFilter !== 'all' && g.gapType !== selectedTypeFilter) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'severity') {
        const rank = { critical: 4, high: 3, medium: 2, low: 1 };
        return rank[b.severity] - rank[a.severity];
      }
      if (sortBy === 'weight') {
        return b.weight - a.weight;
      }
      return a.moduleId.localeCompare(b.moduleId);
    });
  }, [allGaps, selectedModuleFilter, selectedSeverityFilter, selectedTypeFilter, sortBy]);

  const severityCounts = {
    critical: allGaps.filter((g) => g.severity === 'critical').length,
    high: allGaps.filter((g) => g.severity === 'high').length,
    medium: allGaps.filter((g) => g.severity === 'medium').length,
    low: allGaps.filter((g) => g.severity === 'low').length
  };

  const handleCreateActionFromGap = (gap: IdentifiedGap) => {
    if (!canMutate) return;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (gap.severity === 'critical' ? 14 : gap.severity === 'high' ? 30 : 60));

    const actionId = createAction({
      companyId: activeCompany.id,
      moduleId: gap.moduleId,
      controlId: gap.controlId,
      questionId: gap.questionId,
      title: `Remediate ${gap.controlCode || gap.controlId}: ${gap.recommendation || gap.description}`,
      titleAr: `معالجة ${gap.controlCode || gap.controlId}: ${gap.recommendationAr || gap.descriptionAr || gap.description}`,
      description: gap.businessImpact || gap.description || 'Internal control deficiency remediation',
      priority: gap.severity === 'critical' ? 'critical' : gap.severity === 'high' ? 'high' : 'medium',
      status: 'todo',
      ownerName: 'Finance Manager',
      ownerRole: 'finance_manager',
      dueDate: dueDate.toISOString().split('T')[0],
      comments: [],
      evidenceIds: []
    });

    setActiveRoute('action_plan');
  };

  const handleExportCSV = () => {
    const csv = exportGapsCSV(filteredGaps);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ihkam_Risk_Gap_Register_${activeCompany.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredGaps, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ihkam_Risk_Gap_Register_${activeCompany.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Summary Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('riskRegister')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized inventory of internal control deficiencies, missing evidence, and non-compliance exposures.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>{t('exportCSV')}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
            <span>{t('exportJSON')}</span>
          </button>
        </div>
      </div>

      {/* Severity Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setSelectedSeverityFilter(selectedSeverityFilter === 'critical' ? 'all' : 'critical')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedSeverityFilter === 'critical'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">{t('critical')}</span>
          <div className="text-2xl font-extrabold text-rose-900 mt-1">{severityCounts.critical}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">High weight (3) + unaddressed (0-1)</p>
        </div>

        <div
          onClick={() => setSelectedSeverityFilter(selectedSeverityFilter === 'high' ? 'all' : 'high')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedSeverityFilter === 'high'
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">{t('high')}</span>
          <div className="text-2xl font-extrabold text-orange-900 mt-1">{severityCounts.high}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Deficiencies requiring 30-day action</p>
        </div>

        <div
          onClick={() => setSelectedSeverityFilter(selectedSeverityFilter === 'medium' ? 'all' : 'medium')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedSeverityFilter === 'medium'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">{t('medium')}</span>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">{severityCounts.medium}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Operational partial implementation</p>
        </div>

        <div
          onClick={() => setSelectedSeverityFilter(selectedSeverityFilter === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedSeverityFilter === 'low'
              ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">{t('low')}</span>
          <div className="text-2xl font-extrabold text-teal-900 mt-1">{severityCounts.low}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Minor documentation gaps</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Module Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedModuleFilter}
              onChange={(e) => setSelectedModuleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="all">{t('all')} Modules ({allGaps.length})</option>
              {MODULES_LIST.map((m) => (
                <option key={m.id} value={m.id}>
                  {language === 'ar' ? m.titleAr : m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Gap Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Gap Types</option>
            <option value="implementation">Implementation Gaps (Score &lt; 3)</option>
            <option value="evidence">Evidence Missing (Score ≥ 3 without doc)</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverityFilter}
            onChange={(e) => setSelectedSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">{t('sortBy')}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="severity">Severity Rank</option>
            <option value="weight">Control Weight</option>
            <option value="module">Module Name</option>
          </select>
        </div>
      </div>

      {/* Gaps Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredGaps.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No gaps found matching your current filter.</p>
            <p className="mt-1">All evaluated controls in this scope meet expected governance thresholds.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Code / Control</th>
                  <th className="py-3 px-3">Area</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-4">Deficiency & Business Impact</th>
                  <th className="py-3 px-4">Prescribed Recommendation</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGaps.map((gap) => {
                  const existingAction = actions.find(
                    (a) => a.controlId === gap.controlId || a.questionId === gap.questionId
                  );

                  return (
                    <tr key={gap.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-mono font-bold text-slate-900 block">{gap.controlCode}</span>
                        <span className="text-[11px] text-slate-500 font-medium">Weight: {gap.weight}</span>
                        {gap.gapType === 'evidence' && (
                          <span className="inline-block mt-1 px-1.5 py-0.2 rounded-sm text-[10px] bg-amber-100 text-amber-900 font-semibold">
                            Missing Doc
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 align-top">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium truncate inline-block max-w-[120px]">
                          {gap.moduleTitle}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 align-top">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          gap.severity === 'critical'
                            ? 'bg-rose-100 text-rose-900'
                            : gap.severity === 'high'
                            ? 'bg-orange-100 text-orange-900'
                            : gap.severity === 'medium'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-teal-100 text-teal-900'
                        }`}>
                          {t(gap.severity as any)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-sm">
                        <p className="font-semibold text-slate-900 mb-0.5">
                          {language === 'ar' ? gap.titleAr : gap.title}
                        </p>
                        <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                          {language === 'ar' ? gap.businessImpactAr : gap.businessImpact}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <p className="text-slate-700 text-[11px] leading-relaxed line-clamp-2">
                          {language === 'ar' ? gap.recommendationAr : gap.recommendation}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 align-top text-center">
                        {existingAction ? (
                          <button
                            onClick={() => setActiveRoute('action_plan')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>In Action Plan</span>
                          </button>
                        ) : (
                          <button
                            disabled={!canMutate}
                            onClick={() => handleCreateActionFromGap(gap)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{t('createAction')}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
