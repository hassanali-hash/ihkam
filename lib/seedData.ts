import {
  Company,
  User,
  Assessment,
  CorrectiveAction,
  EvidenceRecord,
  TestRun,
  GovernancePlanSnapshot,
  IhkamService,
  NotificationItem,
  AuditLogEntry,
  MethodologyConfig,
  MonitoringTransaction
} from './types';
import { MODULES_LIST } from './modulesData';
import { calculateModuleScore } from './scoring';

export const SEED_COMPANIES: Company[] = [
  {
    id: 'comp-alnoor-01',
    name: 'Al Noor Trading Company',
    nameAr: 'شركة النور التجارية',
    industry: 'trading_distribution',
    country: 'Saudi Arabia',
    countryAr: 'المملكة العربية السعودية',
    currency: 'SAR',
    employeeRange: '50-100',
    annualRevenueRange: '10M-25M SAR',
    branchCount: 3,
    mainActivities: 'Importation and wholesale distribution of commercial goods, FMCG, and industrial equipment.',
    mainActivitiesAr: 'استيراد وتوزيع السلع التجارية والمواد الاستهلاكية وتوريدات المعدات الصناعية بالجملة.',
    erpSystem: 'odoo',
    challenges: [
      'Informal approvals and paper vouchers across branches',
      'Unreconciled employee travel advances and petty cash floats',
      'Supplier bank change verification weaknesses',
      'Audit readiness for ZATCA Phase 2 integration'
    ],
    selectedModuleIds: [
      'expense_management',
      'procurement',
      'inventory',
      'revenue',
      'payroll',
      'treasury',
      'financial_reporting',
      'tax_compliance'
    ],
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-09-10T14:30:00Z'
  },
  {
    id: 'comp-almanar-02',
    name: 'Al Manar Advisory Services',
    nameAr: 'شركة المنار للخدمات الاستشارية',
    industry: 'professional_services',
    country: 'Saudi Arabia',
    countryAr: 'المملكة العربية السعودية',
    currency: 'SAR',
    employeeRange: '10-25',
    annualRevenueRange: '3M-5M SAR',
    branchCount: 1,
    mainActivities: 'Management consulting, feasibility studies, and specialized corporate advisory.',
    mainActivitiesAr: 'الاستشارات الإدارية ودراسات الجدوى والاستشارات المؤسسية المتخصصة.',
    erpSystem: 'spreadsheets',
    challenges: [
      'Managing client billing milestones and credit terms',
      'Transitioning from spreadsheets to structured accounting software'
    ],
    selectedModuleIds: [
      'expense_management',
      'revenue',
      'payroll',
      'tax_compliance'
    ],
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-01T11:00:00Z'
  }
];

export const SEED_USERS: User[] = [
  {
    id: 'usr-admin-01',
    name: 'Tariq Al-Ghamdi',
    nameAr: 'طارق الغامدي',
    email: 'tariq.ghamdi@alnoortrading.com',
    role: 'admin',
    title: 'Managing Director / CEO',
    titleAr: 'المدير العام والرئيس التنفيذي'
  },
  {
    id: 'usr-finance-02',
    name: 'Sarah Al-Otaibi',
    nameAr: 'سارة العتيبي',
    email: 'sarah.otaibi@alnoortrading.com',
    role: 'finance_manager',
    title: 'Finance Manager',
    titleAr: 'مديرة الإدارة المالية والحسابات'
  },
  {
    id: 'usr-reviewer-03',
    name: 'Dr. Khalid Mansoor',
    nameAr: 'د. خالد منصور',
    email: 'khalid.mansoor@ihkam-expert.com',
    role: 'reviewer',
    title: 'Senior Financial Governance Reviewer',
    titleAr: 'مراجع ومستشار الحوكمة المالية'
  },
  {
    id: 'usr-viewer-04',
    name: 'Noura Al-Shehri',
    nameAr: 'نورة الشهري',
    email: 'noura.shehri@alnoortrading.com',
    role: 'viewer',
    title: 'Board Observer / Internal Auditor',
    titleAr: 'مراقب مجلس الإدارة / مراجع داخلي'
  }
];

