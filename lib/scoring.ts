import { Question, QuestionAnswer, RiskSeverity, EvidenceRecord, MethodologyConfig, ModuleDefinition, Assessment } from './types';

export interface ScoreBreakdown {
  score: number | null;
  scoreLabel?: string;
  totalQuestions: number;
  answeredCount: number;
  applicableCount: number;
  naCount: number;
  unansweredCount: number;
  weightedScoreSum: number;
  maxPossibleWeightedScore: number;
  totalApplicableWeight: number;
  maxPossibleWeightedSum: number;
  completionPercentage: number;
  answeredRatio: number;
  isComplete: boolean;
}

export interface GeneratedGap {
  id: string;
  moduleId: string;
  questionId: string;
  controlId: string;
  riskId: string;
  type: 'implementation' | 'evidence_missing';
  severity: RiskSeverity;
  sourceAnswer: number | 'NA';
  weight: number;
  description: string;
  descriptionAr: string;
  controlTitle: string;
  controlTitleAr: string;
  hasAcceptedEvidence: boolean;
}

/**
 * Calculates a module score following the deterministic illustrative formula:
 * completed module score = round(100 * sum(weight * answerValue) / (4 * sum(applicable weights)))
 */
export function calculateModuleScore(
  questions: Question[],
  answers: Record<string, QuestionAnswer>,
  weightsOverride?: Record<string, number>
): ScoreBreakdown {
  let weightedScoreSum = 0;
  let applicableWeightSum = 0;
  let answeredCount = 0;
  let applicableCount = 0;
  let naCount = 0;
  let unansweredCount = 0;

  for (const q of questions) {
    const ans = answers[q.id];
    const weight = weightsOverride?.[q.id] ?? q.weight;

    if (!ans || ans.value === undefined) {
      unansweredCount++;
      continue;
    }

    if (ans.value === 'NA') {
      naCount++;
      continue;
    }

    // It is an answered numeric value (0..4)
    answeredCount++;
    applicableCount++;
    applicableWeightSum += weight;
    weightedScoreSum += weight * ans.value;
  }

  const totalQuestions = questions.length;
  const isComplete = unansweredCount === 0;
  const completionPercentage = totalQuestions > 0 ? Math.round(((answeredCount + naCount) / totalQuestions) * 100) : 0;

  if (applicableCount === 0 && naCount > 0 && isComplete) {
    return {
      score: null,
      scoreLabel: 'Insufficient applicable data',
      totalQuestions,
      answeredCount,
      applicableCount,
      naCount,
      unansweredCount,
      weightedScoreSum: 0,
      maxPossibleWeightedScore: 0,
      totalApplicableWeight: 0,
      maxPossibleWeightedSum: 0,
      completionPercentage,
      answeredRatio: completionPercentage,
      isComplete,
    };
  }

  if (applicableWeightSum === 0) {
    return {
      score: null,
      scoreLabel: 'No applicable questions',
      totalQuestions,
      answeredCount,
      applicableCount,
      naCount,
      unansweredCount,
      weightedScoreSum: 0,
      maxPossibleWeightedScore: 0,
      totalApplicableWeight: 0,
      maxPossibleWeightedSum: 0,
      completionPercentage,
      answeredRatio: completionPercentage,
      isComplete,
    };
  }

  const maxPossible = 4 * applicableWeightSum;
  const rawScore = (100 * weightedScoreSum) / maxPossible;
  const finalScore = Math.round(rawScore);

  return {
    score: finalScore,
    totalQuestions,
    answeredCount,
    applicableCount,
    naCount,
    unansweredCount,
    weightedScoreSum,
    maxPossibleWeightedScore: maxPossible,
    totalApplicableWeight: applicableWeightSum,
    maxPossibleWeightedSum: maxPossible,
    completionPercentage,
    answeredRatio: completionPercentage,
    isComplete,
  };
}

/**
 * Returns provisional maturity band for a score.
 */
