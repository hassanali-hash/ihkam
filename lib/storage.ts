import {
  Company,
  User,
  Assessment,
  CorrectiveAction,
  EvidenceRecord,
  TestRun,
  GovernancePlanSnapshot,
  ServiceRequest,
  NotificationItem,
  AuditLogEntry,
  MethodologyConfig,
  MonitoringTransaction,
  Language,
  UserRole
} from './types';
import {
  SEED_COMPANIES,
  SEED_USERS,
  SEED_ASSESSMENTS,
  SEED_ACTIONS,
  SEED_EVIDENCE,
  SEED_TEST_RUNS,
  SEED_PLANS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_METHODOLOGY_CONFIG,
  SEED_MONITORING_DATA
} from './seedData';
import { clearAllBlobs } from './idb';

const STORAGE_KEY = 'ihkam-demo-v1';

export interface StorageState {
  version: string;
  activeCompanyId: string;
  activeUserId: string;
  activeRole: UserRole;
  language: Language;
  companies: Company[];
  users: User[];
  assessments: Assessment[];
  actions: CorrectiveAction[];
  evidence: EvidenceRecord[];
  testRuns: TestRun[];
  plans: GovernancePlanSnapshot[];
  serviceRequests: ServiceRequest[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
  methodologyConfig: MethodologyConfig;
  monitoringTransactions: MonitoringTransaction[];
  monitoringThreshold: number;
}

export function getDefaultStorageState(): StorageState {
  return {
    version: '1.0.0',
    activeCompanyId: SEED_COMPANIES[0].id,
    activeUserId: SEED_USERS[1].id, // Sarah Al-Otaibi (Finance Manager)
    activeRole: 'finance_manager',
    language: 'en',
    companies: [...SEED_COMPANIES],
    users: [...SEED_USERS],
    assessments: [...SEED_ASSESSMENTS],
    actions: [...SEED_ACTIONS],
    evidence: [...SEED_EVIDENCE],
    testRuns: [...SEED_TEST_RUNS],
    plans: [...SEED_PLANS],
    serviceRequests: [],
    notifications: [...SEED_NOTIFICATIONS],
    auditLogs: [...SEED_AUDIT_LOGS],
    methodologyConfig: { ...SEED_METHODOLOGY_CONFIG },
    monitoringTransactions: [...SEED_MONITORING_DATA],
    monitoringThreshold: 50000
  };
}

export function loadStorageState(): StorageState {
  if (typeof window === 'undefined') {
    return getDefaultStorageState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultStorageState();
      saveStorageState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    // Basic verification of critical schema arrays
    if (!parsed || !Array.isArray(parsed.companies) || !Array.isArray(parsed.assessments)) {
      console.warn('Corrupted storage format detected, falling back to seed');
      const initial = getDefaultStorageState();
      saveStorageState(initial);
      return initial;
    }

    return parsed as StorageState;
  } catch (err) {
    console.warn('Failed to load localStorage, using default state', err);
    return getDefaultStorageState();
  }
}

export function saveStorageState(state: StorageState): boolean {
  if (typeof window === 'undefined') return true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('LocalStorage write error / quota exceeded', err);
    return false;
  }
}

export async function resetAllData(): Promise<StorageState> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  await clearAllBlobs();
  const fresh = getDefaultStorageState();
  saveStorageState(fresh);
  return fresh;
}

export function exportWorkspaceJSON(state: StorageState): string {
  const exportPayload = {
    exportDate: new Date().toISOString(),
    system: 'Ihkam Financial Governance Demo',
    namespace: STORAGE_KEY,
    notice: 'Exported records contain structured company assessments, actions, plans, and audit logs. Binary uploaded files remain in browser IndexedDB.',
    data: state
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function validateAndImportWorkspaceJSON(jsonString: string): { success: boolean; state?: StorageState; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const candidate = parsed.data || parsed;

    if (!candidate || !Array.isArray(candidate.companies) || candidate.companies.length === 0) {
      return { success: false, error: 'Invalid workspace format: missing companies array' };
    }
    if (!Array.isArray(candidate.assessments)) {
      return { success: false, error: 'Invalid workspace format: missing assessments array' };
    }

    // Verify company ID existence
    const companyIds = candidate.companies.map((c: any) => c.id);
    if (!companyIds.includes(candidate.activeCompanyId)) {
      candidate.activeCompanyId = candidate.companies[0].id;
    }

    saveStorageState(candidate);
    return { success: true, state: candidate };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to parse JSON file' };
  }
}

export const exportStateAsJson = exportWorkspaceJSON;
export const importStateFromJson = validateAndImportWorkspaceJSON;

