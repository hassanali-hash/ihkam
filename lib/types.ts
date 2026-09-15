export type Language = 'en' | 'ar';

export type UserRole = 'admin' | 'finance_manager' | 'reviewer' | 'viewer';

export interface User {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatarUrl?: string;
  title: string;
  titleAr?: string;
}

export type Industry =
  | 'trading_distribution'
  | 'professional_services'
  | 'retail'
  | 'manufacturing'
  | 'construction'
  | 'hospitality'
  | 'other';

export type ErpSystem =
  | 'odoo'
  | 'sap'
  | 'oracle'
  | 'microsoft_dynamics'
  | 'spreadsheets'
  | 'other'
  | 'none';

export interface Company {
  id: string;
  name: string;
  nameAr: string;
  industry: Industry;
  country: string;
  countryAr: string;
  currency: string;
  employeeRange: string;
  annualRevenueRange: string;
  branchCount: number;
  mainActivities: string;
  mainActivitiesAr: string;
  erpSystem: ErpSystem;
  challenges: string[];
  selectedModuleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type QuestionScore = 0 | 1 | 2 | 3 | 4 | 'NA' | number;

export interface QuestionAnswer {
  questionId: string;
  value: QuestionScore;
  naReason?: string;
  comment?: string;
  notes?: string;
  linkedEvidenceIds?: string[];
  updatedAt?: string;
}

export type AssessmentAnswer = QuestionAnswer;
export type QuestionWeight = number;
export type AssessmentStatus = 'draft' | 'completed';


export interface Question {
  id: string;
  code?: string;
  moduleId: string;
  group: string;
  groupAr: string;
  questionText: string;
  questionTextAr: string;
  text?: string;
  textAr?: string;
  title?: string;
  titleAr?: string;
  businessExplanation: string;
  businessExplanationAr: string;
  explanation?: string;
  explanationAr?: string;
  weight: number;
  controlId: string;
  riskId: string;
  evidenceRequirement: string;
  evidenceRequirementAr: string;
  requiredEvidence?: string;
  requiredEvidenceAr?: string;
  testProcedure: string;
  testProcedureAr: string;
  testingProcedure?: string;
  testingProcedureAr?: string;
  recommendationId: string;
  suggestedRole: string;
  suggestedRoleAr: string;
  reviewFrequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | 'per_transaction';
  allowsNA?: boolean;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  nameAr: string;
  title?: string;
  titleAr?: string;
  category?: string;
  categoryAr?: string;
  shortDesc: string;
  shortDescAr: string;
  description: string;
  descriptionAr: string;
  typicalChallenges: string[];
  typicalChallengesAr: string[];
  suggestedRationale: string;
  suggestedRationaleAr: string;
  iconName: string;
  qualitativeBenefits: string[];
  qualitativeBenefitsAr: string[];
  questions: Question[];
  controls?: ControlDefinition[];
}

export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Risk {
  id: string;
  moduleId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  severity: RiskSeverity;
  controlId: string;
}

export interface ControlDefinition {
  id: string;
  code: string;
  moduleId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  responsibleRole: string;
  responsibleRoleAr?: string;
  reviewFrequency: string;
  testingProcedure: string;
  testingProcedureAr: string;
  evidenceRequirement?: string;
  evidenceRequirementAr?: string;
}

export type TestResult = 'pass' | 'fail' | 'inconclusive' | 'Pass' | 'Fail' | 'Inconclusive';

export interface Control {
  id: string;
  moduleId: string;
  title: string;
  titleAr: string;
  objective: string;
  objectiveAr: string;
  implementationGuidance: string;
  implementationGuidanceAr: string;
  ownerRole: string;
  ownerRoleAr: string;
  frequency: string;
  frequencyAr: string;
  evidenceNeeded: string;
  evidenceNeededAr: string;
  testingProcedure: string;
  testingProcedureAr: string;
  qualitativeBenefit: string;
  qualitativeBenefitAr: string;
}

export interface TestRun {
  id: string;
  controlId: string;
  moduleId?: string;
  companyId: string;
  testDate: string;
  testerName?: string;
  testedBy?: string;
  sampleSize: number;
  exceptionsCount: number;
  result: TestResult;
  notes: string;
}

export type EvidenceReviewStatus = 'pending' | 'approved' | 'rejected';

export interface EvidenceRecord {
  id: string;
  companyId: string;
  moduleId: string;
  controlId?: string;
  title?: string;
  titleAr?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  reviewStatus: EvidenceReviewStatus;
  reviewNotes?: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  isSeed?: boolean;
  blobKey?: string; // key in IndexedDB
  previewText?: string; // For text/csv/seed preview
}

export interface ActionComment {
  id: string;
  authorName: string;
  authorRole?: string;
  text: string;
  createdAt: string;
}

export type ActionStatus = 'todo' | 'in_progress' | 'awaiting_review' | 'completed';
export type ActionPriority = RiskSeverity;

export interface CorrectiveAction {
  id: string;
  companyId: string;
  moduleId: string;
  riskId?: string;
  controlId?: string;
  questionId?: string;
  title: string;
  titleAr?: string;
  description: string;
  priority: RiskSeverity;
  ownerId?: string;
  ownerName: string;
  ownerRole?: string;
  dueDate: string;
  status: ActionStatus;
  comments?: ActionComment[];
  evidenceIds?: string[];
  completionNotes?: string;
  reviewerApproved?: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type GapSeverity = RiskSeverity;

export interface IdentifiedGap {
  id: string;
  moduleId: string;
  questionId: string;
  controlId: string;
  controlCode?: string;
  riskId?: string;
  gapType?: 'implementation' | 'evidence' | 'evidence_missing' | string;
  type?: 'implementation' | 'evidence_missing' | string;
  severity: GapSeverity;
  sourceAnswer?: number | 'NA';
  weight: number;
  description: string;
  descriptionAr?: string;
  controlTitle?: string;
  controlTitleAr?: string;
  businessImpact?: string;
  businessImpactAr?: string;
  recommendation?: string;
  recommendationAr?: string;
  hasAcceptedEvidence?: boolean;
  [key: string]: any;
}

export interface Recommendation {
  id: string;
  moduleId: string;
  questionId: string;
  title: string;
  titleAr: string;
  priority: RiskSeverity;
  rationale: string;
  rationaleAr: string;
  triggerCondition: string;
  suggestedControlId: string;
  evidenceNeeded: string;
  evidenceNeededAr: string;
  suggestedOwner: string;
  suggestedOwnerAr: string;
  qualitativeBenefit: string;
  qualitativeBenefitAr: string;
  dismissed?: boolean;
  dismissReason?: string;
}

export interface Assessment {
  id: string;
  companyId: string;
  moduleId: string;
  ruleVersion: string;
  status: 'draft' | 'completed';
  score: number | null; // calculated deterministic score (0-100) or null if all N/A
  scoreLabel?: string; // e.g. "Insufficient applicable data"
  answers: Record<string, QuestionAnswer>;
  createdAt: string;
  completedAt?: string;
  createdBy: string;
  notes?: string;
  version: number;
}

export interface GovernancePlanSnapshot {
  id: string;
  companyId: string;
  version: number;
  title?: string;
  titleAr?: string;
  executiveSummary: string;
  executiveSummaryAr?: string;
  methodologyVersion?: string;
  generatedAt: string;
  generatedBy?: string;
  portfolioScore?: number | null;
  overallScore?: number | null;
  maturityBand?: string;
  maturityLevel?: number | string;
  moduleScores?: { moduleId: string; score: number | null; coverage: number }[];
  keyGapsCount?: number;
  actionsCount?: number;
  evidenceCoverage?: number;
  roadmap30?: string[];
  roadmap60?: string[];
  roadmap90?: string[];
}

export interface IhkamService {
  id: string;
  moduleId: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  purpose: string;
  purposeAr: string;
  deliverables: string[];
  deliverablesAr: string[];
  targetGaps: string[];
  expectedBenefits: string;
  expectedBenefitsAr: string;
}

export interface ServiceRequest {
  id: string;
  companyId: string;
  serviceId?: string;
  serviceTitle: string;
  contactName: string;
  email?: string;
  contactEmail?: string;
  preferredDate?: string;
  notes?: string;
  status?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  companyId: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  link?: string;
  read: boolean;
  createdAt: string;
  type: 'action' | 'evidence' | 'assessment' | 'plan' | 'system';
}

export interface AuditLogEntry {
  id: string;
  companyId: string;
  actorName: string;
  userName?: string;
  userRole?: string;
  action: string;
  recordType: string;
  recordId: string;
  details: string;
  timestamp: string;
}

export interface MethodologyConfig {
  version: string;
  status: 'approved' | 'draft' | 'changes_requested';
  questionWeights: Record<string, number>;
  moduleWeights?: Record<string, number>;
  maturityThresholds: {
    initial?: [number, number];
    developing?: [number, number];
    defined?: [number, number];
    managed?: [number, number];
    optimizing?: [number, number];
    [key: string]: any;
  } | Record<string | number, any>;
  reviewerNotes: string;
  updatedAt: string;
  updatedBy: string;
}

export interface MonitoringTransaction {
  id: string;
  date: string;
  reference: string;
  amount: number;
  currency: string;
  department: string;
  anomalies: string[];
}