export function getMaturityBand(
  score: number | null,
  config?: MethodologyConfig
): { band: string; bandAr: string; color: string; desc: string; descAr: string } {
  if (score === null || score === undefined) {
    return {
      band: 'Not Assessed',
      bandAr: 'غير مقيم',
      color: 'text-slate-500 bg-slate-100 border-slate-200',
      desc: 'No completed assessment data',
      descAr: 'لا توجد بيانات تقييم مكتملة',
    };
  }

  if (score >= 85) {
    return {
      band: 'Optimizing',
      bandAr: 'متميز ومستمر التحسين',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      desc: 'Robust proactive internal controls with continuous monitoring',
      descAr: 'ضوابط داخلية قوية واستباقية مع مراجعة دورية منتظمة',
    };
  } else if (score >= 70) {
    return {
      band: 'Managed',
      bandAr: 'مُدار ومضبوط',
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      desc: 'Standardized controls in place and actively tracked',
      descAr: 'ضوابط موحدة معتمدة ومتابعة بشكل فعال ومستمر',
    };
  } else if (score >= 50) {
    return {
      band: 'Defined',
      bandAr: 'محدد ومنظم',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      desc: 'Procedures documented with partial implementation',
      descAr: 'إجراءات موثقة ومعتمدة مع تطبيق جزئي للضوابط',
    };
  } else if (score >= 25) {
    return {
      band: 'Developing',
      bandAr: 'قيد التطوير',
      color: 'text-orange-700 bg-orange-50 border-orange-200',
      desc: 'Informal or ad-hoc financial practices with significant gaps',
      descAr: 'ممارسات مالية غير رسمية أو متفاوتة مع وجود فجوات هامة',
    };
  } else {
    return {
      band: 'Initial',
      bandAr: 'مبدئي',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      desc: 'Unstructured controls with critical financial risks',
      descAr: 'ضوابط غير مهيكلة ومخاطر مالية حرجة تتطلب معالجة فورية',
    };
  }
}

/**
 * Calculates portfolio governance score: equal-weight mean of latest completed scores
 */
export function calculatePortfolioGovernanceScore(
  moduleScores: { moduleId: string; score: number | null }[],
  selectedModuleIds: string[]
): { score: number | null; assessedCount: number; totalSelected: number } {
  const selectedScores = moduleScores.filter(
    (m) => selectedModuleIds.includes(m.moduleId) && m.score !== null
  );

  const totalSelected = selectedModuleIds.length;
  const assessedCount = selectedScores.length;

  if (assessedCount === 0) {
    return { score: null, assessedCount: 0, totalSelected };
  }

  const sum = selectedScores.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avg = Math.round(sum / assessedCount);

  return { score: avg, assessedCount, totalSelected };
}

/**
 * Deterministically generates gaps according to the prompt's severity rules:
 * - Answer below 3 (0, 1, 2) -> implementation gap
 * - Answer 3 or 4 without accepted required evidence -> evidence gap
 * Severity:
 * - weight 3 and answer 0 -> Critical
 * - weight 3 and answer 1-2 -> High
 * - weight 2 and answer 0-1 -> High
 * - other implementation gaps -> Medium
 * - evidence-only gap -> Medium
 */
