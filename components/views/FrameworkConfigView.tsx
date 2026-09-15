'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MODULES_LIST } from '@/lib/modulesData';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Info
} from 'lucide-react';

export function FrameworkConfigView() {
  const {
    language,
    t,
    methodologyConfig,
    updateMethodologyConfig,
    isReviewer
  } = useApp();

  const thresholds = (methodologyConfig.maturityThresholds || {}) as Record<string | number, any>;
  const [t1, setT1] = useState<number>(thresholds[1]?.max ?? thresholds.developing?.[1] ?? 45);
  const [t2, setT2] = useState<number>(thresholds[2]?.max ?? thresholds.defined?.[1] ?? 65);
  const [t3, setT3] = useState<number>(thresholds[3]?.max ?? thresholds.managed?.[1] ?? 85);
  const [moduleWeights, setModuleWeights] = useState<Record<string, number>>(
    methodologyConfig.moduleWeights || {}
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleModuleWeightChange = (moduleId: string, val: number) => {
    setModuleWeights((prev) => ({ ...prev, [moduleId]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReviewer) return;

    const newThresholds: Record<number, { min: number; max: number; label: string; labelAr: string }> = {
      1: { min: 0, max: t1, label: 'Basic', labelAr: 'أساسي' },
      2: { min: t1 + 1, max: t2, label: 'Developing', labelAr: 'قيد التطوير' },
      3: { min: t2 + 1, max: t3, label: 'Established', labelAr: 'مستقر وموثق' },
      4: { min: t3 + 1, max: 100, label: 'Optimized', labelAr: 'متقدم ومستدام' }
    };

    updateMethodologyConfig({
      version: `1.0.${Date.now().toString().slice(-3)}`,
      maturityThresholds: newThresholds,
      moduleWeights
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setT1(45);
    setT2(65);
    setT3(85);
    const defaults: Record<string, number> = {};
    for (const m of MODULES_LIST) {
      defaults[m.id] = 1.0;
    }
    setModuleWeights(defaults);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('frameworkConfig')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Adjustable assessment weights, scoring bands, and maturity thresholds (Reviewer role access).
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Methodology weights updated</span>
          </span>
        )}
      </div>

      {!isReviewer && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>You are in read-only view for methodology settings. Switch to <strong>Reviewer</strong> or <strong>Admin</strong> in the header to modify parameters.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Maturity Thresholds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Maturity Band Thresholds (%)</h2>
            <span className="text-slate-400">Current version: {methodologyConfig.version}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
              <span className="font-bold text-rose-900 block">Level 1: Basic (Rose)</span>
              <p className="text-slate-500 text-[11px]">Score range: 0% to {t1}%</p>
              <input
                type="range"
                min="30"
                max="60"
                disabled={!isReviewer}
                value={t1}
                onChange={(e) => setT1(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
              <span className="text-[11px] font-mono font-bold text-slate-800">Cut-off: {t1}%</span>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
              <span className="font-bold text-amber-900 block">Level 2: Developing (Amber)</span>
              <p className="text-slate-500 text-[11px]">Score range: {t1 + 1}% to {t2}%</p>
              <input
                type="range"
                min={t1 + 5}
                max="75"
                disabled={!isReviewer}
                value={t2}
                onChange={(e) => setT2(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <span className="text-[11px] font-mono font-bold text-slate-800">Cut-off: {t2}%</span>
            </div>

            <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2">
              <span className="font-bold text-teal-900 block">Level 3: Established (Teal)</span>
              <p className="text-slate-500 text-[11px]">Score range: {t2 + 1}% to {t3}% (Optimized &gt; {t3}%)</p>
              <input
                type="range"
                min={t2 + 5}
                max="95"
                disabled={!isReviewer}
                value={t3}
                onChange={(e) => setT3(Number(e.target.value))}
                className="w-full accent-teal-700"
              />
              <span className="text-[11px] font-mono font-bold text-slate-800">Cut-off: {t3}%</span>
            </div>
          </div>
        </div>

        {/* Module Weight Multipliers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Module Governance Weights</h2>
              <p className="text-slate-500 text-[11px]">Relative multiplier for computing overall composite governance score</p>
            </div>
            {isReviewer && (
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-teal-700 font-semibold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 1.0</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODULES_LIST.map((m) => {
              const currentW = moduleWeights[m.id] ?? 1.0;

              return (
                <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">{m.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{m.category}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="3.0"
                      disabled={!isReviewer}
                      value={currentW}
                      onChange={(e) => handleModuleWeightChange(m.id, parseFloat(e.target.value) || 1.0)}
                      className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold font-mono text-xs"
                    />
                    <span className="text-[11px] text-slate-500">x</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        {isReviewer && (
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Recalculate Framework</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