// Seeded evidence for Al Noor
export const SEED_EVIDENCE: EvidenceRecord[] = [
  {
    id: 'evid-exp-01',
    companyId: 'comp-alnoor-01',
    moduleId: 'expense_management',
    controlId: 'CTRL-EXP-01',
    fileName: 'AlNoor_Expense_Policy_2026_v2.1.pdf',
    fileType: 'application/pdf',
    fileSize: 482000,
    uploadedBy: 'Sarah Al-Otaibi',
    uploadedAt: '2026-08-15T10:15:00Z',
    reviewStatus: 'approved',
    reviewedBy: 'Dr. Khalid Mansoor',
    reviewedAt: '2026-08-18T14:20:00Z',
    reviewNotes: 'Policy is thoroughly structured, signed by the CEO, and staff circular distribution is verified.',
    notes: 'Official expense policy manual signed by Board in Q1 2026.',
    isSeed: true,
    previewText: `AL NOOR TRADING COMPANY
POLICY DOCUMENT: OP-FIN-004 (REV 2.1)
TITLE: CORPORATE DISBURSEMENT AND EXPENSE GOVERNANCE POLICY
APPROVED BY: BOARD OF DIRECTORS | EFFECTIVE DATE: JAN 15, 2026

1. Purpose and Applicability:
This policy establishes mandatory parameters for company business disbursements, corporate credit card usage, travel allowances, and petty cash administration across all branches (Riyadh HQ, Jeddah Branch, Dammam Hub).

2. Spending Delegations and Limits:
- Department Heads: Up to SAR 5,000 with pre-approved budget.
- Finance Manager: Up to SAR 25,000.
- Managing Director: Up to SAR 100,000.
- Board Audit Committee: Expenditures exceeding SAR 100,000.

3. Prohibitions:
Self-approval is strictly forbidden under all circumstances. Reimbursable claims require valid ZATCA Phase 2 compliant tax invoices within 15 calendar days.`
  },
  {
    id: 'evid-exp-02',
    companyId: 'comp-alnoor-01',
    moduleId: 'expense_management',
    controlId: 'CTRL-EXP-06',
    fileName: 'Sample_Branch_Disbursement_Receipts_July2026.csv',
    fileType: 'text/csv',
    fileSize: 34500,
    uploadedBy: 'Sarah Al-Otaibi',
    uploadedAt: '2026-08-20T11:00:00Z',
    reviewStatus: 'pending',
    notes: 'Sample of 25 receipt entries submitted from Dammam branch for review.',
    isSeed: true,
    previewText: `Date,Claim_ID,Branch,Requester,Amount_SAR,Tax_Invoice_Attached,Status
2026-07-02,CLM-1049,Dammam,A. Harbi,1250.00,YES,Verified
2026-07-05,CLM-1052,Dammam,M. Zahrani,450.00,YES,Verified
2026-07-11,CLM-1060,Dammam,F. Mutairi,3100.00,NO - MISSING,Pending Exception
2026-07-18,CLM-1075,Dammam,S. Qarni,820.00,YES,Verified
2026-07-24,CLM-1088,Dammam,K. Dossary,1950.00,YES,Verified`
  },
  {
    id: 'evid-exp-03',
    companyId: 'comp-alnoor-01',
    moduleId: 'expense_management',
    controlId: 'CTRL-EXP-09',
    fileName: 'Supplier_Bank_Verification_Log_Draft.txt',
    fileType: 'text/plain',
    fileSize: 12400,
    uploadedBy: 'Sarah Al-Otaibi',
    uploadedAt: '2026-08-22T08:30:00Z',
    reviewStatus: 'rejected',
    reviewedBy: 'Dr. Khalid Mansoor',
    reviewedAt: '2026-08-25T11:15:00Z',
    reviewNotes: 'Rejected: Callback logs lack independent verification details and second approver signatures.',
    notes: 'Draft checklist for vendor IBAN modifications.',
    isSeed: true,
    previewText: `MEMORANDUM: VENDOR BANK DETAIL CHANGE VERIFICATION
Status: INCOMPLETE
Observation: 2 of 4 supplier bank modifications in Q2 were conducted over email without secondary phone callbacks to known contact numbers.`
  }
];

// Seeded Test Runs
export const SEED_TEST_RUNS: TestRun[] = [
  {
    id: 'test-exp-04',
    controlId: 'CTRL-EXP-04',
    companyId: 'comp-alnoor-01',
    testDate: '2026-08-14',
    testerName: 'Noura Al-Shehri',
    sampleSize: 5,
    exceptionsCount: 2,
    result: 'Fail',
    notes: 'Sampled five recent executive travel vouchers. Two senior manager expense vouchers contained self-sign-off prior to accounting posting.'
  },
  {
    id: 'test-exp-01',
    controlId: 'CTRL-EXP-01',
    companyId: 'comp-alnoor-01',
    testDate: '2026-08-16',
    testerName: 'Dr. Khalid Mansoor',
    sampleSize: 10,
    exceptionsCount: 0,
    result: 'Pass',
    notes: 'All sampled employees had countersigned policy acknowledgement memos in their active personnel files.'
  }
];