export function generateGapsForAssessment(
  questions: Question[],
  answers: Record<string, QuestionAnswer>,
  evidenceRecords: EvidenceRecord[],
  weightsOverride?: Record<string, number>
): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  for (const q of questions) {
    const ans = answers[q.id];
    if (!ans || ans.value === 'NA' || ans.value === undefined) continue;

    const weight = weightsOverride?.[q.id] ?? q.weight;
    const value = ans.value;

    // Check if there is at least one approved evidence for this control/question
    const hasApprovedEvidence = evidenceRecords.some(
      (e) =>
        e.moduleId === q.moduleId &&
        e.reviewStatus === 'approved' &&
        (e.controlId === q.controlId || ans.linkedEvidenceIds?.includes(e.id))
    );

    if (value < 3) {
      // Implementation Gap
      let severity: RiskSeverity = 'medium';
      if (weight === 3 && value === 0) {
        severity = 'critical';
      } else if (weight === 3 && (value === 1 || value === 2)) {
        severity = 'high';
      } else if (weight === 2 && (value === 0 || value === 1)) {
        severity = 'high';
      } else {
        severity = 'medium';
      }

      gaps.push({
        id: `gap-impl-${q.id}`,
        moduleId: q.moduleId,
        questionId: q.id,
        controlId: q.controlId,
        riskId: q.riskId,
        type: 'implementation',
        severity,
        sourceAnswer: value,
        weight,
        description: `Control implementation is weak (${getAnswerText(value, 'en')}). ${q.businessExplanation}`,
        descriptionAr: `تطبيق الضابط ضعيف (${getAnswerText(value, 'ar')}). ${q.businessExplanationAr}`,
        controlTitle: q.testProcedure,
        controlTitleAr: q.testProcedureAr,
        hasAcceptedEvidence: hasApprovedEvidence,
      });
    } else if ((value === 3 || value === 4) && !hasApprovedEvidence) {
      // Evidence-only gap
      gaps.push({
        id: `gap-evid-${q.id}`,
        moduleId: q.moduleId,
        questionId: q.id,
        controlId: q.controlId,
        riskId: q.riskId,
        type: 'evidence_missing',
        severity: 'medium',
        sourceAnswer: value,
        weight,
        description: `Control reported as implemented (${getAnswerText(value, 'en')}), but verified supporting evidence is missing. Required: ${q.evidenceRequirement}`,
        descriptionAr: `الضابط مسجل بأنه مطبق (${getAnswerText(value, 'ar')}) ولكن ينقصه مستند مؤيد معتمد. المطلوب: ${q.evidenceRequirementAr}`,
        controlTitle: q.testProcedure,
        controlTitleAr: q.testProcedureAr,
        hasAcceptedEvidence: false,
      });
    }
  }

  return gaps;
}

/**
 * Calculates evidence coverage:
 * controls with at least one accepted, linked evidence record / applicable controls requiring evidence * 100
 */
export function calculateEvidenceCoverage(
  questions: Question[],
  answers: Record<string, QuestionAnswer>,
  evidenceRecords: EvidenceRecord[]
): number {
  const applicableQuestions = questions.filter((q) => {
    const ans = answers[q.id];
    return ans && ans.value !== 'NA' && ans.value !== undefined;
  });

  if (applicableQuestions.length === 0) return 0;

  let verifiedCount = 0;
  for (const q of applicableQuestions) {
    const hasApproved = evidenceRecords.some(
      (e) =>
        e.moduleId === q.moduleId &&
        e.reviewStatus === 'approved' &&
        (e.controlId === q.controlId || answers[q.id]?.linkedEvidenceIds?.includes(e.id))
    );
    if (hasApproved) verifiedCount++;
  }

  return Math.round((verifiedCount / applicableQuestions.length) * 100);
}

export function getAnswerText(val: number | 'NA', lang: 'en' | 'ar'): string {
  if (val === 0) return lang === 'ar' ? 'غير مطبق إطلاقاً' : 'Not in place';
  if (val === 1) return lang === 'ar' ? 'ممارسات غير رسمية / متباينة' : 'Informal / ad hoc';
  if (val === 2) return lang === 'ar' ? 'مطبق جزئياً' : 'Partially implemented';
  if (val === 3) return lang === 'ar' ? 'مطبق بشكل ثابت ومنتظم' : 'Implemented consistently';
  if (val === 4) return lang === 'ar' ? 'مطبق ويُراجع دورياً' : 'Implemented & periodically reviewed';
  if (val === 'NA') return lang === 'ar' ? 'غير منطبق' : 'Not applicable';
  return '';
}

export interface AssessmentCoverageResult {
  percentage: number;
  completedCount: number;
  totalCount: number;
  draftCount: number;
}

export interface MaturityLevelInfo {
  level: number;
  label: string;
  labelAr: string;
  band: string;
  bandAr: string;
  color: string;
  description: string;
  descriptionAr: string;
}

/**
 * Calculates overall governance score across assessments.
 * Accepts either (modules, assessments, moduleWeights) or (moduleScores, selectedModuleIds)
 */
