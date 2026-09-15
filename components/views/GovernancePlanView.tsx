'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MODULES_LIST } from '@/lib/modulesData';
import {
  calculateOverallGovernanceScore,
  calculateAssessmentCoverage,
  getMaturityLevel,
  getMaturityColorClass
} from '@/lib/scoring';
import {
  FileSpreadsheet,
  Printer,
  BookmarkPlus,
  History,
  Shield,
  CheckCircle2,
  Calendar,
  Building,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Award
} from 'lucide-react';

export function GovernancePlanView() {
  const {
    language,
    t,
    activeCompany,
    assessments,
    actions,
    plans,
    savePlanSnapshot,
    methodologyConfig,
    setActiveRoute,
    canMutate
  } = useApp();

  const [selectedPlanVersion, setSelectedPlanVersion] = useState<number | null>(null);

  const overallScore = calculateOverallGovernanceScore(
    MODULES_LIST,
    assessments,
    methodologyConfig.moduleWeights
  );
  const coverage = calculateAssessmentCoverage(MODULES_LIST, assessments);
  const maturity = getMaturityLevel(overallScore, methodologyConfig.maturityThresholds);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleSaveSnapshot = () => {
    if (!canMutate) return;
    const nextVer = plans.length + 1;
    savePlanSnapshot({
      companyId: activeCompany.id,
      version: nextVer,
      overallScore: overallScore ?? 0,
      maturityLevel: maturity.level,
      roadmap30: [
        'Formalize and enforce financial delegation matrix with dual bank thresholds',
        'Issue employee expense receipting policy with mandatory 30-day submission',
        'Verify ZATCA phase 2 e-invoicing cryptographic stamps and XML logs'
      ],
      roadmap60: [
        'Enforce 3-quote vendor selection for purchases over 20,000 SAR',
        'Deploy monthly blind cycle counts for warehouse high-value SKUs',
        'Institute structured 10-day month-end financial closing checklist'
      ],
      roadmap90: [
        'Automate 13-week rolling cash flow liquidity forecasting model',
        'Complete barcode tagging and fixed asset register verification',
        'Conduct semi-annual internal controls audit and board reporting'
      ],
      executiveSummary: `Financial governance assessment conducted for ${activeCompany.name}. Overall maturity is categorized at Level ${maturity.level} (${maturity.label}), achieving a weighted governance index of ${overallScore ?? 0}%. Key near-term remediations target expense authorizations and inventory integrity.`
    });
  };

  const activeSnapshot = selectedPlanVersion
    ? plans.find((p) => p.version === selectedPlanVersion)
    : plans[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('governancePlan')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official boardroom governance roadmap and operational compliance report.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {plans.length > 0 && (
            <select
              value={selectedPlanVersion || plans[0]?.version}
              onChange={(e) => setSelectedPlanVersion(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.version}>
                  Version {p.version} ({p.generatedAt.split('T')[0]})
                </option>
              ))}
            </select>
          )}

          {canMutate && (
            <button
              onClick={handleSaveSnapshot}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-teal-700" />
              <span>{t('saveNewVersion')}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('printPlan')}</span>
          </button>
        </div>
      </div>

      {/* THE PRINTABLE GOVERNANCE PLAN DOCUMENT */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none space-y-8 text-slate-900">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#102D32] flex items-center justify-center text-white shrink-0">
              <Shield className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {language === 'ar' ? 'تقرير الحوكمة المالية المؤسسية' : 'Corporate Financial Governance Plan'}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {language === 'ar' ? activeCompany.nameAr : activeCompany.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Sector: {activeCompany.industry.replace('_', ' ')} • Currency: {activeCompany.currency} • ERP: {activeCompany.erpSystem.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="text-left rtl:text-right text-xs text-slate-500 space-y-0.5">
            <p>Report Date: <strong>{new Date().toLocaleDateString()}</strong></p>
            <p>Framework: <strong>Ihkam Governance Standard v1.0</strong></p>
            <p>Classification: <strong>Confidential - Board & CFO Advisory</strong></p>
          </div>
        </div>

        {/* Executive Summary & Score Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-700" />
              <span>Executive Governance Summary</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed text-justify">
              This financial governance evaluation measures operational compliance, segregation of duties, and internal control effectiveness across 10 critical accounting cycles. Current provisional maturity indicates an established baseline with acute remediation requirements in expenditure dual-authorization and inventory reconciliation.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <span>Assessment Scope Coverage:</span>
              <strong className="text-teal-900">{coverage.percentage}% Completed ({coverage.completedCount}/10 Modules)</strong>
            </div>
          </div>

          {/* Maturity Score Tile */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between items-center text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">Composite Governance Score</span>
            <div className="text-4xl font-black text-slate-900 my-2">
              {overallScore !== null ? `${overallScore}%` : '—'}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${getMaturityColorClass(maturity.level)}`}>
              {language === 'ar' ? maturity.labelAr : maturity.label} (Level {maturity.level})
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Target for 90-day cycle: <strong>Level 3 (Established &gt; 65%)</strong>
            </p>
          </div>
        </div>

        {/* Phased Roadmap Grid (30 / 60 / 90 Days) */}
        <div className="space-y-6 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-700" />
            <span>Phased Remediation & Implementation Roadmap</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Phase 1: 30 Days */}
            <div className="border border-rose-200 bg-rose-50/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  {t('roadmap30')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  Critical
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>Formalize financial authority matrix with dual bank sign-off above 50,000 SAR.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>Issue comprehensive employee expense policy and 30-day receipt submission rule.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>Verify ZATCA phase 2 cryptographic stamp integration &amp; monthly VAT reconciliation.</span>
                </li>
              </ul>
            </div>

            {/* Phase 2: 60 Days */}
            <div className="border border-amber-200 bg-amber-50/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  {t('roadmap60')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Midterm
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>Implement 3-quote tender policy for procurements exceeding 20,000 SAR.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>Institute blind cycle counting program conducted by independent accounting personnel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>Formalize structured month-end financial closing checklist to achieve 10-day sign-off.</span>
                </li>
              </ul>
            </div>

            {/* Phase 3: 90 Days */}
            <div className="border border-teal-200 bg-teal-50/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                  {t('roadmap90')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  Assurance
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                  <span>Build rolling 13-week cash flow model to monitor payroll &amp; capital commitments.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                  <span>Complete barcode tagging and fixed asset register verification for all equipment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                  <span>Institute semi-annual internal control re-testing for executive leadership.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modules Score Breakdown Table */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Module-by-Module Governance Assessment Status
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Module Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Controls Count</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3">Maturity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MODULES_LIST.map((m) => {
                  const asmt = assessments.find((a) => a.moduleId === m.id);
                  const score = asmt?.score ?? null;
                  return (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{m.title}</td>
                      <td className="py-2.5 px-3 text-slate-500">{m.category}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700">{m.questions.length}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                        {score !== null ? `${score}%` : 'Not Assessed'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          score !== null
                            ? (score >= 70 ? 'bg-teal-100 text-teal-800' : score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {score !== null ? (score >= 70 ? 'Established' : score >= 50 ? 'Developing' : 'Basic') : 'Pending Scope'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Footer Sign-off */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900">Prepared By:</p>
            <p className="mt-1">Ihkam Financial Advisory Platform</p>
            <p className="text-slate-400 text-[11px]">Certified Financial Governance Framework</p>
          </div>
          <div className="text-right rtl:text-left">
            <p className="font-bold text-slate-900">Authorized Officer / CFO Sign-off:</p>
            <div className="mt-4 border-b border-slate-300 w-48 inline-block" />
            <p className="text-slate-400 text-[11px] mt-1">Signature &amp; Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
