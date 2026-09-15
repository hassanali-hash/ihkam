'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Industry, ErpSystem, Company } from '@/lib/types';
import { Building, Layers, Cpu, AlertCircle, ArrowRight, ArrowLeft, Check, Save } from 'lucide-react';
import { MODULES_LIST } from '@/lib/modulesData';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_DRAFT_KEY = 'ihkam-onboarding-draft';

export function OnboardingWizardModal({ isOpen, onClose }: OnboardingWizardProps) {
  const { language, t, createCompany, setActiveRoute } = useApp();

  const [step, setStep] = useState<number>(1);
  const initialFormData = {
    name: '',
    nameAr: '',
    industry: 'trading_distribution' as Industry,
    country: 'Saudi Arabia',
    countryAr: 'المملكة العربية السعودية',
    currency: 'SAR',
    employeeRange: '25-50',
    annualRevenueRange: '5M-10M SAR',
    branchCount: 1,
    mainActivities: '',
    mainActivitiesAr: '',
    erpSystem: 'odoo' as ErpSystem,
    challenges: [] as string[]
  };

  type OnboardingFormData = typeof initialFormData;

  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (saved) {
        setFormData({ ...initialFormData, ...JSON.parse(saved) });
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const saveDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(formData));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) errs.name = t('requiredField');
      if (!formData.nameAr.trim()) errs.nameAr = t('requiredField');
    }

    if (currentStep === 2) {
      if (formData.branchCount < 1 || isNaN(formData.branchCount)) {
        errs.branchCount = t('invalidBranchCount');
      }
      if (!formData.mainActivities.trim()) errs.mainActivities = t('requiredField');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      saveDraft();
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveAndExit = () => {
    saveDraft();
    onClose();
  };

  const handleFinish = () => {
    if (!validateStep(step)) return;

    // Determine relevant modules based on rules
    const suggestedModuleIds: string[] = ['expense_management', 'treasury', 'financial_reporting', 'tax_compliance'];
    if (formData.employeeRange !== '0' && formData.employeeRange !== '1') {
      suggestedModuleIds.push('payroll');
    }
    if (['trading_distribution', 'retail', 'manufacturing'].includes(formData.industry)) {
      suggestedModuleIds.push('inventory');
      suggestedModuleIds.push('procurement');
    }
    if (formData.industry !== 'other') {
      suggestedModuleIds.push('revenue');
      suggestedModuleIds.push('budgeting');
      suggestedModuleIds.push('fixed_assets');
    }

    const companyId = createCompany({
      name: formData.name,
      nameAr: formData.nameAr,
      industry: formData.industry,
      country: formData.country,
      countryAr: formData.countryAr,
      currency: formData.currency,
      employeeRange: formData.employeeRange,
      annualRevenueRange: formData.annualRevenueRange,
      branchCount: Number(formData.branchCount) || 1,
      mainActivities: formData.mainActivities,
      mainActivitiesAr: formData.mainActivitiesAr || formData.mainActivities,
      erpSystem: formData.erpSystem,
      challenges: formData.challenges,
      selectedModuleIds: Array.from(new Set(suggestedModuleIds))
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_DRAFT_KEY);
    }

    onClose();
    setActiveRoute('challenges', { newCompanyId: companyId });
  };

  const toggleChallenge = (c: string) => {
    setFormData((prev) => {
      const exists = prev.challenges.includes(c);
      return {
        ...prev,
        challenges: exists ? prev.challenges.filter((x) => x !== c) : [...prev.challenges, c]
      };
    });
  };

  const ArrowNext = language === 'ar' ? ArrowLeft : ArrowRight;
  const ArrowBack = language === 'ar' ? ArrowRight : ArrowLeft;

  const challengeOptions = [
    { id: 'approval_matrices', en: 'Informal or paper approvals without delegated limits', ar: 'موافقات غير رسمية أو ورقية دون مصفوفة صلاحيات' },
    { id: 'receipt_documentation', en: 'Missing tax invoices and disorganized expense receipts', ar: 'فواتير ضريبية مفقودة ومستندات صرف غير منظمة' },
    { id: 'supplier_bank_fraud', en: 'Vulnerability to supplier invoice or bank account fraud', ar: 'مخاطر تعديل الحسابات البنكية للموردين والاحتيال' },
    { id: 'inventory_variance', en: 'Discrepancies between physical warehouse stock and ERP', ar: 'فروقات مستمرة بين الجرد الفعلي وأرصدة النظام' },
    { id: 'delayed_close', en: 'Month-end financial closing takes longer than 20 days', ar: 'تأخر الإقفال المالي الشهري لأكثر من 20 يوماً' },
    { id: 'zatca_compliance', en: 'ZATCA Phase 2 e-invoicing and tax audit preparation', ar: 'جاهزية الفوترة الإلكترونية (المرحلة الثانية) والفحص الضريبي' },
    { id: 'cash_advances', en: 'Unreconciled and overdue employee advances or petty cash', ar: 'سلف وعهد موظفين معلقة ومتقادمة دون تسوية' },
    { id: 'budget_overruns', en: 'Departmental spending exceeding unplanned budgets', ar: 'تجاوزات في مصروفات الإدارات خارج الموازنة' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-8">
        {/* Step Progress Header */}
        <div className="bg-[#102D32] text-white px-6 py-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold">{t('onboardingTitle')}</h2>
              <p className="text-teal-200 text-xs">
                {language === 'ar' ? `الخطوة ${step} من 4` : `Step ${step} of 4`}
              </p>
            </div>
            <button
              onClick={handleSaveAndExit}
              className="text-xs px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('saveAndExit')}</span>
            </button>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s <= step ? 'bg-amber-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* STEP 1: Company Details */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">{t('step1')}</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('companyName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Al Rawabi Food Industries"
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.name ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                  } focus:ring-2 focus:ring-teal-700 focus:outline-hidden`}
                />
                {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('companyNameAr')} *
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: شركة الروابي للصناعات الغذائية"
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.nameAr ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                  } focus:ring-2 focus:ring-teal-700 focus:outline-hidden`}
                />
                {errors.nameAr && <p className="text-rose-600 text-[11px] mt-1">{errors.nameAr}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('industry')}
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value as Industry })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-700 focus:outline-hidden bg-white"
                  >
                    <option value="trading_distribution">Trading & Distribution (تجارة وتوزيع)</option>
                    <option value="professional_services">Professional Services (خدمات واستشارات)</option>
                    <option value="retail">Retail (تجارة التجزئة)</option>
                    <option value="manufacturing">Manufacturing (صناعي وإنتاجي)</option>
                    <option value="construction">Construction & Contracting (مقاولات وإنشاءات)</option>
                    <option value="hospitality">Hospitality & F&B (ضيافة وأغذية)</option>
                    <option value="other">Other Commercial (قطاعات تجارية أخرى)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('currency')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-700 focus:outline-hidden bg-white"
                  >
                    <option value="SAR">SAR - Saudi Riyal (ريال سعودي)</option>
                    <option value="AED">AED - UAE Dirham (درهم إماراتي)</option>
                    <option value="USD">USD - US Dollar (دولار أمريكي)</option>
                    <option value="KWD">KWD - Kuwaiti Dinar (دينار كويتي)</option>
                    <option value="BHD">BHD - Bahraini Dinar (دينار بحريني)</option>
                    <option value="QAR">QAR - Qatari Riyal (ريال قطري)</option>
                    <option value="OMR">OMR - Omani Rial (ريال عماني)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Operations */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">{t('step2')}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('employeeCount')}
                  </label>
                  <select
                    value={formData.employeeRange}
                    onChange={(e) => setFormData({ ...formData, employeeRange: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-700 focus:outline-hidden bg-white"
                  >
                    <option value="1-10">1 - 10 Employees</option>
                    <option value="11-50">11 - 50 Employees</option>
                    <option value="51-150">51 - 150 Employees</option>
                    <option value="151-500">151 - 500 Employees</option>
                    <option value="500+">500+ Employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('annualRevenue')}
                  </label>
                  <select
                    value={formData.annualRevenueRange}
                    onChange={(e) => setFormData({ ...formData, annualRevenueRange: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-700 focus:outline-hidden bg-white"
                  >
                    <option value="Under 3M">Under 3M SAR</option>
                    <option value="3M-10M">3M - 10M SAR</option>
                    <option value="10M-40M">10M - 40M SAR</option>
                    <option value="40M-100M">40M - 100M SAR</option>
                    <option value="100M+">100M+ SAR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('branchCount')} *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.branchCount}
                  onChange={(e) => setFormData({ ...formData, branchCount: parseInt(e.target.value) || 1 })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.branchCount ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                  } focus:ring-2 focus:ring-teal-700 focus:outline-hidden`}
                />
                {errors.branchCount && <p className="text-rose-600 text-[11px] mt-1">{errors.branchCount}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('mainActivities')} *
                </label>
                <textarea
                  rows={2}
                  value={formData.mainActivities}
                  onChange={(e) => setFormData({ ...formData, mainActivities: e.target.value, mainActivitiesAr: e.target.value })}
                  placeholder="Briefly describe what products/services the company sells..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.mainActivities ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                  } focus:ring-2 focus:ring-teal-700 focus:outline-hidden`}
                />
                {errors.mainActivities && <p className="text-rose-600 text-[11px] mt-1">{errors.mainActivities}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: Systems */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">{t('step3')}</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('erpSystem')}
                </label>
                <select
                  value={formData.erpSystem}
                  onChange={(e) => setFormData({ ...formData, erpSystem: e.target.value as ErpSystem })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-700 focus:outline-hidden bg-white"
                >
                  <option value="odoo">Odoo ERP</option>
                  <option value="sap">SAP Business One / S/4HANA</option>
                  <option value="oracle">Oracle NetSuite / Cloud ERP</option>
                  <option value="microsoft_dynamics">Microsoft Dynamics 365 / Business Central</option>
                  <option value="spreadsheets">Spreadsheets & Manual Ledgers (إكسل ودفاتر يدوية)</option>
                  <option value="other">Other Accounting Software (أنظمة محاسبية أخرى)</option>
                  <option value="none">None / Under Evaluation (لا يوجد نظام حالياً)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  * Note: Profile configuration only. Ihkam operates locally without requiring live ERP credentials.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Financial Challenges */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">{t('step4')}</h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'اختر التحديات التي تواجهها المنشأة لتركيز تقييم الحوكمة والتوصيات الاستشارية:'
                  : 'Select current operational challenges to tailor governance scope and priority recommendations:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {challengeOptions.map((c) => {
                  const isSelected = formData.challenges.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleChallenge(c.id)}
                      className={`p-3 rounded-lg border text-left rtl:text-right text-xs transition-all flex items-start justify-between cursor-pointer ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50 text-teal-950 font-medium shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="pr-2 rtl:pr-0 rtl:pl-2">
                        {language === 'ar' ? c.ar : c.en}
                      </span>
                      <div className={`w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center mt-0.5 ${
                        isSelected ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowBack className="w-3.5 h-3.5" />
              <span>{t('back')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveAndExit}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-medium"
            >
              {t('cancel')}
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>{t('next')}</span>
              <ArrowNext className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>{t('finish')}</span>
              <Check className="w-3.5 h-3.5 text-amber-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