export function calculateOverallGovernanceScore(
  modulesOrScores: any[],
  assessmentsOrIds?: any,
  moduleWeights?: Record<string, number>
): any {
  if (!modulesOrScores || modulesOrScores.length === 0) return null;

  // If first item has 'score' property and is not a ModuleDefinition
  if ('score' in modulesOrScores[0] && !('questions' in modulesOrScores[0])) {
    const ids = assessmentsOrIds && Array.isArray(assessmentsOrIds) && assessmentsOrIds.length > 0
      ? assessmentsOrIds
      : modulesOrScores.map((m) => m.moduleId);
    return calculatePortfolioGovernanceScore(modulesOrScores, ids);
  }

  // Called as (modules: ModuleDefinition[], assessments: Assessment[], moduleWeights?: Record<string, number>)
  const modules = modulesOrScores as ModuleDefinition[];
  const assessments = (assessmentsOrIds || []) as Assessment[];

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let hasCompleted = false;

  for (const mod of modules) {
    const modAss = assessments.find((a) => a.moduleId === mod.id && a.status === 'completed');
    if (modAss && modAss.score !== null && modAss.score !== undefined) {
      hasCompleted = true;
      const weight = moduleWeights?.[mod.id] ?? 1;
      totalWeightedScore += modAss.score * weight;
      totalWeight += weight;
    }
  }

  if (!hasCompleted || totalWeight === 0) return null;
  return Math.round(totalWeightedScore / totalWeight);
}

/**
 * Calculates assessment coverage percentage or detailed metrics.
 * Accepts either (modules, assessments) or (moduleScores, totalModulesCount)
 */
export function calculateAssessmentCoverage(
  modulesOrScores: any[],
  assessmentsOrCount: any
): any {
  if (typeof assessmentsOrCount === 'number') {
    if (assessmentsOrCount === 0) return 0;
    const completed = modulesOrScores.filter((m) => m.score !== null).length;
    return Math.round((completed / assessmentsOrCount) * 100);
  }

  const modules = modulesOrScores as ModuleDefinition[];
  const assessments = (assessmentsOrCount || []) as Assessment[];
  const totalCount = modules.length;
  const completedCount = assessments.filter((a) => a.status === 'completed').length;
  const draftCount = assessments.filter((a) => a.status === 'draft').length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    percentage,
    completedCount,
    totalCount,
    draftCount
  };
}

/**
 * Maturity label helper
 */
export function getMaturityLevel(
  score: number | null | undefined,
  thresholds?: any
): MaturityLevelInfo {
  if (score === null || score === undefined) {
    return {
      level: 0,
      label: 'Not Assessed',
      labelAr: 'غير مقيم',
      band: 'Not Assessed',
      bandAr: 'غير مقيم',
      color: 'text-slate-600 bg-slate-100 border-slate-200',
      description: 'No completed assessment data yet.',
      descriptionAr: 'لا توجد بيانات تقييم مكتملة حتى الآن.',
    };
  }

  const t85 = thresholds?.optimizing ?? 85;
  const t70 = thresholds?.managed ?? 70;
  const t50 = thresholds?.defined ?? 50;
  const t25 = thresholds?.developing ?? 25;

  if (score >= t85) {
    return {
      level: 5,
      label: 'Optimizing',
      labelAr: 'متميز ومستمر التحسين',
      band: 'Optimizing',
      bandAr: 'متميز ومستمر التحسين',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: 'Robust proactive internal controls with continuous monitoring and automated safeguards.',
      descriptionAr: 'ضوابط داخلية قوية واستباقية مع مراجعة دورية منتظمة وحماية آلية متقدمة.',
    };
  } else if (score >= t70) {
    return {
      level: 4,
      label: 'Managed',
      labelAr: 'مُدار ومضبوط',
      band: 'Managed',
      bandAr: 'مُدار ومضبوط',
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      description: 'Standardized controls in place across workflows and actively tracked by management.',
      descriptionAr: 'ضوابط موحدة معتمدة ومتابعة بشكل فعال ومستمر من الإدارة.',
    };
  } else if (score >= t50) {
    return {
      level: 3,
      label: 'Defined',
      labelAr: 'محدد ومنظم',
      band: 'Defined',
      bandAr: 'محدد ومنظم',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      description: 'Procedures documented with partial implementation and inconsistent enforcement.',
      descriptionAr: 'إجراءات موثقة ومعتمدة مع تطبيق جزئي للضوابط وتفاوت في الالتزام.',
    };
  } else if (score >= t25) {
    return {
      level: 2,
      label: 'Developing',
      labelAr: 'قيد التطوير',
      band: 'Developing',
      bandAr: 'قيد التطوير',
      color: 'text-orange-700 bg-orange-50 border-orange-200',
      description: 'Informal or ad-hoc financial practices with significant operational exposure.',
      descriptionAr: 'ممارسات مالية غير رسمية أو متفاوتة مع وجود فجوات تشغيلية هامة.',
    };
  } else {
    return {
      level: 1,
      label: 'Initial',
      labelAr: 'مبدئي',
      band: 'Initial',
      bandAr: 'مبدئي',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      description: 'Unstructured controls with critical financial risks requiring immediate remediation.',
      descriptionAr: 'ضوابط غير مهيكلة ومخاطر مالية حرجة تتطلب معالجة فورية.',
    };
  }
}

