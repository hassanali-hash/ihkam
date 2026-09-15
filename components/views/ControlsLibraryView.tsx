'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MODULES_LIST } from '@/lib/modulesData';
import { ControlDefinition, TestRun, TestResult } from '@/lib/types';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  FileText,
  Calendar,
  User,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export function ControlsLibraryView() {
  const {
    language,
    t,
    activeCompany,
    activeUser,
    testRuns,
    addTestRun,
    evidence,
    canMutate,
    isReviewer
  } = useApp();

  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [testModalControl, setTestModalControl] = useState<ControlDefinition | null>(null);

  // Form state for test run modal
  const [testResult, setTestResult] = useState<TestResult>('pass');
  const [sampleSize, setSampleSize] = useState<number>(25);
  const [exceptionsCount, setExceptionsCount] = useState<number>(0);
  const [testNotes, setTestNotes] = useState<string>('');

  // Collect all controls from all modules
  const allControls = useMemo(() => {
    const list: (ControlDefinition & { moduleTitle: string; moduleTitleAr: string })[] = [];
    for (const mod of MODULES_LIST) {
      const controls: ControlDefinition[] = (mod.controls && mod.controls.length > 0)
        ? mod.controls
        : (mod.questions || []).map((q) => ({
            id: q.controlId || q.id,
            code: q.controlId || q.id,
            moduleId: mod.id,
            title: q.questionText,
            titleAr: q.questionTextAr,
            description: q.businessExplanation,
            descriptionAr: q.businessExplanationAr,
            responsibleRole: q.suggestedRole,
            responsibleRoleAr: q.suggestedRoleAr,
            reviewFrequency: q.reviewFrequency,
            testingProcedure: q.testProcedure,
            testingProcedureAr: q.testProcedureAr,
            evidenceRequirement: q.evidenceRequirement,
            evidenceRequirementAr: q.evidenceRequirementAr
          }));

      for (const ctrl of controls) {
        list.push({
          ...ctrl,
          moduleTitle: mod.name || (mod as any).title || '',
          moduleTitleAr: mod.nameAr || (mod as any).titleAr || ''
        });
      }
    }
    return list;
  }, []);

  // Filter controls
  const filteredControls = useMemo(() => {
    return allControls.filter((c) => {
      if (selectedModule !== 'all' && c.moduleId !== selectedModule) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q) || c.titleAr.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q) || c.descriptionAr.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [allControls, selectedModule, searchQuery]);

  const handleSaveTestRun = () => {
    if (!testModalControl || !canMutate) return;

    addTestRun({
      companyId: activeCompany.id,
      controlId: testModalControl.id,
      moduleId: testModalControl.moduleId,
      testDate: new Date().toISOString().split('T')[0],
      testedBy: activeUser.name,
      result: testResult,
      sampleSize: Number(sampleSize) || 0,
      exceptionsCount: Number(exceptionsCount) || 0,
      notes: testNotes
    });

    setTestModalControl(null);
    setTestNotes('');
    setExceptionsCount(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('controlsLibrary')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Standardized financial control definitions, delegated authorities, and testing procedures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Total catalog: <strong>{allControls.length}</strong> controls
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, title, role..."
            className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 w-full sm:w-auto"
          >
            <option value="all">All Modules ({allControls.length})</option>
            {MODULES_LIST.map((m) => (
              <option key={m.id} value={m.id}>
                {language === 'ar' ? (m.nameAr || m.titleAr) : (m.name || m.title)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Controls List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredControls.map((ctrl) => {
          // Find latest test run
          const latestTest = testRuns
            .filter((tr) => tr.controlId === ctrl.id)
            .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())[0];

          // Linked evidence count
          const linkedDocs = evidence.filter((e) => e.controlId === ctrl.id);

          return (
            <div
              key={ctrl.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-600/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Code, Category & Testing status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#102D32] text-white">
                      {ctrl.code}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[130px]">
                      {language === 'ar' ? ctrl.moduleTitleAr : ctrl.moduleTitle}
                    </span>
                  </div>

                  {latestTest ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                      latestTest.result === 'pass'
                        ? 'bg-emerald-100 text-emerald-900'
                        : latestTest.result === 'fail'
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {latestTest.result === 'pass' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-rose-600" />}
                      <span>Tested: {latestTest.result}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Untested</span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {language === 'ar' ? ctrl.titleAr : ctrl.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">
                  {language === 'ar' ? ctrl.descriptionAr : ctrl.description}
                </p>

                {/* Metadata badges */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                  <div>
                    <span className="text-slate-400 block font-medium">{t('responsibleRole')}</span>
                    <span className="text-slate-800 font-semibold">{ctrl.responsibleRole}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">{t('reviewFrequency')}</span>
                    <span className="text-slate-800 font-semibold capitalize">{ctrl.reviewFrequency}</span>
                  </div>
                </div>

                {/* Testing procedure */}
                <div className="text-[11px] text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700 block mb-0.5">Sample Testing Procedure:</span>
                  <p className="font-mono bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-[10px] leading-relaxed">
                    {language === 'ar' ? ctrl.testingProcedureAr : ctrl.testingProcedure}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {linkedDocs.length} {language === 'ar' ? 'مستندات مؤيدة' : 'linked docs'}
                </span>

                <button
                  disabled={!canMutate}
                  onClick={() => setTestModalControl(ctrl)}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('recordTest')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECORD TEST RUN MODAL */}
      {testModalControl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="bg-[#102D32] text-white p-5">
              <span className="font-mono text-xs text-amber-300 font-bold block">{testModalControl.code}</span>
              <h2 className="text-base font-bold text-white mt-0.5">
                {language === 'ar' ? testModalControl.titleAr : testModalControl.title}
              </h2>
              <p className="text-xs text-teal-200 mt-1">Record sample control testing results for audit trail</p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Result radio cards */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">{t('testResult')} *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { res: 'pass' as TestResult, labelKey: 'pass', color: 'text-emerald-700 border-emerald-300 bg-emerald-50' },
                    { res: 'fail' as TestResult, labelKey: 'fail', color: 'text-rose-700 border-rose-300 bg-rose-50' },
                    { res: 'inconclusive' as TestResult, labelKey: 'inconclusive', color: 'text-amber-700 border-amber-300 bg-amber-50' }
                  ].map((btn) => (
                    <button
                      key={btn.res}
                      type="button"
                      onClick={() => setTestResult(btn.res)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                        testResult === btn.res ? `${btn.color} ring-2 ring-teal-700` : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {t(btn.labelKey as any)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample size & Exceptions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('sampleSize')}</label>
                  <input
                    type="number"
                    min="1"
                    value={sampleSize}
                    onChange={(e) => setSampleSize(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('exceptionsCount')}</label>
                  <input
                    type="number"
                    min="0"
                    value={exceptionsCount}
                    onChange={(e) => setExceptionsCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Testing Observations & Details</label>
                <textarea
                  rows={3}
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  placeholder="Record sample items inspected, invoice dates, or specific deviations found..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTestModalControl(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveTestRun}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Save Test Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