// Helper to construct seeded Expense answers
function createSeedExpenseAnswers(): Record<string, any> {
  const ans: Record<string, any> = {
    EXP01: { questionId: 'EXP01', value: 3, linkedEvidenceIds: ['evid-exp-01'], comment: 'Comprehensive policy issued Jan 2026 and circulated to all managers.' },
    EXP02: { questionId: 'EXP02', value: 2, comment: 'Category limits defined in policy, but ERP system does not enforce automated hard stops.' },
    EXP03: { questionId: 'EXP03', value: 3, comment: 'Delegation of authority matrix signed by Board and active in accounting office.' },
    EXP04: { questionId: 'EXP04', value: 1, comment: 'Self-approval is prohibited in text, but testing identified 2 executive claims with direct self-approval.' },
    EXP05: { questionId: 'EXP05', value: 2, comment: 'Pre-payment approvals occur verbally or via email before vouchers are physically stamped.' },
    EXP06: { questionId: 'EXP06', value: 3, linkedEvidenceIds: ['evid-exp-02'], comment: 'Tax invoices mandatory; minor exceptions occasionally reimbursed on declaration form.' },
    EXP07: { questionId: 'EXP07', value: 2, comment: 'Business purpose field exists on claim form, but often left with generic descriptions like "Client Meeting".' },
    EXP08: { questionId: 'EXP08', value: 1, comment: 'Manual checks only; Odoo configuration allows entering duplicate invoice reference numbers without hard error.' },
    EXP09: { questionId: 'EXP09', value: 1, linkedEvidenceIds: ['evid-exp-03'], comment: 'No formal dual callback protocol when suppliers request payment to a new IBAN.' },
    EXP10: { questionId: 'EXP10', value: 2, comment: 'Bank reconciliations prepared monthly, but outstanding reconciling entries take over 45 days to clear.' },
    EXP11: { questionId: 'EXP11', value: 3, comment: 'Three corporate cards active; statements reviewed and matched against receipts monthly.' },
    EXP12: { questionId: 'EXP12', value: 2, comment: 'Branch petty cash counted monthly, but unannounced surprise cash audits are not conducted.' },
    EXP13: { questionId: 'EXP13', value: 2, comment: 'Advances recorded in ledger, but three employee advances remain unsettled for more than 75 days.' },
    EXP14: { questionId: 'EXP14', value: 2, comment: 'Budget variances discussed informally; formal written variance pack is prepared quarterly rather than monthly.' },
    EXP15: { questionId: 'EXP15', value: 3, comment: 'Documents scanned into digital cloud storage with access permissions restricted to accounting team.' },
    EXP16: { questionId: 'EXP16', value: 1, comment: 'Audit observations are recorded in email threads rather than a centralized tracked remediation register.' }
  };
  return ans;
}

// Helper to construct seeded Inventory answers
function createSeedInventoryAnswers(): Record<string, any> {
  return {
    INV01: { questionId: 'INV01', value: 3, comment: 'Warehouse perimeter fenced with biometric entry.' },
    INV02: { questionId: 'INV02', value: 3, comment: 'GRN signed after QA visual inspection.' },
    INV03: { questionId: 'INV03', value: 3, comment: 'Dispatch requires approved delivery note.' },
    INV04: { questionId: 'INV04', value: 2, comment: 'Annual count conducted; cycle counts irregular.' },
    INV05: { questionId: 'INV05', value: 3, comment: 'Weighted average valuation automated in ERP.' },
    INV06: { questionId: 'INV06', value: 2, comment: 'Obsolescence provision reviewed once a year.' }
  };
}

// Helper to construct seeded Tax answers
function createSeedTaxAnswers(): Record<string, any> {
  return {
    TAX01: { questionId: 'TAX01', value: 3, comment: 'Tax calendar monitored closely by Chief Accountant.' },
    TAX02: { questionId: 'TAX02', value: 3, comment: 'Monthly VAT reconciliation performed before submission.' },
    TAX03: { questionId: 'TAX03', value: 2, comment: 'WHT deducted on foreign licenses; occasional classification doubts.' },
    TAX04: { questionId: 'TAX04', value: 3, comment: 'Accredited tax advisor prepares annual Zakat return.' },
    TAX05: { questionId: 'TAX05', value: 3, comment: 'Customs bills and export records digitally archived.' },
    TAX06: { questionId: 'TAX06', value: 3, comment: 'CR and municipal licenses tracked in government portal.' }
  };
}

// Compute seeded scores deterministically
const expModule = MODULES_LIST.find((m) => m.id === 'expense_management')!;
const invModule = MODULES_LIST.find((m) => m.id === 'inventory')!;
const taxModule = MODULES_LIST.find((m) => m.id === 'tax_compliance')!;

const expScoreBreakdown = calculateModuleScore(expModule.questions, createSeedExpenseAnswers());
const invScoreBreakdown = calculateModuleScore(invModule.questions, createSeedInventoryAnswers());
const taxScoreBreakdown = calculateModuleScore(taxModule.questions, createSeedTaxAnswers());