/**
 * Maturity color CSS helper
 */
export function getMaturityColorClass(levelOrScore: number | string | null | undefined): string {
  if (levelOrScore === null || levelOrScore === undefined || levelOrScore === 0 || levelOrScore === '0') {
    return 'text-slate-600 bg-slate-100 border-slate-200';
  }
  if (levelOrScore === 5 || levelOrScore === '5' || levelOrScore === 'Optimizing') {
    return 'text-emerald-700 bg-emerald-100/80 border-emerald-200';
  }
  if (levelOrScore === 4 || levelOrScore === '4' || levelOrScore === 'Managed') {
    return 'text-teal-800 bg-teal-100/80 border-teal-200';
  }
  if (levelOrScore === 3 || levelOrScore === '3' || levelOrScore === 'Defined') {
    return 'text-amber-800 bg-amber-100/80 border-amber-200';
  }
  if (levelOrScore === 2 || levelOrScore === '2' || levelOrScore === 'Developing') {
    return 'text-orange-800 bg-orange-100/80 border-orange-200';
  }
  if (levelOrScore === 1 || levelOrScore === '1' || levelOrScore === 'Initial') {
    return 'text-rose-800 bg-rose-100/80 border-rose-200';
  }
  const s = Number(levelOrScore);
  if (!isNaN(s)) {
    if (s >= 85) return 'text-emerald-700 bg-emerald-100/80 border-emerald-200';
    if (s >= 70) return 'text-teal-800 bg-teal-100/80 border-teal-200';
    if (s >= 50) return 'text-amber-800 bg-amber-100/80 border-amber-200';
    if (s >= 25) return 'text-orange-800 bg-orange-100/80 border-orange-200';
    return 'text-rose-800 bg-rose-100/80 border-rose-200';
  }
  return 'text-slate-600 bg-slate-100 border-slate-200';
}

/**
 * Identify gaps for an assessment or questions list
 */
