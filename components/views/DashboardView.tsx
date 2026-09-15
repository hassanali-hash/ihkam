'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { MODULES_LIST } from '@/lib/modulesData';
import {
  calculateOverallGovernanceScore,
  calculateAssessmentCoverage,
  getMaturityLevel,
  getMaturityColorClass
} from '@/lib/scoring';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  FileSpreadsheet,
  Building,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export function DashboardView() {
  const {
    language,
    t,
    activeCompany,
    assessments,
    actions,
    evidence,
    setActiveRoute,
    methodologyConfig
  } = useApp();

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  // Compute live scores and metrics
  const overallScore = calculateOverallGovernanceScore(
    MODULES_LIST,
    assessments,
    methodologyConfig.moduleWeights
  );
  const coverage = calculateAssessmentCoverage(MODULES_LIST, assessments);
  const maturity = getMaturityLevel(overallScore, methodologyConfig.maturityThresholds);

  // Evidence coverage: controls with approved evidence
  const approvedEvidenceCount = evidence.filter((e) => e.reviewStatus === 'approved').length;
  const evidenceCoveragePct = Math.min(100, Math.round((approvedEvidenceCount / 20) * 100));

  // Critical & High open actions
  const openCriticalHighCount = actions.filter(
    (a) => a.status !== 'completed' && (a.priority === 'critical' || a.priority === 'high')
  ).length;

  const overdueActionsCount = actions.filter((a) => {
    if (a.status === 'completed') return false;
    return new Date(a.dueDate) < new Date();
  }).length;

  // Actions count by status
  const actionCounts = {
    todo: actions.filter((a) => a.status === 'todo').length,
    in_progress: actions.filter((a) => a.status === 'in_progress').length,
    awaiting_review: actions.filter((a) => a.status === 'awaiting_review').length,
    completed: actions.filter((a) => a.status === 'completed').length
  };

  // Find next module to assess
  const completedModuleIds = assessments
    .filter((a) => a.status === 'completed')
    .map((a) => a.moduleId);
  const draftAssessment = assessments.find((a) => a.status === 'draft');
  const nextModule = draftAssessment
    ? MODULES_LIST.find((m) => m.id === draftAssessment.moduleId)
    : MODULES_LIST.find((m) => !completedModuleIds.includes(m.id)) || MODULES_LIST[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Company Header Card */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#102D32] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Building className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                {language === 'ar' ? activeCompany.nameAr : activeCompany.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {activeCompany.industry.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>{activeCompany.employeeRange} staff</span>
              <span>•</span>
              <span>{activeCompany.branchCount} operating {activeCompany.branchCount === 1 ? 'branch' : 'branches'}</span>
              <span>•</span>
              <span className="font-medium text-teal-800">ERP: {activeCompany.erpSystem.toUpperCase()}</span>
              <span>•</span>
              <span>Currency: {activeCompany.currency}</span>
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => setActiveRoute('assessments', { moduleId: nextModule?.id })}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <span>{draftAssessment ? t('continueAssessment') : t('startAssessment')}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveRoute('governance_plan')}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-700" />
            <span>{t('viewGovernancePlan')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overall Score & Maturity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('governanceScore')}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${getMaturityColorClass(maturity.level)}`}>
              {language === 'ar' ? maturity.labelAr : maturity.label}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {overallScore !== null ? `${overallScore}%` : '—'}
            </span>
            <span className="text-xs text-slate-400">
              {language === 'ar' ? 'درجة معيارية' : 'Weighted score'}
            </span>
          </div>

          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                (overallScore ?? 0) >= 85 ? 'bg-teal-600' : (overallScore ?? 0) >= 65 ? 'bg-amber-500' : (overallScore ?? 0) >= 45 ? 'bg-orange-500' : 'bg-rose-500'
              }`}
              style={{ width: `${overallScore ?? 0}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            {language === 'ar'
              ? `المستوى ${maturity.level}: ${maturity.descriptionAr}`
              : `Band ${maturity.level}: ${maturity.description}`}
          </p>
        </div>

        {/* KPI 2: Assessment Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('assessmentCoverage')}
            </span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{coverage.percentage}%</span>
            <span className="text-xs text-slate-400">
              {coverage.completedCount} / {coverage.totalCount} {language === 'ar' ? 'مجال مكتمل' : 'modules'}
            </span>
          </div>

          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 transition-all duration-500"
              style={{ width: `${coverage.percentage}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            {coverage.draftCount > 0
              ? `${coverage.draftCount} ${language === 'ar' ? 'تقييم كمسودة قيد الاستكمال' : 'draft in progress'}`
              : language === 'ar' ? 'جميع التقييمات الأساسية مكتملة' : 'All prioritized modules assessed'}
          </p>
        </div>

        {/* KPI 3: Open High-Priority Gaps */}
        <div
          onClick={() => setActiveRoute('risk_register')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs cursor-pointer hover:border-teal-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('openPriorityGaps')}
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">{openCriticalHighCount}</span>
            <span className="text-xs text-slate-400">
              {language === 'ar' ? 'فجوات حرجة وعالية' : 'critical/high gaps'}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>{overdueActionsCount > 0 ? `${overdueActionsCount} ${t('overdueActions')}` : 'No overdue items'}</span>
            <span className="text-teal-700 font-semibold flex items-center gap-0.5">
              <span>View register</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 4: Evidence Coverage */}
        <div
          onClick={() => setActiveRoute('evidence_center')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs cursor-pointer hover:border-teal-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('evidenceCoverage')}
            </span>
            <ShieldCheck className="w-4 h-4 text-teal-700" />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{evidenceCoveragePct}%</span>
            <span className="text-xs text-slate-400">
              {approvedEvidenceCount} {language === 'ar' ? 'مستند معتمد' : 'approved docs'}
            </span>
          </div>

          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-700 transition-all duration-500"
              style={{ width: `${evidenceCoveragePct}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            {evidence.filter((e) => e.reviewStatus === 'pending').length > 0
              ? `${evidence.filter((e) => e.reviewStatus === 'pending').length} ${t('pendingReview')}`
              : 'Indexed in secure browser storage'}
          </p>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-[#102D32] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-400 text-teal-950 rounded-xl shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              {t('nextBestAction')}
            </p>
            <h2 className="text-sm md:text-base font-bold text-white mt-0.5">
              {language === 'ar'
                ? 'اعتماد مصفوفة الصلاحيات المالية وتوثيق سياسة المصروفات'
                : 'Approve Financial Authority Matrix & Formalize Expense Policy'}
            </h2>
            <p className="text-xs text-teal-100/80 mt-1 max-w-2xl">
              {language === 'ar'
                ? 'إجراء المصروفات ذو الأولوية العالية معلق منذ أيام. اعتماده يرفع درجة حوكمة المصروفات ويغلق فجوة الامتثال الحرجة.'
                : 'High-priority action ACT-EXP-001 is awaiting closure. Formalizing dual-approval thresholds will close your primary audit gap.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveRoute('action_plan')}
          className="px-4 py-2 bg-white text-teal-950 hover:bg-teal-50 rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
        >
          {language === 'ar' ? 'تنفيذ الإجراء الآن' : 'Take Action Now'}
        </button>
      </div>

      {/* Modules Performance & Actions Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 10 Modules List */}
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('modulesPerformance')}</h2>
              <p className="text-xs text-slate-500">10 Core Internal Control Domains</p>
            </div>
            <button
              onClick={() => setActiveRoute('challenges')}
              className="text-xs text-teal-700 hover:underline font-semibold"
            >
              {language === 'ar' ? 'إدارة النطاق' : 'Manage Scope'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {MODULES_LIST.map((mod) => {
              const asmt = assessments.find((a) => a.moduleId === mod.id);
              const score = asmt?.score ?? null;
              const isAssessed = asmt?.status === 'completed';
              const isDraft = asmt?.status === 'draft';

              return (
                <div key={mod.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {language === 'ar' ? mod.titleAr : mod.title}
                      </span>
                      {mod.id === 'expense_management' && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded-sm font-semibold">
                          Core Deep-Dive
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {mod.questions.length} {language === 'ar' ? 'ضابط رقابي' : 'controls'} • {mod.category}
                    </p>
                  </div>

                  {/* Score & Status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right rtl:text-left w-20">
                      <span className="text-xs font-bold text-slate-900">
                        {score !== null ? `${score}%` : '—'}
                      </span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            (score ?? 0) >= 70 ? 'bg-teal-600' : (score ?? 0) >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${score ?? 0}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveRoute('assessments', { moduleId: mod.id })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isAssessed
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : isDraft
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          : 'bg-teal-50 hover:bg-teal-100 text-teal-800'
                      }`}
                    >
                      {isAssessed
                        ? language === 'ar' ? 'عرض النتائج' : 'View Results'
                        : isDraft
                        ? language === 'ar' ? 'استكمال المسودة' : 'Resume Draft'
                        : language === 'ar' ? 'بدء التقييم' : 'Assess'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Actions Status & Severity Breakdown */}
        <div className="space-y-6">
          {/* Action Status Overview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">{t('actionStatusOverview')}</h2>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  <span>{t('todo')}</span>
                </span>
                <span className="font-bold text-slate-800">{actionCounts.todo}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  <span>{t('inProgress')}</span>
                </span>
                <span className="font-bold text-teal-700">{actionCounts.in_progress}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>{t('awaitingReview')}</span>
                </span>
                <span className="font-bold text-amber-600">{actionCounts.awaiting_review}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>{t('completed')}</span>
                </span>
                <span className="font-bold text-emerald-600">{actionCounts.completed}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveRoute('action_plan')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl text-center transition-colors"
            >
              {language === 'ar' ? 'فتح خطة الإجراءات التصحيحية' : 'Open Action Plan'}
            </button>
          </div>

          {/* Quick Advisory Services Inquiry Card */}
          <div className="bg-amber-50/50 border border-amber-200/80 p-5 rounded-2xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
              {language === 'ar' ? 'خدمات إحكام الاستشارية' : 'Ihkam Advisory Services'}
            </h2>
            <p className="text-xs text-amber-950/80 leading-relaxed mb-3">
              {language === 'ar'
                ? 'هل تحتاج المنشأة إلى صياغة مصفوفة صلاحيات أو إعداد لائحة حوكمة معتمدة؟'
                : 'Need specialized CFO or governance advisory to close complex compliance gaps?'}
            </p>
            <button
              onClick={() => setActiveRoute('services')}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              {t('requestConsultation')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