export const SEED_ASSESSMENTS: Assessment[] = [
  {
    id: 'asmt-exp-01',
    companyId: 'comp-alnoor-01',
    moduleId: 'expense_management',
    ruleVersion: '1.0.0-illustrative',
    status: 'completed',
    score: expScoreBreakdown.score,
    answers: createSeedExpenseAnswers(),
    createdAt: '2026-08-10T10:00:00Z',
    completedAt: '2026-08-12T16:45:00Z',
    createdBy: 'Sarah Al-Otaibi',
    notes: 'Initial comprehensive assessment of company operational disbursements and approval workflows.',
    version: 1
  },
  {
    id: 'asmt-proc-01',
    companyId: 'comp-alnoor-01',
    moduleId: 'procurement',
    ruleVersion: '1.0.0-illustrative',
    status: 'draft',
    score: null,
    answers: {
      PROC01: { questionId: 'PROC01', value: 3, comment: 'PR required in ERP.' },
      PROC02: { questionId: 'PROC02', value: 2, comment: 'Vendor CR verified, conflict disclosure ad-hoc.' },
      PROC03: { questionId: 'PROC03', value: 2, comment: '3 quotes sought for purchases > 50k SAR.' }
      // PROC04, 05, 06 unanswered -> keeps it draft
    },
    createdAt: '2026-09-02T11:20:00Z',
    createdBy: 'Sarah Al-Otaibi',
    notes: 'Draft assessment in progress with procurement committee.',
    version: 1
  },
  {
    id: 'asmt-inv-01',
    companyId: 'comp-alnoor-01',
    moduleId: 'inventory',
    ruleVersion: '1.0.0-illustrative',
    status: 'completed',
    score: invScoreBreakdown.score,
    answers: createSeedInventoryAnswers(),
    createdAt: '2026-08-18T09:00:00Z',
    completedAt: '2026-08-20T15:30:00Z',
    createdBy: 'Sarah Al-Otaibi',
    notes: 'Baseline evaluation of warehouse security and stock valuation controls.',
    version: 1
  },
  {
    id: 'asmt-tax-01',
    companyId: 'comp-alnoor-01',
    moduleId: 'tax_compliance',
    ruleVersion: '1.0.0-illustrative',
    status: 'completed',
    score: taxScoreBreakdown.score,
    answers: createSeedTaxAnswers(),
    createdAt: '2026-08-22T08:30:00Z',
    completedAt: '2026-08-23T14:10:00Z',
    createdBy: 'Sarah Al-Otaibi',
    notes: 'Review of statutory tax filing controls, Zakat status, and compliance schedules.',
    version: 1
  }
];

