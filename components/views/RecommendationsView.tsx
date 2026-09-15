'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MODULES_LIST } from '@/lib/modulesData';
import {
  Lightbulb,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Briefcase
} from 'lucide-react';

interface RecommendationItem {
  id: string;
  moduleId: string;
  phase: '30_days' | '60_days' | '90_days';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  impactScore: number;
  effort: 'Low' | 'Medium' | 'High';
  linkedServiceId: string;
}

export function RecommendationsView() {
  const {
    language,
    t,
    activeCompany,
    assessments,
    actions,
    createAction,
    setActiveRoute,
    canMutate,
    dismissedRecommendations,
    dismissRecommendation,
    restoreRecommendation
  } = useApp();

  const [phaseFilter, setPhaseFilter] = useState<'all' | '30_days' | '60_days' | '90_days'>('all');

  // Master recommendation rules library
  const catalog: RecommendationItem[] = useMemo(() => [
    {
      id: 'rec-exp-matrix',
      moduleId: 'expense_management',
      phase: '30_days',
      title: 'Formalize Financial Authority Matrix with Dual Authorization Thresholds',
      titleAr: 'اعتماد مصفوفة الصلاحيات المالية وحدود التوقيع الثنائي للمدفوعات',
      description: 'Implement mandatory dual sign-off on electronic bank transfers above 50,000 SAR and formalize department budget approval limits.',
      descriptionAr: 'تفعيل التوقيع الثنائي الإلكتروني الإلزامي على التحويلات البنكية التي تتجاوز 50,000 ريال وتحديد صلاحيات اعتماد مديري الإدارات.',
      impactScore: 18,
      effort: 'Medium',
      linkedServiceId: 'srv-matrix'
    },
    {
      id: 'rec-exp-policy',
      moduleId: 'expense_management',
      phase: '30_days',
      title: 'Publish Comprehensive Employee Expense & Travel Policy',
      titleAr: 'إصدار لائحة سياسة المصروفات وبدلات السفر والانتقال المعتمدة',
      description: 'Define explicit daily meal allowances, lodging bands, and standard 30-day receipt submission deadlines.',
      descriptionAr: 'تحديد المعايير المعتمدة لبدلات السفر والإقامة ومواعيد تسليم الفواتير الضريبية خلال 30 يوماً من تاريخ الصرف.',
      impactScore: 12,
      effort: 'Low',
      linkedServiceId: 'srv-policy'
    },
    {
      id: 'rec-tax-zatca',
      moduleId: 'tax_compliance',
      phase: '30_days',
      title: 'ZATCA Phase 2 E-Invoicing Verification & Audit File Readiness',
      titleAr: 'التحقق من جاهزية الربط مع الفوترة الإلكترونية (المرحلة الثانية) وهيئة الزكاة',
      description: 'Verify cryptographic stamp generation, real-time XML transmission, and monthly VAT reconciliation.',
      descriptionAr: 'فحص الختم التشفيري للفوترة الإلكترونية وتوافق الربط المباشر وإقرارات ضريبة القيمة المضافة الشهرية.',
      impactScore: 20,
      effort: 'Medium',
      linkedServiceId: 'srv-zatca'
    },
    {
      id: 'rec-proc-rfq',
      moduleId: 'procurement',
      phase: '60_days',
      title: 'Establish 3-Quote Tender Policy for Purchases Over 20,000 SAR',
      titleAr: 'تطبيق سياسة عروض الأسعار الثلاثة للمشتريات التي تتجاوز 20,000 ريال',
      description: 'Enforce competitive bidding and documented vendor selection sheets for capital expenditures and bulk inventory.',
      descriptionAr: 'إلزامية استدراج ثلاثة عروض أسعار مستقلة مع محضر ترسية موثق لكافة المشتريات الرأسمالية والكميات الكبيرة.',
      impactScore: 15,
      effort: 'Medium',
      linkedServiceId: 'srv-procurement'
    },
    {
      id: 'rec-inv-count',
      moduleId: 'inventory',
      phase: '60_days',
      title: 'Implement Blind Cycle Counting Program for High-Value SKUs',
      titleAr: 'تطبيق برنامج الجرد الدوري الأعمى للأصناف عالية القيمة بالمستودعات',
      description: 'Deploy monthly ABC cycle counts conducted by independent staff rather than warehouse custodians.',
      descriptionAr: 'إجراء جرد دوري مستمر للأصناف فئة A بواسطة فريق محاسبي مستقل عن أمناء المستودعات لتسوية الفروقات.',
      impactScore: 14,
      effort: 'Medium',
      linkedServiceId: 'srv-inventory'
    },
    {
      id: 'rec-fin-close',
      moduleId: 'financial_reporting',
      phase: '60_days',
      title: 'Streamline Month-End Financial Closing Checklist to 10 Days',
      titleAr: 'تطوير قائمة تدقيق الإقفال المالي الشهري لتقليص مدته إلى 10 أيام عمل',
      description: 'Formalize balance sheet reconciliations, depreciation schedules, and pre-closing trial balance sign-offs.',
      descriptionAr: 'توثيق تسويات الحسابات البنكية ومطابقات الأرصدة ومصادقة ميزان المراجعة قبل اليوم العاشر من كل شهر.',
      impactScore: 16,
      effort: 'High',
      linkedServiceId: 'srv-reporting'
    },
    {
      id: 'rec-tre-forecast',
      moduleId: 'treasury',
      phase: '90_days',
      title: 'Automate 13-Week Rolling Cash Flow Forecast Model',
      titleAr: 'بناء نموذج التدفقات النقدية التقديرية المتجدد لمدة 13 أسبوعاً',
      description: 'Anticipate supplier disbursements, payroll liquidity demands, and seasonal cash troughs.',
      descriptionAr: 'التنبؤ باحتياجات السيولة النقدية ومستحقات الموردين والرواتب لتفادي أي عجز نقدي مفاجئ.',
      impactScore: 15,
      effort: 'High',
      linkedServiceId: 'srv-treasury'
    },
    {
      id: 'rec-fix-tag',
      moduleId: 'fixed_assets',
      phase: '90_days',
      title: 'Barcode Tagging & Annual Physical Fixed Asset Count',
      titleAr: 'ترميز الأصول الثابتة بالباركود وإجراء المطابقة الميدانية السنوية',
      description: 'Tag all machinery, computing hardware, and vehicles with unique asset register codes linked to ERP.',
      descriptionAr: 'تثبيت ملصقات الباركود على كافة الآلات والأجهزة والسيارات ومطابقتها مع سجل الأصول الثابتة بالنظام.',
      impactScore: 10,
      effort: 'Medium',
      linkedServiceId: 'srv-assets'
    }
  ], []);

  const visibleRecs = catalog.filter((r) => {
    if (phaseFilter !== 'all' && r.phase !== phaseFilter) return false;
    if (dismissedRecommendations.includes(r.id)) return false;
    return true;
  });

  const handleConvertToAction = (rec: RecommendationItem) => {
    if (!canMutate) return;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (rec.phase === '30_days' ? 30 : rec.phase === '60_days' ? 60 : 90));

    createAction({
      companyId: activeCompany.id,
      moduleId: rec.moduleId,
      title: rec.title,
      titleAr: rec.titleAr,
      description: rec.description,
      priority: rec.phase === '30_days' ? 'high' : 'medium',
      status: 'todo',
      ownerName: 'Finance Manager',
      ownerRole: 'finance_manager',
      dueDate: dueDate.toISOString().split('T')[0],
      comments: [],
      evidenceIds: []
    });

    setActiveRoute('action_plan');
  };

  const handleRequestService = (rec: RecommendationItem) => {
    setActiveRoute('services', { prefillTitle: rec.title, prefillModule: rec.moduleId });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('recommendations')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized strategic control improvements tailored to {activeCompany.name}&apos;s operating maturity.
          </p>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setPhaseFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              phaseFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('all')} ({catalog.length})
          </button>
          <button
            onClick={() => setPhaseFilter('30_days')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              phaseFilter === '30_days' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('roadmap30')}
          </button>
          <button
            onClick={() => setPhaseFilter('60_days')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              phaseFilter === '60_days' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('roadmap60')}
          </button>
          <button
            onClick={() => setPhaseFilter('90_days')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              phaseFilter === '90_days' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('roadmap90')}
          </button>
        </div>
      </div>

      {/* Dismissed items reminder if any */}
      {dismissedRecommendations.length > 0 && (
        <div className="p-3 bg-slate-100 rounded-xl text-xs flex items-center justify-between text-slate-600">
          <span>{dismissedRecommendations.length} recommendation(s) currently hidden.</span>
          <button
            onClick={() => dismissedRecommendations.forEach((id) => restoreRecommendation(id))}
            className="text-teal-700 font-bold hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore all hidden</span>
          </button>
        </div>
      )}

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleRecs.map((rec) => {
          const isAdded = actions.some((a) => a.title === rec.title);

          return (
            <div
              key={rec.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-700/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      rec.phase === '30_days'
                        ? 'bg-rose-100 text-rose-900'
                        : rec.phase === '60_days'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-teal-100 text-teal-900'
                    }`}>
                      {rec.phase === '30_days' ? '30-Day Priority' : rec.phase === '60_days' ? '60-Day Midterm' : '90-Day Assurance'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Module: {rec.moduleId}
                    </span>
                  </div>

                  <button
                    onClick={() => dismissRecommendation(rec.id)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                    title="Dismiss recommendation"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                  {language === 'ar' ? rec.titleAr : rec.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  {language === 'ar' ? rec.descriptionAr : rec.description}
                </p>

                {/* Badges: Impact & Effort */}
                <div className="flex items-center gap-3 text-[11px] mb-4">
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-semibold border border-emerald-200">
                    +{rec.impactScore}% Governance Score Lift
                  </span>
                  <span className="text-slate-500 font-medium">
                    Effort: <strong>{rec.effort}</strong>
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleRequestService(rec)}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  <span>Advisory Support</span>
                </button>

                {isAdded ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Action Plan</span>
                  </span>
                ) : (
                  <button
                    disabled={!canMutate}
                    onClick={() => handleConvertToAction(rec)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('createAction')}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
