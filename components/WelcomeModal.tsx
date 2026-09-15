'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Shield, Sparkles, Building, ArrowRight, ArrowLeft, CheckCircle2, Globe, FileText } from 'lucide-react';
import { SEED_COMPANIES } from '@/lib/seedData';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { language, setLanguage, switchCompany, setActiveRoute } = useApp();

  if (!isOpen) return null;

  const handleExploreSample = () => {
    switchCompany(SEED_COMPANIES[0].id);
    setActiveRoute('dashboard');
    onClose();
  };

  const handleStartNew = () => {
    setActiveRoute('onboarding');
    onClose();
  };

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Top brand header */}
        <div className="bg-[#102D32] text-white p-6 md:p-8 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {language === 'ar' ? 'إحكام للحوكمة والرقابة المالية' : 'Ihkam Financial Governance'}
                </h1>
                <p className="text-teal-200 text-xs md:text-sm mt-0.5">
                  {language === 'ar' ? 'وضوح لكل قرار مالي • مساحة تفاعلية تجريبية' : 'Clarity for every financial decision • Interactive Prototype'}
                </p>
              </div>
            </div>

            {/* Language switch */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-teal-100/90">
            <span className="inline-flex items-center gap-1 bg-teal-800/60 px-2.5 py-1 rounded-full border border-teal-700/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              {language === 'ar' ? '10 مجالات حوكمة مالية شاملة' : '10 Complete Financial Modules'}
            </span>
            <span className="inline-flex items-center gap-1 bg-teal-800/60 px-2.5 py-1 rounded-full border border-teal-700/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              {language === 'ar' ? 'تقييم تفصيلي لإدارة المصروفات (16 سؤالاً)' : 'Full Expense Governance (16 Questions)'}
            </span>
            <span className="inline-flex items-center gap-1 bg-teal-800/60 px-2.5 py-1 rounded-full border border-teal-700/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              {language === 'ar' ? 'حفظ وتخزين محلي آمن في المتصفح' : 'Local In-Browser Persistence'}
            </span>
          </div>
        </div>

        {/* Content & Actions */}
        <div className="p-6 md:p-8 space-y-6">
          <p className="text-slate-600 text-sm leading-relaxed">
            {language === 'ar'
              ? 'أهلاً بك في منصة إحكام. تتيح لك المنصة تقييم ضوابط المنشأة المالية، واكتشاف فجوات التطبيق والمستندات، وتوليد خطة حوكمة مخصصة مع توصيات استشارية محددة.'
              : 'Welcome to Ihkam. Assess corporate internal financial controls, uncover operational gaps and missing documentation, and generate a customized governance roadmap with actionable advisory services.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: Explore Sample Company */}
            <button
              onClick={handleExploreSample}
              className="flex flex-col text-left rtl:text-right p-5 rounded-xl border-2 border-teal-700/40 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-700 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="p-2 bg-teal-700 text-white rounded-lg group-hover:scale-105 transition-transform">
                  <Building className="w-5 h-5" />
                </div>
                <ArrowIcon className="w-4 h-4 text-teal-700 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'استكشاف منشأة نموذجية' : 'Explore Sample Company'}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {language === 'ar'
                  ? 'شركة النور التجارية (85 موظفاً، تقييمات مكتملة، مستندات وإجراءات سابقة)'
                  : 'Al Noor Trading (85 staff, completed Expense assessment, actions, sample evidence)'}
              </span>
            </button>

            {/* Action 2: Start Fresh Assessment */}
            <button
              onClick={handleStartNew}
              className="flex flex-col text-left rtl:text-right p-5 rounded-xl border-2 border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="p-2 bg-slate-800 text-white rounded-lg group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <ArrowIcon className="w-4 h-4 text-slate-700 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'بدء تقييم منشأة جديدة' : 'Start a New Company Assessment'}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {language === 'ar'
                  ? 'معالج تسجيل مكون من 4 خطوات لإدخال بيانات منشأتك واختيار التحديات'
                  : '4-step validated wizard for company details, ERP systems, and challenge areas'}
              </span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>{language === 'ar' ? 'بيانات توضيحية لغرض العرض النموذجي' : 'Illustrative sample data for demonstration'}</span>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 font-medium underline"
            >
              {language === 'ar' ? 'دخول مساحة العمل' : 'Enter Workspace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