export const SEED_ACTIONS: CorrectiveAction[] = [
  {
    id: 'act-01',
    companyId: 'comp-alnoor-01',
    moduleId: 'expense_management',
    riskId: 'RSK-EXP-04',
    controlId: 'CTRL-EXP-04',
    title: 'Configure automated self-approval blocking in ERP workflow',
    titleAr: 'تفعيل الحظر الآلي للاعتماد الذاتي في مسار موافقات نظام أودو',
    description: 'Update Odoo user role hierarchy so any claims submitted by directors must automatically route to the CEO or Audit Committee.',
    priority: 'critical',
    ownerId: 'usr-finance-02',
    ownerName: 'Sarah Al-Otaibi',
    dueDate: '2026-09-30',
    status: 'in_progress',
    comments: [
      {
        id: 'c1',
        authorName: 'Sarah Al-Otaibi',
        text: 'Consulted our Odoo integration partner; approval rule update scheduled for deployment this week.',
        createdAt: '2026-09-05T10:00:00Z'
      }
    ],
    evidenceIds: [],
    createdAt: '2026-08-13T09:00:00Z',
    updatedAt: '2026-09-05T10:00:00Z'
  },
  {
    id: 'act-02',
    companyId: 'comp-alnoor-01',
    moduleId: 'expense_management',
    riskId: 'RSK-EXP-09',
    controlId: 'CTRL-EXP-09',
    title: 'Implement mandatory dual callback SOP for supplier bank changes',
    titleAr: 'تطبيق إجراءات التحقق الهاتفي الثنائي الإلزامي عند تغيير الحساب البنكي للموردين',
    description: 'Draft and enforce standard operating procedure requiring finance supervisor to call existing vendor contact before changing IBAN in master files.',
    priority: 'high',
    ownerId: 'usr-finance-02',
    ownerName: 'Sarah Al-Otaibi',
    dueDate: '2026-09-25',
    status: 'awaiting_review',
    comments: [
      {
        id: 'c2',
        authorName: 'Sarah Al-Otaibi',
        text: 'Draft SOP completed and signed by treasury lead. Awaiting reviewer formal sign-off.',
        createdAt: '2026-09-08T11:30:00Z'
      }
    ],
    evidenceIds: ['evid-exp-03'],
    completionNotes: 'SOP drafted with mandatory secondary call log. Submitted for reviewer approval.',
    createdAt: '2026-08-13T09:15:00Z',
    updatedAt: '2026-09-08T11:30:00Z'
  },
  {
    id: 'act-03',
    companyId: 'comp-alnoor-01',
    moduleId: 'expense_management',
    riskId: 'RSK-EXP-08',
    controlId: 'CTRL-EXP-08',
    title: 'Activate system duplicate invoice check & reference lock',
    titleAr: 'تفعيل فحص حظر تكرار رقم فاتورة المورد في النظام المحاسبي',
    description: 'Configure Odoo vendor bill module to reject entries with identical vendor tax ID and bill reference numbers.',
    priority: 'high',
    ownerId: 'usr-finance-02',
    ownerName: 'Sarah Al-Otaibi',
    dueDate: '2026-09-18',
    status: 'todo',
    comments: [],
    evidenceIds: [],
    createdAt: '2026-08-13T09:30:00Z',
    updatedAt: '2026-08-13T09:30:00Z'
  },
  {
    id: 'act-04',
    companyId: 'comp-alnoor-01',
    moduleId: 'expense_management',
    riskId: 'RSK-EXP-13',
    controlId: 'CTRL-EXP-13',
    title: 'Enforce 30-day employee advance settlement policy with payroll freeze',
    titleAr: 'إلزام تسوية سلف الموظفين خلال 30 يوماً مع تجميد السلف الإضافية آلياً',
    description: 'Establish automated notification when an advance reaches 30 days. Auto-freeze subsequent advance requests until cleared.',
    priority: 'medium',
    ownerId: 'usr-finance-02',
    ownerName: 'Sarah Al-Otaibi',
    dueDate: '2026-10-15',
    status: 'todo',
    comments: [],
    evidenceIds: [],
    createdAt: '2026-08-13T10:00:00Z',
    updatedAt: '2026-08-13T10:00:00Z'
  },
  {
    id: 'act-05',
    companyId: 'comp-alnoor-01',
    moduleId: 'expense_management',
    riskId: 'RSK-EXP-01',
    controlId: 'CTRL-EXP-01',
    title: 'Issue and track company-wide expense policy circular',
    titleAr: 'إصدار وتعميم وثيقة سياسة المصروفات وتوقيع إقرارات الالتزام لجميع الموظفين',
    description: 'Ensure 100% of branch and HQ staff have signed the 2026 updated expense governance policy.',
    priority: 'medium',
    ownerId: 'usr-finance-02',
    ownerName: 'Sarah Al-Otaibi',
    dueDate: '2026-08-30',
    status: 'completed',
    comments: [
      {
        id: 'c5',
        authorName: 'Sarah Al-Otaibi',
        text: 'All 85 employees across 3 branches signed digital acknowledgements.',
        createdAt: '2026-08-28T14:00:00Z'
      }
    ],
    evidenceIds: ['evid-exp-01'],
    completionNotes: 'Completed and verified. Acknowledgement register archived.',
    reviewerApproved: true,
    createdAt: '2026-08-13T10:15:00Z',
    updatedAt: '2026-08-28T14:00:00Z'
  },
  {
    id: 'act-06',
    companyId: 'comp-alnoor-01',
    moduleId: 'expense_management',
    riskId: 'RSK-EXP-16',
    controlId: 'CTRL-EXP-16',
    title: 'Establish centralized internal control exception register',
    titleAr: 'إنشاء سجل مركزي رسمي لمتابعة وإغلاق ملاحظات واستثناءات الرقابة',
    description: 'Migrate informal email issue tracking to a shared, tracked control exception log with assigned owners and review dates.',
    priority: 'medium',
    ownerId: 'usr-viewer-04',
    ownerName: 'Noura Al-Shehri',
    dueDate: '2026-09-12', // Past date -> overdue illustrative example
    status: 'in_progress',
    comments: [
      {
        id: 'c6',
        authorName: 'Noura Al-Shehri',
        text: 'Template created; finalizing column definitions with Finance Manager.',
        createdAt: '2026-09-02T16:00:00Z'
      }
    ],
    evidenceIds: [],
    createdAt: '2026-08-13T10:30:00Z',
    updatedAt: '2026-09-02T16:00:00Z'
  },
  {
    id: 'act-07',
    companyId: 'comp-alnoor-01',
    moduleId: 'inventory',
    riskId: 'RSK-INV-04',
    controlId: 'CTRL-INV-04',
    title: 'Formalize perpetual cycle count schedule for Class A inventory',
    titleAr: 'اعتماد جدول جرد دوري مستمر للأصناف عالية القيمة (Class A)',
    description: 'Set up weekly cycle counts for the top 50 revenue-generating SKUs across Riyadh and Jeddah warehouses.',
    priority: 'medium',
    ownerId: 'usr-finance-02',
    ownerName: 'Sarah Al-Otaibi',
    dueDate: '2026-10-05',
    status: 'todo',
    comments: [],
    evidenceIds: [],
    createdAt: '2026-08-21T09:00:00Z',
    updatedAt: '2026-08-21T09:00:00Z'
  },
  {
    id: 'act-08',
    companyId: 'comp-alnoor-01',
    moduleId: 'tax_compliance',
    riskId: 'RSK-TAX-03',
    controlId: 'CTRL-TAX-03',
    title: 'Implement foreign wire transfer withholding tax checklist',
    titleAr: 'تطبيق قائمة فحص ضريبة الاستقطاع لجميع الحوالات البنكية الدولية',
    description: 'Mandate tax accountant pre-approval on international wire transfers to ensure correct WHT deduction.',
    priority: 'medium',
    ownerId: 'usr-finance-02',
    ownerName: 'Sarah Al-Otaibi',
    dueDate: '2026-10-20',
    status: 'in_progress',
    comments: [],
    evidenceIds: [],
    createdAt: '2026-08-24T11:00:00Z',
    updatedAt: '2026-08-24T11:00:00Z'
  }
];