export function identifyGapsForAssessment(
  modOrQuestions: any,
  asmtOrAnswers: any,
  evidenceRecordsOrMap?: any,
  weightsOverride?: Record<string, number>
): any[] {
  // If called as (module: ModuleDefinition, assessment: Assessment, evidenceByControl?: Map<string, string[]>)
  if (modOrQuestions && 'questions' in modOrQuestions) {
    const mod = modOrQuestions as ModuleDefinition;
    const asmt = asmtOrAnswers as Assessment;
    const questions = mod.questions || [];
    const answers = asmt?.answers || {};

    const gaps: any[] = [];
    for (const q of questions) {
      const ans = answers[q.id];
      if (!ans || ans.value === 'NA' || ans.value === undefined) continue;

      const weight = weightsOverride?.[q.id] ?? q.weight;
      const value = ans.value;

      let hasApprovedEvidence = false;
      if (evidenceRecordsOrMap instanceof Map) {
        hasApprovedEvidence = evidenceRecordsOrMap.has(q.controlId) && (evidenceRecordsOrMap.get(q.controlId)?.length ?? 0) > 0;
      } else if (Array.isArray(evidenceRecordsOrMap)) {
        hasApprovedEvidence = evidenceRecordsOrMap.some(
          (e: any) =>
            e.moduleId === q.moduleId &&
            e.reviewStatus === 'approved' &&
            (e.controlId === q.controlId || ans.linkedEvidenceIds?.includes(e.id))
        );
      }

      const ctrl = mod.controls?.find((c) => c.id === q.controlId);
      const controlCode = ctrl?.code || q.controlId;
      const controlTitle = ctrl?.title || q.testProcedure || q.text;
      const controlTitleAr = ctrl?.titleAr || q.testProcedureAr || q.textAr;

      if (value < 3) {
        let severity: RiskSeverity = 'medium';
        if (weight === 3 && value === 0) {
          severity = 'critical';
        } else if (weight === 3 && (value === 1 || value === 2)) {
          severity = 'high';
        } else if (weight === 2 && (value === 0 || value === 1)) {
          severity = 'high';
        } else {
          severity = 'medium';
        }

        gaps.push({
          id: `gap-impl-${q.id}`,
          moduleId: q.moduleId,
          questionId: q.id,
          controlId: q.controlId,
          controlCode,
          riskId: q.riskId,
          gapType: 'implementation',
          type: 'implementation',
          severity,
          sourceAnswer: value,
          weight,
          description: `Control implementation is weak (${getAnswerText(value, 'en')}). ${q.businessExplanation || q.text}`,
          descriptionAr: `تطبيق الضابط ضعيف (${getAnswerText(value, 'ar')}). ${q.businessExplanationAr || q.textAr}`,
          controlTitle,
          controlTitleAr,
          businessImpact: q.businessExplanation || `High operational exposure due to inadequate ${controlTitle}.`,
          businessImpactAr: q.businessExplanationAr || `مخاطر تشغيلية عالية ناتجة عن عدم كفاية ${controlTitleAr}.`,
          recommendation: q.testProcedure || `Implement documented procedure and supervisory validation for ${controlTitle}.`,
          recommendationAr: q.testProcedureAr || `تطبيق إجراءات موثقة ومراجعة إشرافية للضابط ${controlTitleAr}.`,
          hasAcceptedEvidence: hasApprovedEvidence,
        });
      } else if ((value === 3 || value === 4) && !hasApprovedEvidence) {
        gaps.push({
          id: `gap-evid-${q.id}`,
          moduleId: q.moduleId,
          questionId: q.id,
          controlId: q.controlId,
          controlCode,
          riskId: q.riskId,
          gapType: 'evidence',
          type: 'evidence_missing',
          severity: 'medium',
          sourceAnswer: value,
          weight,
          description: `Control reported as implemented (${getAnswerText(value, 'en')}), but verified supporting evidence is missing. Required: ${q.evidenceRequirement}`,
          descriptionAr: `الضابط مسجل بأنه مطبق (${getAnswerText(value, 'ar')}) ولكن ينقصه مستند مؤيد معتمد. المطلوب: ${q.evidenceRequirementAr}`,
          controlTitle,
          controlTitleAr,
          businessImpact: `Audit exception risk due to absence of verified documentary artifacts for ${controlTitle}.`,
          businessImpactAr: `مخاطر ملاحظات مراجعة حسابات بسبب غياب الأدلة المستندية المعتمدة للضابط ${controlTitleAr}.`,
          recommendation: `Upload and approve required audit documentation: ${q.evidenceRequirement || 'Standard procedure proof'}.`,
          recommendationAr: `رفع واعتماد المستندات الثبوتية المطلوبة: ${q.evidenceRequirementAr || 'إثبات تطبيق الإجراء'}.`,
          hasAcceptedEvidence: false,
        });
      }
    }
    return gaps;
  }

  // Otherwise called as (questions, answers, evidenceRecords, weightsOverride)
  return generateGapsForAssessment(modOrQuestions, asmtOrAnswers, evidenceRecordsOrMap || [], weightsOverride);
}

/**
 * Export generated gaps to formatted CSV
 */
export function exportGapsCSV(gaps: any[]): string {
  const headers = ['Gap ID', 'Module ID', 'Type', 'Severity', 'Weight', 'Control Procedure', 'Description', 'Verified Evidence'];
  const rows = gaps.map((g) => [
    `"${g.id}"`,
    `"${g.moduleId}"`,
    `"${g.type || g.gapType || ''}"`,
    `"${g.severity}"`,
    `"${g.weight}"`,
    `"${(g.controlTitle || g.recommendation || '').replace(/"/g, '""')}"`,
    `"${(g.description || '').replace(/"/g, '""')}"`,
    `"${g.hasAcceptedEvidence ? 'Yes' : 'No'}"`
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

