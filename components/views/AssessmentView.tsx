'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MODULES_LIST } from '@/lib/modulesData';
import { calculateModuleScore, identifyGapsForAssessment } from '@/lib/scoring';
import {
  Assessment,
  AssessmentAnswer,
  QuestionWeight,
  AssessmentStatus
} from '@/lib/types';
import {
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Paperclip,
  RotateCcw,
  List,
  Columns,
  Info,
  Save,
  FileCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function AssessmentView() {
  const {
    language,
    t,
    activeCompany,
    activeUser,
    assessments,
    saveAssessment,
    createReassessment,
    evidence,
    routeParams,
    setActiveRoute,
    canMutate
  } = useApp();

  const selectedModuleId = routeParams?.moduleId || 'expense_management';
  const currentModule = MODULES_LIST.find((m) => m.id === selectedModuleId) || MODULES_LIST[0];

  // Find existing assessment or create a new draft in memory
  const existingAssessment = useMemo(() => {
    return assessments.find(
      (a) => a.companyId === activeCompany.id && a.moduleId === currentModule.id
    );
  }, [assessments, activeCompany.id, currentModule.id]);

  const [assessmentDraft, setAssessmentDraft] = useState<Assessment>(() => {
    if (existingAssessment) return existingAssessment;
    return {
      id: `asmt-${currentModule.id}-${Date.now()}`,
      companyId: activeCompany.id,
      moduleId: currentModule.id,
      ruleVersion: '1.0.0',
      status: 'draft',
      score: null,
      answers: {},
      createdAt: new Date().toISOString(),
      createdBy: activeUser.name,
      version: 1
    };
  });

  const [prevModuleId, setPrevModuleId] = useState<string>(currentModule.id);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'stepper' | 'list'>('stepper');
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [saveIndicator, setSaveIndicator] = useState<string>('');

  // Keep draft in sync if active module changes without cascading effects
  if (prevModuleId !== currentModule.id) {
    setPrevModuleId(currentModule.id);
    setAssessmentDraft(
      existingAssessment || {
        id: `asmt-${currentModule.id}-draft`,
        companyId: activeCompany.id,
        moduleId: currentModule.id,
        ruleVersion: '1.0.0',
        status: 'draft',
        score: null,
        answers: {},
        createdAt: '2026-01-01T00:00:00.000Z',
        createdBy: activeUser.name,
        version: 1
      }
    );
    setCurrentQuestionIndex(0);
    setIsReviewMode(false);
  }

  const questions = currentModule.questions;
  const currentQuestion = questions[currentQuestionIndex];

  // Real-time score calculation
  const scoreResult = useMemo(() => {
    return calculateModuleScore(questions, assessmentDraft.answers);
  }, [questions, assessmentDraft.answers]);

  // Autosave update helper
  const handleAnswerChange = (
    questionId: string,
    value: number | 'NA',
    naReason?: string,
    notes?: string,
    linkedEvidenceIds?: string[]
  ) => {
    if (!canMutate) return;

    setAssessmentDraft((prev) => {
      const prevAnswer = prev.answers[questionId] || {};
      const newAnswer: AssessmentAnswer = {
        questionId,
        value,
        naReason: value === 'NA' ? naReason ?? prevAnswer.naReason ?? '' : undefined,
        notes: notes !== undefined ? notes : prevAnswer.notes,
        linkedEvidenceIds: linkedEvidenceIds || prevAnswer.linkedEvidenceIds || [],
        updatedAt: new Date().toISOString()
      };

      const updatedAnswers = { ...prev.answers, [questionId]: newAnswer };
      const calc = calculateModuleScore(questions, updatedAnswers);

      const nextDraft: Assessment = {
        ...prev,
        answers: updatedAnswers,
        score: calc.score
      };

      // Save to global context / localStorage
      saveAssessment(nextDraft);
      setSaveIndicator(t('autosaved'));
      setTimeout(() => setSaveIndicator(''), 2500);

      return nextDraft;
    });
  };

  const handleLinkEvidence = (questionId: string, evidenceId: string) => {
    const current = assessmentDraft.answers[questionId]?.linkedEvidenceIds || [];
    const updated = current.includes(evidenceId)
      ? current.filter((id) => id !== evidenceId)
      : [...current, evidenceId];
    const val = assessmentDraft.answers[questionId]?.value ?? 0;
    handleAnswerChange(questionId, val, undefined, undefined, updated);
  };

  const handleFinalSubmit = () => {
    if (!canMutate) return;
    const finalScore = scoreResult.score;
    const submittedAssessment: Assessment = {
      ...assessmentDraft,
      status: 'completed',
      score: finalScore,
      completedAt: new Date().toISOString()
    };
    saveAssessment(submittedAssessment);
    setIsReviewMode(false);
  };

  const handleReassessment = () => {
    const newDraft = createReassessment(currentModule.id);
    setAssessmentDraft(newDraft);
    setCurrentQuestionIndex(0);
    setIsReviewMode(false);
  };

  // Check unanswered count
  const answeredCount = Object.keys(assessmentDraft.answers).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const isComplete = answeredCount === questions.length;

  const ArrowNext = language === 'ar' ? ArrowLeft : ArrowRight;
  const ArrowBack = language === 'ar' ? ArrowRight : ArrowLeft;

  const currentAnswer = currentQuestion ? assessmentDraft.answers[currentQuestion.id] : undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Module Selector & Header Banner */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                {currentModule.category || (language === 'ar' ? 'حوكمة مالية' : 'Financial Governance')}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Code: {currentModule.id.toUpperCase()}
              </span>
              {assessmentDraft.status === 'completed' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('assessed')} (Score: {assessmentDraft.score}%)</span>
                </span>
              )}
              {assessmentDraft.status === 'draft' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {t('draft')}
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
              {language === 'ar' ? currentModule.titleAr : currentModule.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              {language === 'ar' ? currentModule.descriptionAr : currentModule.description}
            </p>
          </div>

          {/* Module Switcher Dropdown & View Mode */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={currentModule.id}
              onChange={(e) => setActiveRoute('assessments', { moduleId: e.target.value })}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
            >
              {MODULES_LIST.map((m) => (
                <option key={m.id} value={m.id}>
                  {language === 'ar' ? m.titleAr : m.title} ({m.questions.length} Qs)
                </option>
              ))}
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'stepper' ? 'list' : 'stepper')}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
              title={viewMode === 'stepper' ? 'Switch to Full List View' : 'Switch to Step-by-Step Stepper'}
            >
              {viewMode === 'stepper' ? <List className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
            </button>

            {assessmentDraft.status === 'completed' && canMutate && (
              <button
                onClick={handleReassessment}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Initiate a new version review"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-assess</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar and Autosave Status */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1 max-w-md">
            <div className="flex justify-between items-center mb-1 text-[11px] text-slate-500 font-medium">
              <span>
                {language === 'ar'
                  ? `${answeredCount} من ${questions.length} سؤالاً مجاباً (${scoreResult.answeredRatio}%)`
                  : `${answeredCount} of ${questions.length} answered (${scoreResult.answeredRatio}%)`}
              </span>
              <span className="font-bold text-teal-800">
                {scoreResult.score !== null ? `Provisional Score: ${scoreResult.score}%` : 'Incomplete'}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${scoreResult.answeredRatio}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveIndicator && (
              <span className="text-[11px] text-emerald-600 font-medium animate-pulse">
                ✓ {saveIndicator}
              </span>
            )}
            <button
              onClick={() => setIsReviewMode(!isReviewMode)}
              className="text-xs text-teal-800 font-semibold hover:underline"
            >
              {isReviewMode ? '← Back to Questions' : 'Review & Submit Summary →'}
            </button>
          </div>
        </div>
      </div>

      {/* REVIEW MODE SCREEN */}
      {isReviewMode ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('reviewSummary')}</h2>
              <p className="text-xs text-slate-500">
                Inspect calculated score, completeness, and auto-discovered compliance gaps.
              </p>
            </div>
            <button
              onClick={() => setIsReviewMode(false)}
              className="px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50"
            >
              Back to Form
            </button>
          </div>

          {/* Score Calculation Card */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                {t('scoreBreakdown')}
              </span>
              <div className="text-2xl font-black text-teal-950 mt-1">
                {scoreResult.score !== null ? `${scoreResult.score}%` : 'N/A (Unanswered)'}
              </div>
              <p className="text-xs text-teal-800 font-mono mt-0.5">{t('formulaExplainer')}</p>
            </div>

            <div className="text-xs text-slate-700 space-y-1">
              <p>• Applicable Weight Total: <strong>{scoreResult.totalApplicableWeight}</strong></p>
              <p>• Weighted Sum Achieved: <strong>{scoreResult.weightedScoreSum}</strong></p>
              <p>• Max Possible Weighted Sum: <strong>{scoreResult.maxPossibleWeightedSum}</strong></p>
            </div>
          </div>

          {/* Unanswered alert */}
          {!isComplete && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{t('unansweredWarning')} ({unansweredCount} remaining)</span>
            </div>
          )}

          {/* Discovered Gaps Preview */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">{t('identifiedGaps')}</h3>
            <div className="space-y-2">
              {questions.map((q) => {
                const ans = assessmentDraft.answers[q.id];
                if (!ans || ans.value === 'NA' || (typeof ans.value === 'number' && ans.value >= 3)) {
                  return null;
                }
                return (
                  <div key={q.id} className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl text-xs flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-rose-900 font-mono mr-2">{q.code || q.id}:</span>
                      <span className="text-slate-800">
                        {language === 'ar' ? (q.textAr || q.questionTextAr) : (q.text || q.questionText)}
                      </span>
                      <p className="text-slate-500 text-[11px] mt-1">
                        Current level: <strong>{ans.value}/4</strong> • Weight: {q.weight}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900 shrink-0">
                      Gap Triggered
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Submission */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={() => setIsReviewMode(false)}
              className="px-4 py-2 border border-slate-300 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-50"
            >
              Continue Editing
            </button>
            <button
              disabled={!canMutate || !isComplete}
              onClick={handleFinalSubmit}
              className={`px-6 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-all ${
                isComplete && canMutate
                  ? 'bg-teal-700 hover:bg-teal-800'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{t('submitAssessment')}</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'stepper' ? (
        /* STEPPER VIEW */
        <div className="space-y-6">
          {/* Question dot navigator */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const ans = assessmentDraft.answers[q.id];
                const isAnswered = ans !== undefined;
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-teal-800 text-white ring-2 ring-teal-400'
                        : isAnswered
                        ? 'bg-teal-100 text-teal-900 hover:bg-teal-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title={`${q.code}: ${language === 'ar' ? q.textAr : q.text}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-semibold text-slate-600 shrink-0 px-2">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>

          {/* Active Question Card */}
          {currentQuestion && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              {/* Question Header & Meta */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                      {currentQuestion.code}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      currentQuestion.weight === 3
                        ? 'bg-rose-100 text-rose-900'
                        : currentQuestion.weight === 2
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t('questionWeight')}: {currentQuestion.weight} ({currentQuestion.weight === 3 ? 'Critical' : currentQuestion.weight === 2 ? 'Important' : 'Standard'})
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Group: {language === 'ar' ? currentQuestion.groupAr : currentQuestion.group}
                    </span>
                  </div>

                  <h2 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                    {language === 'ar' ? currentQuestion.textAr : currentQuestion.text}
                  </h2>
                </div>
              </div>

              {/* Rationale & Evidence Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">{t('businessExplanation')}</span>
                  <p className="text-slate-600 leading-relaxed">
                    {language === 'ar'
                      ? (currentQuestion.explanationAr || currentQuestion.businessExplanationAr)
                      : (currentQuestion.explanation || currentQuestion.businessExplanation)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">{t('requiredEvidence')}</span>
                  <p className="text-slate-600 leading-relaxed font-medium text-teal-900">
                    {language === 'ar'
                      ? (currentQuestion.requiredEvidenceAr || currentQuestion.evidenceRequirementAr)
                      : (currentQuestion.requiredEvidence || currentQuestion.evidenceRequirement)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">{t('testProcedure')}</span>
                  <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                    {language === 'ar'
                      ? (currentQuestion.testingProcedureAr || currentQuestion.testProcedureAr)
                      : (currentQuestion.testingProcedure || currentQuestion.testProcedure)}
                  </p>
                </div>
              </div>

              {/* Implementation Scale Options (0 to 4 + NA) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {t('answerScoreLabel')} *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { val: 0, labelKey: 'score0', desc: 'No established policy, control or process exists' },
                    { val: 1, labelKey: 'score1', desc: 'Informal or ad hoc practices executed inconsistently' },
                    { val: 2, labelKey: 'score2', desc: 'Defined but partially executed or missing key controls' },
                    { val: 3, labelKey: 'score3', desc: 'Consistently implemented and documented' },
                    { val: 4, labelKey: 'score4', desc: 'Fully operational, monitored, and periodically audited' },
                    { val: 'NA', labelKey: 'scoreNA', desc: 'Not applicable to company business model' }
                  ].map((option) => {
                    const isSelected = currentAnswer?.value === option.val;
                    return (
                      <button
                        key={String(option.val)}
                        type="button"
                        disabled={!canMutate}
                        onClick={() => handleAnswerChange(currentQuestion.id, option.val as any)}
                        className={`p-3 rounded-xl border text-left rtl:text-right text-xs transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-teal-700 bg-teal-50 text-teal-950 ring-2 ring-teal-700/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span>{t(option.labelKey as any)}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-teal-700 border-teal-700' : 'border-slate-300'
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal">{option.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* N/A Reason (Mandatory when NA selected) */}
              {currentAnswer?.value === 'NA' && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-amber-900">
                    {t('naReasonRequired')}
                  </label>
                  <input
                    type="text"
                    value={currentAnswer.naReason || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, 'NA', e.target.value)}
                    placeholder={t('naReasonPlaceholder')}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Contextual Notes & Evidence Linking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {/* Internal Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('commentsNotes')}
                  </label>
                  <textarea
                    rows={3}
                    value={currentAnswer?.notes || ''}
                    onChange={(e) => {
                      const val = currentAnswer?.value ?? 0;
                      handleAnswerChange(currentQuestion.id, val, currentAnswer?.naReason, e.target.value);
                    }}
                    placeholder={t('commentsPlaceholder')}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-slate-50/50"
                  />
                </div>

                {/* Evidence Linking */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      {t('linkedEvidence')}
                    </label>
                    <button
                      onClick={() => setActiveRoute('evidence_center')}
                      className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{t('uploadEvidence')}</span>
                    </button>
                  </div>

                  {evidence.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                      {t('noLinkedEvidence')}
                    </div>
                  ) : (
                    <div className="max-h-28 overflow-y-auto space-y-1.5 p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                      {evidence.map((ev) => {
                        const isLinked = (currentAnswer?.linkedEvidenceIds || []).includes(ev.id);
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => handleLinkEvidence(currentQuestion.id, ev.id)}
                            className={`w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              isLinked ? 'bg-teal-100/70 text-teal-950 font-semibold' : 'hover:bg-white text-slate-700'
                            }`}
                          >
                            <span className="truncate">{ev.fileName}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-sm ${
                              ev.reviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {ev.reviewStatus}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Prev / Next Stepper Nav */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    currentQuestionIndex === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ArrowBack className="w-3.5 h-3.5" />
                  <span>{t('previousQuestion')}</span>
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>{t('nextQuestion')}</span>
                    <ArrowNext className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsReviewMode(true)}
                    className="px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>{t('reviewSummary')}</span>
                    <ArrowNext className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* FULL LIST VIEW */
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ans = assessmentDraft.answers[q.id];
            return (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                        {q.code || q.id}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Weight: {q.weight} • {language === 'ar' ? q.groupAr : q.group}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === 'ar' ? (q.textAr || q.questionTextAr) : (q.text || q.questionText)}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                    ans !== undefined ? 'bg-teal-100 text-teal-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {ans !== undefined ? `Value: ${ans.value}` : 'Unanswered'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {[
                    { val: 0, label: '0 - Not in place' },
                    { val: 1, label: '1 - Informal' },
                    { val: 2, label: '2 - Partial' },
                    { val: 3, label: '3 - Consistent' },
                    { val: 4, label: '4 - Reviewed' },
                    { val: 'NA', label: 'N/A' }
                  ].map((btn) => (
                    <button
                      key={String(btn.val)}
                      type="button"
                      disabled={!canMutate}
                      onClick={() => handleAnswerChange(q.id, btn.val as any)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                        ans?.value === btn.val
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