export const SEED_SERVICES: IhkamService[] = [
  {
    id: 'srv-exp-diag',
    moduleId: 'expense_management',
    title: 'Expense Governance Diagnostic',
    titleAr: 'تشخيص حوكمة المصروفات والمدفوعات',
    subtitle: 'Deep-dive assessment of disbursement leakages, authorization gaps, and voucher documentation',
    subtitleAr: 'تقييم شامل لمسارات الصرف والفجوات الرقابية وسلامة المستندات المؤيدة',
    purpose: 'Examine 100 historical disbursement vouchers, evaluate approval delegation adherence, and identify recurring financial control leakage points.',
    purposeAr: 'فحص عينة معيارية من 100 سند صرف وتحليل الالتزام بمصفوفة الصلاحيات وتحديد نقاط التسرب المالي المتكررة.',
    deliverables: [
      'Comprehensive disbursement gap report with quantitative exception breakdown',
      'Benchmark analysis comparing current controls to Saudi peer trading standards',
      'Actionable executive summary tailored for Board Audit Committee'
    ],
    deliverablesAr: [
      'تقرير فحص شامل للمصروفات مع تصنيف تفصيلي لحالات الاستثناء والعجز',
      'مقارنة معيارية لضوابط المنشأة مع أفضل ممارسات الشركات التجارية بالسوق السعودي',
      'ملخص تنفيذي جاهز للعرض على لجنة المراجعة ومجلس الإدارة'
    ],
    targetGaps: ['RSK-EXP-04', 'RSK-EXP-08', 'RSK-EXP-09'],
    expectedBenefits: 'Pinpoints hidden disbursement leakage, reduces manual check processing time by 40%, and establishes clear audit readiness.',
    expectedBenefitsAr: 'يحدد مواطن التسرب المالي الخفية، ويقلل وقت مراجعة السندات اليدوية بنسبة 40%، ويرفع الجاهزية للتدقيق.'
  },
  {
    id: 'srv-exp-policy',
    moduleId: 'expense_management',
    title: 'Expense Policy & Approval Delegation Design',
    titleAr: 'تصميم سياسات المصروفات ومصفوفة الصلاحيات',
    subtitle: 'Bespoke financial authority matrix, corporate spending limits, and exception workflow design',
    subtitleAr: 'بناء مصفوفة تفويض صلاحيات مالية محكمة وضوابط الصرف ومسارات الاستثناءات',
    purpose: 'Design a customized corporate expense manual and modern Delegation of Authority (DoA) matrix aligned with the company’s organizational structure.',
    purposeAr: 'صياغة دليل سياسات المصروفات المخصص وتصميم مصفوفة تفويض الصلاحيات (DoA) المتوافقة مع الهيكل التنظيمي.',
    deliverables: [
      'Board-approved bilingual Corporate Expense Governance Policy Manual',
      'Interactive Delegation of Authority (DoA) Matrix with role-based monetary thresholds',
      'Staff training materials and onboarding acknowledgement templates'
    ],
    deliverablesAr: [
      'دليل سياسة حوكمة المصروفات المؤسسي ثنائي اللغة المعتمد من الإدارة',
      'مصفوفة تفويض الصلاحيات المالية التفاعلية مع سقوف الصرف لكل مستوى وظيفي',
      'حقيبة تدريبية ونماذج إقرار التزام الموظفين بالسياسة'
    ],
    targetGaps: ['RSK-EXP-01', 'RSK-EXP-02', 'RSK-EXP-03'],
    expectedBenefits: 'Enforces clear operational spending boundaries, eliminates self-approval ambiguities, and empowers department budget accountability.',
    expectedBenefitsAr: 'يحدد صلاحيات الصرف بوضوح، ويلغي غموض الاعتماد الذاتي، ويرسخ مسؤولية مديري الإدارات عن موازناتهم.'
  },
  {
    id: 'srv-exp-evid',
    moduleId: 'expense_management',
    title: 'Digital Evidence & ZATCA Readiness Setup',
    titleAr: 'جاهزية التوثيق الرقمي والفوترة الإلكترونية',
    subtitle: 'Digital receipt capture framework, tax invoice compliance, and structured archive retention',
    subtitleAr: 'تأسيس منظومة التوثيق الرقمي ومطابقة الفواتير الضريبية والأرشفة السحابية الآمنة',
    purpose: 'Establish a tamper-evident digital archive and verification workflow for all supplier receipts, travel expenses, and tax invoices.',
    purposeAr: 'إنشاء أرشيف رقمي منظم ومسار تحقق آلي لكافة الفواتير الضريبية ومطالبات السفر والمصروفات.',
    deliverables: [
      'Digital receipt capture standard operating procedure (SOP)',
      'ZATCA Phase 2 compliant tax invoice verification checklist',
      'Cloud archive structure with role-based access control guidelines'
    ],
    deliverablesAr: [
      'دليل إجراءات استلام وأرشفة الفواتير الرقمية القياسي',
      'قائمة فحص واعتماد الفواتير الضريبية المتوافقة مع اشتراطات هيئة الزكاة والضريبة',
      'هيكلة الأرشيف السحابي مع سياسة صلاحيات الوصول والتشفير'
    ],
    targetGaps: ['RSK-EXP-06', 'RSK-EXP-15'],
    expectedBenefits: 'Eliminates lost receipts, ensures immediate audit file retrieval, and shields the business from statutory tax audit deductions.',
    expectedBenefitsAr: 'يقضي على ضياع الفواتير الورقية، ويسرع استرجاع المستندات فورياً، ويحمي من استبعاد التكاليف في الفحص الضريبي.'
  },
  {
    id: 'srv-exp-controls',
    moduleId: 'expense_management',
    title: 'Internal Control Implementation & Automation',
    titleAr: 'تطبيق وأتمتة الضوابط الرقابية الداخلية',
    subtitle: 'ERP approval workflow configuration, duplicate detection rules, and bank mandate hardening',
    subtitleAr: 'ضبط إعدادات ومسارات النظام المحاسبي وحظر التكرار وحماية التحويلات البنكية',
    purpose: 'Translate governance policies into technical control configurations inside the company’s ERP system and corporate banking portals.',
    purposeAr: 'تحويل سياسات الحوكمة إلى ضوابط تقنية وإعدادات برمجية داخل نظام تخطيط الموارد والبوابات البنكية.',
    deliverables: [
      'ERP workflow rule configuration and segregation of duties (SoD) enforcement guide',
      'Dual-authorization protocol design for corporate online banking portals',
      'Pre-configured control exception tracking register with automated alerts'
    ],
    deliverablesAr: [
      'دليل إعداد مسارات الاعتماد وفصل المهام المتعارضة (SoD) في النظام المحاسبي',
      'بروتوكول ضبط التوقيع البنكي الثنائي والتحقق المستقل للمستفيدين',
      'سجل متابعة ملاحظات الرقابة مع مؤشرات تنبيه فورية'
    ],
    targetGaps: ['RSK-EXP-05', 'RSK-EXP-08', 'RSK-EXP-09'],
    expectedBenefits: 'Automates preventive control gates so unauthorized, duplicate, or unverified payments are blocked before disbursement.',
    expectedBenefitsAr: 'يحول الرقابة إلى نظام مانع آلي يرفض العمليات المكررة أو غير المعتمدة قبل خروج الأموال من البنك.'
  },
  {
    id: 'srv-exp-review',
    moduleId: 'expense_management',
    title: 'Periodic Governance Review & Monitoring',
    titleAr: 'المراجعة الدورية ومراقبة استدامة الحوكمة',
    subtitle: 'Quarterly compliance testing, control effectiveness audits, and score reassessment',
    subtitleAr: 'فحص دوري ربع سنوي واختبار فعالية الضوابط وإعادة قياس مؤشر النضج المالي',
    purpose: 'Deliver independent quarterly assurance that agreed governance practices are operating effectively without regression.',
    purposeAr: 'تقديم تأكيد مهني مستقل كل ثلاثة أشهر على استمرار كفاءة وتطبيق الضوابط دون تراجع أو تساهل.',
    deliverables: [
      'Quarterly control operating effectiveness testing report',
      'Reassessment score report tracking governance score progression over time',
      'Executive briefing presentation for senior management and owners'
    ],
    deliverablesAr: [
      'تقرير ربع سنوي لاختبار فعالية الضوابط التشغيلية على عينات واقعية',
      'تقرير إعادة تقييم الحوكمة يوضح تطور المؤشرات ومستوى النضج عبر الفترات',
      'عرض تنفيذي موجز للإدارة العليا والملاك يوضح المخاطر المعالجة والفرص'
    ],
    targetGaps: ['RSK-EXP-10', 'RSK-EXP-12', 'RSK-EXP-14', 'RSK-EXP-16'],
    expectedBenefits: 'Ensures sustained discipline, detects new control slippages early, and continuously improves financial maturity.',
    expectedBenefitsAr: 'يضمن استدامة الانضباط المالي، ويكتشف أي تراخٍ رقابي مبكراً، ويرتقي بالمنشأة نحو أعلى مستويات النضج.'
  }
];

