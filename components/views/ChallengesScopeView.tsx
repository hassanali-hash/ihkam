'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { MODULES_LIST } from '@/lib/modulesData';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Check,
  Building
} from 'lucide-react';

export function ChallengesScopeView() {
  const { language, t, activeCompany, updateCompany, setActiveRoute, canMutate } = useApp();

  const activeIds = activeCompany.selectedModuleIds || MODULES_LIST.map((m) => m.id);

  const toggleModuleScope = (moduleId: string) => {
    if (!canMutate) return;
    const exists = activeIds.includes(moduleId);
    const next = exists ? activeIds.filter((id) => id !== moduleId) : [...activeIds, moduleId];
    // Don't allow empty scope
    if (next.length === 0) return;
    updateCompany({ selectedModuleIds: next });
  };

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('challenges')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure active internal control modules and baseline operational financial challenges for {activeCompany.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            Active Scope: <strong>{activeIds.length}</strong> / {MODULES_LIST.length} Modules
          </span>
        </div>
      </div>

      {/* Selected Operational Challenges Callout */}
      {activeCompany.challenges && activeCompany.challenges.length > 0 && (
        <div className="bg-teal-50/60 border border-teal-200 p-5 rounded-2xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2">
            Selected Priority Financial Challenges
          </h2>
          <div className="flex flex-wrap gap-2">
            {activeCompany.challenges.map((c, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-white text-teal-950 rounded-lg text-xs font-medium border border-teal-200/80 shadow-2xs">
                • {c.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Modules Scope Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODULES_LIST.map((mod) => {
          const isInScope = activeIds.includes(mod.id);

          return (
            <div
              key={mod.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isInScope
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {mod.category}
                  </span>

                  <button
                    disabled={!canMutate}
                    onClick={() => toggleModuleScope(mod.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                      isInScope
                        ? 'bg-teal-100 text-teal-900 hover:bg-teal-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isInScope ? 'opacity-100' : 'opacity-20'}`} />
                    <span>{isInScope ? 'Included in Scope' : 'Excluded'}</span>
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {language === 'ar' ? (mod.nameAr || mod.titleAr) : (mod.name || mod.title)}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">
                  {language === 'ar' ? mod.descriptionAr : mod.description}
                </p>

                <div className="text-[11px] text-slate-400 font-medium">
                  {language === 'ar'
                    ? `تتضمن ${mod.questions.length} سؤال تدقيق و ${new Set(mod.questions.map(q => q.controlId)).size} ضابط رقابي.`
                    : `Contains ${mod.questions.length} detailed audit questions & ${new Set(mod.questions.map(q => q.controlId)).size} controls.`}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  ID: {mod.id}
                </span>

                <button
                  onClick={() => setActiveRoute('assessments', { moduleId: mod.id })}
                  className="text-xs font-semibold text-teal-800 hover:underline flex items-center gap-1"
                >
                  <span>Open Assessment</span>
                  <ArrowIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
