'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { exportStateAsJson, importStateFromJson } from '@/lib/storage';
import { clearDatabase } from '@/lib/idb';
import {
  Settings,
  Download,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building,
  ShieldAlert,
  Globe,
  Database
} from 'lucide-react';

export function SettingsView() {
  const {
    language,
    setLanguage,
    t,
    companies,
    activeCompany,
    setActiveCompanyId,
    activeUser,
    isAdmin,
    rawState
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExportWorkspace = () => {
    exportStateAsJson(rawState);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = importStateFromJson(text);
      if (success) {
        setImportStatus('Workspace restored successfully! Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus('Failed to parse workspace JSON. Please verify schema.');
      }
    } catch (err: any) {
      setImportStatus(`Import error: ${err.message}`);
    }
  };

  const handleResetWorkspace = async () => {
    if (!isAdmin) return;
    const msg = language === 'ar'
      ? 'هل أنت متأكد من رغبتك في إعادة تعيين كافة البيانات إلى الإعدادات الافتراضية؟'
      : 'Are you sure you want to reset all data to default seeds?';
    if (confirm(msg)) {
      await clearDatabase();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ihkam_governance_v1_state');
        localStorage.removeItem('ihkam_governance_active_company_id');
        localStorage.removeItem('ihkam_governance_active_role');
        setResetSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('settings')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Application preferences, backup export/import, and workspace database administration.
          </p>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>Workspace reset to default demo data. Reloading...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Localization & Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Globe className="w-4 h-4 text-teal-700" />
            <span>{t('languagePreference')}</span>
          </div>
          <p className="text-slate-500 text-xs">
            Toggle interface direction and terminology between Arabic (RTL) and English (LTR).
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setLanguage('ar')}
              className={`p-3 rounded-xl border text-center font-bold transition-all ${
                language === 'ar'
                  ? 'bg-teal-50 border-teal-700 text-teal-900 ring-2 ring-teal-700/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block text-sm">العربية (RTL)</span>
              <span className="text-[10px] text-slate-400 font-normal">Arabic Standard</span>
            </button>

            <button
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-xl border text-center font-bold transition-all ${
                language === 'en'
                  ? 'bg-teal-50 border-teal-700 text-teal-900 ring-2 ring-teal-700/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block text-sm">English (LTR)</span>
              <span className="text-[10px] text-slate-400 font-normal">Corporate English</span>
            </button>
          </div>
        </div>

        {/* Company Switcher */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Building className="w-4 h-4 text-teal-700" />
            <span>Active Enterprise Context</span>
          </div>
          <p className="text-slate-500 text-xs">
            Switch between demo organizations or review distinct enterprise scoring states.
          </p>

          <div className="space-y-2 pt-2">
            {companies.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveCompanyId(c.id)}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  c.id === activeCompany.id
                    ? 'bg-teal-50/50 border-teal-700 ring-2 ring-teal-700/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-900">{language === 'ar' ? c.nameAr : c.name}</p>
                  <p className="text-[11px] text-slate-500">{c.industry.replace('_', ' ')} • {c.currency}</p>
                </div>
                {c.id === activeCompany.id && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Backup & Data Portability */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Database className="w-4 h-4 text-teal-700" />
            <span>Data Export &amp; Backup</span>
          </div>
          <p className="text-slate-500 text-xs">
            Export full assessments, uploaded evidence metadata, test logs, and customized weights as a JSON backup.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleExportWorkspace}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t('exportWorkspace')}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold flex items-center gap-2 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{t('importWorkspace')}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>

        {/* Danger Zone: Reset Workspace */}
        <div className="bg-rose-50/40 p-6 rounded-2xl border border-rose-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{t('dangerZone')}</span>
          </div>
          <p className="text-rose-700 text-xs">
            Clear all cached assessments, stored evidence files from IndexedDB, and reset the workspace to initial seed state.
          </p>

          <div className="pt-2">
            {isAdmin ? (
              <button
                onClick={handleResetWorkspace}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('resetWorkspace')}</span>
              </button>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                Only Company Admin role can reset the workspace data.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