export const SEED_PLANS: GovernancePlanSnapshot[] = [
  {
    id: 'plan-snap-01',
    companyId: 'comp-alnoor-01',
    version: 1,
    title: 'Al Noor Financial Governance & Internal Control Plan 2026',
    titleAr: 'خطة الحوكمة والرقابة المالية لشركة النور لعام 2026',
    executiveSummary: 'This governance roadmap outlines baseline internal control assessments conducted across operational disbursements, warehouse inventory, and statutory compliance. Priority corrective actions focus on automated self-approval elimination, vendor bank verification controls, and cycle counting.',
    executiveSummaryAr: 'تحدد هذه الخطة خارطة طريق الحوكمة والرقابة المالية المرتكزة على التقييم المبدئي للمصروفات والمستودعات والالتزام الزكوي والضريبي. تركز الإجراءات التصحيحية ذات الأولوية القصوى على إلغاء الاعتماد الذاتي، وضبط الحسابات البنكية للموردين، والجرد الدوري للمخزون.',
    methodologyVersion: '1.0.0-illustrative',
    generatedAt: '2026-08-25T16:00:00Z',
    generatedBy: 'Sarah Al-Otaibi',
    portfolioScore: 63,
    maturityBand: 'Defined',
    moduleScores: [
      { moduleId: 'expense_management', score: expScoreBreakdown.score, coverage: 100 },
      { moduleId: 'inventory', score: invScoreBreakdown.score, coverage: 100 },
      { moduleId: 'tax_compliance', score: taxScoreBreakdown.score, coverage: 100 }
    ],
    keyGapsCount: 8,
    actionsCount: 8,
    evidenceCoverage: 33
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    companyId: 'comp-alnoor-01',
    title: 'Corrective action assigned',
    titleAr: 'تم تعيين إجراء تصحيحي جديد لك',
    message: 'Sarah Al-Otaibi assigned you to "Establish centralized internal control exception register".',
    messageAr: 'تم تكليفك بإجراء: "إنشاء سجل مركزي رسمي لمتابعة وإغلاق ملاحظات واستثناءات الرقابة".',
    link: 'actions',
    read: false,
    createdAt: '2026-09-02T16:05:00Z',
    type: 'action'
  },
  {
    id: 'notif-02',
    companyId: 'comp-alnoor-01',
    title: 'Evidence review decision',
    titleAr: 'قرار اعتماد مستند مؤيد',
    message: 'Dr. Khalid Mansoor reviewed "AlNoor_Expense_Policy_2026_v2.1.pdf": Approved.',
    messageAr: 'قام د. خالد منصور بمراجعة "وثيقة سياسة المصروفات لعام 2026": معتمد.',
    link: 'evidence',
    read: true,
    createdAt: '2026-08-18T14:22:00Z',
    type: 'evidence'
  },
  {
    id: 'notif-03',
    companyId: 'comp-alnoor-01',
    title: 'Governance plan generated',
    titleAr: 'تم إنشاء خطة الحوكمة المالية (إصدار 1)',
    message: 'Version 1 of the Al Noor Governance Plan is ready for review and export.',
    messageAr: 'الإصدار الأول من خطة حوكمة شركة النور جاهز للمعاينة والطباعة.',
    link: 'governance_plan',
    read: true,
    createdAt: '2026-08-25T16:01:00Z',
    type: 'plan'
  }
];

export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-01',
    companyId: 'comp-alnoor-01',
    actorName: 'Sarah Al-Otaibi',
    action: 'Completed Assessment',
    recordType: 'Assessment',
    recordId: 'asmt-exp-01',
    details: 'Completed Expense Management assessment with 16 answered questions. Final score: 53.',
    timestamp: '2026-08-12T16:45:00Z'
  },
  {
    id: 'audit-02',
    companyId: 'comp-alnoor-01',
    actorName: 'Sarah Al-Otaibi',
    action: 'Uploaded Evidence',
    recordType: 'Evidence',
    recordId: 'evid-exp-01',
    details: 'Uploaded AlNoor_Expense_Policy_2026_v2.1.pdf linked to control CTRL-EXP-01.',
    timestamp: '2026-08-15T10:15:00Z'
  },
  {
    id: 'audit-03',
    companyId: 'comp-alnoor-01',
    actorName: 'Dr. Khalid Mansoor',
    action: 'Approved Evidence',
    recordType: 'Evidence',
    recordId: 'evid-exp-01',
    details: 'Approved evidence file after verifying CEO signature and staff distribution memo.',
    timestamp: '2026-08-18T14:20:00Z'
  },
  {
    id: 'audit-04',
    companyId: 'comp-alnoor-01',
    actorName: 'Sarah Al-Otaibi',
    action: 'Generated Governance Plan',
    recordType: 'GovernancePlan',
    recordId: 'plan-snap-01',
    details: 'Generated Version 1 of Financial Governance Plan (Portfolio Score: 63, Maturity: Defined).',
    timestamp: '2026-08-25T16:00:00Z'
  }
];

export const SEED_METHODOLOGY_CONFIG: MethodologyConfig = {
  version: '1.0.0-illustrative',
  status: 'approved',
  questionWeights: {},
  maturityThresholds: {
    initial: [0, 24],
    developing: [25, 49],
    defined: [50, 69],
    managed: [70, 84],
    optimizing: [85, 100]
  },
  reviewerNotes: 'Approved for demonstration purposes. Thresholds and weights are illustrative and require client financial expert approval prior to production reliance.',
  updatedAt: '2026-08-01T08:00:00Z',
  updatedBy: 'Dr. Khalid Mansoor'
};

export const SEED_MONITORING_DATA: MonitoringTransaction[] = [
  { id: 'tx-01', date: '2026-09-01', reference: 'INV-2026-8801', amount: 14200, currency: 'SAR', department: 'Operations', anomalies: [] },
  { id: 'tx-02', date: '2026-09-02', reference: 'INV-2026-8802', amount: 85000, currency: 'SAR', department: 'Procurement', anomalies: ['High amount exceeding standard department limit (50,000 SAR)'] },
  { id: 'tx-03', date: '2026-09-05', reference: 'INV-2026-8803', amount: 4300, currency: 'SAR', department: 'Marketing', anomalies: [] },
  { id: 'tx-04', date: '2026-09-06', reference: 'INV-2026-8801', amount: 14200, currency: 'SAR', department: 'Operations', anomalies: ['Duplicate reference detected: matches transaction tx-01'] },
  { id: 'tx-05', date: '2026-09-08', reference: 'INV-2026-8804', amount: 1250, currency: 'SAR', department: 'IT', anomalies: [] },
  { id: 'tx-06', date: '2026-09-10', reference: 'INV-2026-8805', amount: 96000, currency: 'SAR', department: 'Logistics', anomalies: ['High amount exceeding standard department limit (50,000 SAR)'] }
];
