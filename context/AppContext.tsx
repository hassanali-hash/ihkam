'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Language,
  UserRole,
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
  MonitoringTransaction
} from '@/lib/types';
import {
  getDefaultStorageState,
  loadStorageState,
  saveStorageState,
  resetAllData,
  exportWorkspaceJSON,
  validateAndImportWorkspaceJSON,
  StorageState
} from '@/lib/storage';
import { storeBlob, deleteBlob } from '@/lib/idb';
import { TRANSLATIONS } from '@/lib/translations';
import { MODULES_LIST } from '@/lib/modulesData';
import { calculateModuleScore } from '@/lib/scoring';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
  activeCompany: Company;
  companies: Company[];
  switchCompany: (companyId: string) => void;
  updateCompany: (updates: Partial<Company>) => void;
  createCompany: (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => string;
  activeUser: User;
  users: User[];
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  assessments: Assessment[];
  saveAssessment: (assessment: Assessment) => void;
  createReassessment: (moduleId: string) => Assessment;
  actions: CorrectiveAction[];
  createAction: (actionData: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAction: (id: string, updates: Partial<CorrectiveAction>) => void;
  deleteAction: (id: string) => void;
  evidence: EvidenceRecord[];
  addEvidence: (recordData: Omit<EvidenceRecord, 'id' | 'uploadedAt'>, blob?: Blob) => Promise<string>;
  updateEvidence: (id: string, updates: Partial<EvidenceRecord>) => void;
  deleteEvidence: (id: string) => Promise<void>;
  testRuns: TestRun[];
  addTestRun: (runData: Omit<TestRun, 'id'>) => void;
  plans: GovernancePlanSnapshot[];
  savePlanSnapshot: (planData: Omit<GovernancePlanSnapshot, 'id' | 'generatedAt'>) => void;
  serviceRequests: ServiceRequest[];
  addServiceRequest: (reqData: Omit<ServiceRequest, 'id' | 'createdAt'>) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id?: string) => void;
  auditLogs: AuditLogEntry[];
  methodologyConfig: MethodologyConfig;
  updateMethodologyConfig: (updates: Partial<MethodologyConfig>) => void;
  monitoringTransactions: MonitoringTransaction[];
  addMonitoringTransactions: (transactions: MonitoringTransaction[]) => void;
  monitoringThreshold: number;
  setMonitoringThreshold: (val: number) => void;
  resetWorkspace: () => Promise<void>;
  exportJSON: () => string;
  importJSON: (json: string) => { success: boolean; error?: string };
  activeRoute: string;
  setActiveRoute: (route: string, params?: any) => void;
  routeParams: any;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  canMutate: boolean;
  isReviewer: boolean;
  isAdmin: boolean;
  dismissedRecommendations: string[];
  dismissRecommendation: (recId: string) => void;
  restoreRecommendation: (recId: string) => void;
  setActiveCompanyId: (companyId: string) => void;
  rawState: StorageState;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StorageState>(() => getDefaultStorageState());
  const [activeRoute, setActiveRouteState] = useState<string>('dashboard');
  const [routeParams, setRouteParams] = useState<any>({});
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);

  // Hydrate stored state after initial mount
  useEffect(() => {
    try {
      const saved = loadStorageState();
      setState(saved);
    } catch (e) {
      console.warn('Failed to load saved state from localStorage:', e);
    }
  }, []);

  // Keep dir and lang synced to HTML root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = state.language;
    }
  }, [state.language]);

  // Persist state on mutations
  const updateStateAndPersist = useCallback((updater: (prev: StorageState) => StorageState) => {
    setState((prev) => {
      const next = updater(prev);
      saveStorageState(next);
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    updateStateAndPersist((prev) => ({ ...prev, language: lang }));
  }, [updateStateAndPersist]);

  const t = useCallback((key: keyof typeof TRANSLATIONS.en): string => {
    const dict = TRANSLATIONS[state.language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || (key as string);
  }, [state.language]);

  const setActiveRoute = useCallback((route: string, params?: any) => {
    setActiveRouteState(route);
    setRouteParams(params || {});
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const activeCompany = useMemo(() => {
    return state.companies.find((c) => c.id === state.activeCompanyId) || state.companies[0];
  }, [state.companies, state.activeCompanyId]);

  const activeUser = useMemo(() => {
    return state.users.find((u) => u.id === state.activeUserId) || state.users[0];
  }, [state.users, state.activeUserId]);

  const canMutate = state.activeRole !== 'viewer';
  const isReviewer = state.activeRole === 'reviewer' || state.activeRole === 'admin';
  const isAdmin = state.activeRole === 'admin';

  const switchCompany = useCallback((companyId: string) => {
    updateStateAndPersist((prev) => {
      if (!prev.companies.some((c) => c.id === companyId)) return prev;
      return { ...prev, activeCompanyId: companyId };
    });
  }, [updateStateAndPersist]);

  const setActiveRole = useCallback((role: UserRole) => {
    updateStateAndPersist((prev) => {
      const matchingUser = prev.users.find((u) => u.role === role) || prev.users[0];
      return { ...prev, activeRole: role, activeUserId: matchingUser.id };
    });
  }, [updateStateAndPersist]);

  const updateCompany = useCallback((updates: Partial<Company>) => {
    if (!canMutate) return;
    updateStateAndPersist((prev) => {
      const updatedCompanies = prev.companies.map((c) => {
        if (c.id === prev.activeCompanyId) {
          return { ...c, ...updates, updatedAt: new Date().toISOString() };
        }
        return c;
      });
      return { ...prev, companies: updatedCompanies };
    });
  }, [canMutate, updateStateAndPersist]);

  const createCompany = useCallback((companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `comp-${Date.now()}`;
    const now = new Date().toISOString();
    const newCompany: Company = {
      ...companyData,
      id,
      createdAt: now,
      updatedAt: now
    };
    updateStateAndPersist((prev) => ({
      ...prev,
      companies: [...prev.companies, newCompany],
      activeCompanyId: id
    }));
    return id;
  }, [updateStateAndPersist]);

  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    if (!isAdmin) return;
    const id = `usr-${Date.now()}`;
    const newUser: User = { ...userData, id };
    updateStateAndPersist((prev) => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
  }, [isAdmin, updateStateAndPersist]);

  const addAuditLog = useCallback((action: string, recordType: string, recordId: string, details: string) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      companyId: state.activeCompanyId,
      actorName: activeUser.name,
      action,
      recordType,
      recordId,
      details,
      timestamp: new Date().toISOString()
    };
    updateStateAndPersist((prev) => ({
      ...prev,
      auditLogs: [entry, ...prev.auditLogs]
    }));
  }, [activeUser.name, state.activeCompanyId, updateStateAndPersist]);

  const saveAssessment = useCallback((assessment: Assessment) => {
    if (!canMutate) return;
    updateStateAndPersist((prev) => {
      const existingIdx = prev.assessments.findIndex(
        (a) => a.companyId === assessment.companyId && a.id === assessment.id
      );
      let updatedAssessments = [...prev.assessments];
      if (existingIdx >= 0) {
        updatedAssessments[existingIdx] = assessment;
      } else {
        updatedAssessments.push(assessment);
      }
      return { ...prev, assessments: updatedAssessments };
    });
    addAuditLog(
      assessment.status === 'completed' ? 'Completed Assessment' : 'Saved Assessment Draft',
      'Assessment',
      assessment.id,
      `Module ${assessment.moduleId} - Status: ${assessment.status}, Score: ${assessment.score ?? 'N/A'}`
    );
  }, [canMutate, updateStateAndPersist, addAuditLog]);

  const createReassessment = useCallback((moduleId: string): Assessment => {
    const mod = MODULES_LIST.find((m) => m.id === moduleId);
    const existing = state.assessments.filter(
      (a) => a.companyId === state.activeCompanyId && a.moduleId === moduleId
    );
    const nextVer = existing.length + 1;
    const newId = `asmt-${moduleId}-${Date.now()}`;

    // Seed initial draft with previous answers or blank
    const lastAnswers = existing.length > 0 ? existing[existing.length - 1].answers : {};
    const clonedAnswers: Record<string, any> = {};
    if (mod) {
      for (const q of mod.questions) {
        if (lastAnswers[q.id]) {
          clonedAnswers[q.id] = { ...lastAnswers[q.id] };
        }
      }
    }

    const calc = mod ? calculateModuleScore(mod.questions, clonedAnswers) : { score: null };

    const newAsmt: Assessment = {
      id: newId,
      companyId: state.activeCompanyId,
      moduleId,
      ruleVersion: state.methodologyConfig.version,
      status: 'draft',
      score: calc.score,
      answers: clonedAnswers,
      createdAt: new Date().toISOString(),
      createdBy: activeUser.name,
      version: nextVer,
      notes: `Reassessment version ${nextVer}`
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      assessments: [...prev.assessments, newAsmt]
    }));

    addAuditLog('Created Reassessment', 'Assessment', newId, `Reassessment for ${moduleId} (v${nextVer})`);
    return newAsmt;
  }, [activeUser.name, addAuditLog, state.activeCompanyId, state.assessments, state.methodologyConfig.version, updateStateAndPersist]);

  const createAction = useCallback((actionData: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>): string => {
    if (!canMutate) return '';
    const id = `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const now = new Date().toISOString();
    const newAction: CorrectiveAction = {
      ...actionData,
      id,
      createdAt: now,
      updatedAt: now
    };

    updateStateAndPersist((prev) => {
      // Deduplicate: if an action with identical title exists for this company, return existing
      const existing = prev.actions.find(
        (a) => a.companyId === newAction.companyId && a.title === newAction.title
      );
      if (existing) return prev;

      // Add notification for assigned owner
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        companyId: newAction.companyId,
        title: 'New corrective action created',
        titleAr: 'تم إنشاء إجراء تصحيحي جديد',
        message: `Action "${newAction.title}" assigned to ${newAction.ownerName}.`,
        messageAr: `تم تكليف ${newAction.ownerName} بإجراء "${newAction.titleAr || newAction.title}".`,
        link: 'actions',
        read: false,
        createdAt: now,
        type: 'action'
      };

      return {
        ...prev,
        actions: [newAction, ...prev.actions],
        notifications: [newNotif, ...prev.notifications]
      };
    });

    addAuditLog('Created Action', 'CorrectiveAction', id, newAction.title);
    return id;
  }, [canMutate, updateStateAndPersist, addAuditLog]);

  const updateAction = useCallback((id: string, updates: Partial<CorrectiveAction>) => {
    if (!canMutate) return;
    updateStateAndPersist((prev) => {
      const updated = prev.actions.map((a) => {
        if (a.id === id) {
          return { ...a, ...updates, updatedAt: new Date().toISOString() };
        }
        return a;
      });
      return { ...prev, actions: updated };
    });
    addAuditLog('Updated Action', 'CorrectiveAction', id, `Updated status or fields on action ${id}`);
  }, [canMutate, updateStateAndPersist, addAuditLog]);

  const deleteAction = useCallback((id: string) => {
    if (!canMutate) return;
    updateStateAndPersist((prev) => ({
      ...prev,
      actions: prev.actions.filter((a) => a.id !== id)
    }));
    addAuditLog('Deleted Action', 'CorrectiveAction', id, `Removed action ${id}`);
  }, [canMutate, updateStateAndPersist, addAuditLog]);

  const addEvidence = useCallback(async (
    recordData: Omit<EvidenceRecord, 'id' | 'uploadedAt'>,
    blob?: Blob
  ): Promise<string> => {
    const id = `evid-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    let blobKey: string | undefined = undefined;

    if (blob) {
      blobKey = `blob-${id}`;
      await storeBlob(blobKey, blob);
    }

    const record: EvidenceRecord = {
      ...recordData,
      id,
      blobKey,
      uploadedAt: new Date().toISOString()
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      evidence: [record, ...prev.evidence]
    }));

    addAuditLog('Uploaded Evidence', 'Evidence', id, `Uploaded ${record.fileName} for ${record.moduleId}`);
    return id;
  }, [addAuditLog, updateStateAndPersist]);

  const updateEvidence = useCallback((id: string, updates: Partial<EvidenceRecord>) => {
    updateStateAndPersist((prev) => {
      const updated = prev.evidence.map((e) => {
        if (e.id === id) {
          return { ...e, ...updates };
        }
        return e;
      });
      return { ...prev, evidence: updated };
    });
    addAuditLog('Updated Evidence', 'Evidence', id, `Review status updated on ${id}`);
  }, [addAuditLog, updateStateAndPersist]);

  const deleteEvidence = useCallback(async (id: string) => {
    const record = state.evidence.find((e) => e.id === id);
    if (record?.blobKey) {
      await deleteBlob(record.blobKey);
    }
    updateStateAndPersist((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((e) => e.id !== id)
    }));
    addAuditLog('Deleted Evidence', 'Evidence', id, `Deleted evidence ${id}`);
  }, [addAuditLog, state.evidence, updateStateAndPersist]);

  const addTestRun = useCallback((runData: Omit<TestRun, 'id'>) => {
    if (!canMutate) return;
    const id = `test-${Date.now()}`;
    const newRun: TestRun = { ...runData, id };
    updateStateAndPersist((prev) => ({
      ...prev,
      testRuns: [newRun, ...prev.testRuns]
    }));
    addAuditLog('Recorded Control Test', 'TestRun', id, `Result: ${newRun.result} on control ${newRun.controlId}`);
  }, [canMutate, updateStateAndPersist, addAuditLog]);

  const savePlanSnapshot = useCallback((planData: Omit<GovernancePlanSnapshot, 'id' | 'generatedAt'>) => {
    if (!canMutate) return;
    const id = `plan-${Date.now()}`;
    const newPlan: GovernancePlanSnapshot = {
      ...planData,
      id,
      generatedAt: new Date().toISOString()
    };
    updateStateAndPersist((prev) => ({
      ...prev,
      plans: [newPlan, ...prev.plans]
    }));
    addAuditLog('Generated Governance Plan', 'GovernancePlan', id, `Plan snapshot v${newPlan.version} saved`);
  }, [canMutate, updateStateAndPersist, addAuditLog]);

  const addServiceRequest = useCallback((reqData: Omit<ServiceRequest, 'id' | 'createdAt'>) => {
    const id = `srvreq-${Date.now()}`;
    const newReq: ServiceRequest = {
      ...reqData,
      id,
      createdAt: new Date().toISOString()
    };
    updateStateAndPersist((prev) => ({
      ...prev,
      serviceRequests: [newReq, ...prev.serviceRequests]
    }));
    addAuditLog('Saved Service Request', 'ServiceRequest', id, `Requested consultation for ${newReq.serviceTitle}`);
  }, [updateStateAndPersist, addAuditLog]);

  const markNotificationRead = useCallback((id?: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => {
        if (!id || n.id === id) {
          return { ...n, read: true };
        }
        return n;
      })
    }));
  }, [updateStateAndPersist]);

  const updateMethodologyConfig = useCallback((updates: Partial<MethodologyConfig>) => {
    if (!isReviewer) return;
    updateStateAndPersist((prev) => ({
      ...prev,
      methodologyConfig: {
        ...prev.methodologyConfig,
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: activeUser.name
      }
    }));
    addAuditLog('Updated Methodology Config', 'MethodologyConfig', state.methodologyConfig.version, 'Config parameters modified');
  }, [isReviewer, activeUser.name, addAuditLog, updateStateAndPersist, state.methodologyConfig.version]);

  const addMonitoringTransactions = useCallback((txs: MonitoringTransaction[]) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      monitoringTransactions: [...txs, ...prev.monitoringTransactions]
    }));
  }, [updateStateAndPersist]);

  const setMonitoringThreshold = useCallback((val: number) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      monitoringThreshold: val
    }));
  }, [updateStateAndPersist]);

  const resetWorkspace = useCallback(async () => {
    const fresh = await resetAllData();
    setState(fresh);
    setActiveRouteState('dashboard');
  }, []);

  const exportJSON = useCallback(() => {
    return exportWorkspaceJSON(state);
  }, [state]);

  const importJSON = useCallback((json: string) => {
    const res = validateAndImportWorkspaceJSON(json);
    if (res.success && res.state) {
      setState(res.state);
      return { success: true };
    }
    return { success: false, error: res.error };
  }, []);

  const dismissRecommendation = useCallback((recId: string) => {
    setDismissedRecs((prev) => [...prev, recId]);
  }, []);

  const restoreRecommendation = useCallback((recId: string) => {
    setDismissedRecs((prev) => prev.filter((id) => id !== recId));
  }, []);

  const value = useMemo(
    () => ({
      language: state.language,
      setLanguage,
      t,
      activeCompany,
      companies: state.companies,
      switchCompany,
      updateCompany,
      createCompany,
      activeUser,
      users: state.users,
      activeRole: state.activeRole,
      setActiveRole,
      addUser,
      assessments: state.assessments.filter((a) => a.companyId === state.activeCompanyId),
      saveAssessment,
      createReassessment,
      actions: state.actions.filter((a) => a.companyId === state.activeCompanyId),
      createAction,
      updateAction,
      deleteAction,
      evidence: state.evidence.filter((e) => e.companyId === state.activeCompanyId),
      addEvidence,
      updateEvidence,
      deleteEvidence,
      testRuns: state.testRuns.filter((tr) => tr.companyId === state.activeCompanyId),
      addTestRun,
      plans: state.plans.filter((p) => p.companyId === state.activeCompanyId),
      savePlanSnapshot,
      serviceRequests: state.serviceRequests.filter((s) => s.companyId === state.activeCompanyId),
      addServiceRequest,
      notifications: state.notifications.filter((n) => n.companyId === state.activeCompanyId),
      markNotificationRead,
      auditLogs: state.auditLogs.filter((al) => al.companyId === state.activeCompanyId),
      methodologyConfig: state.methodologyConfig,
      updateMethodologyConfig,
      monitoringTransactions: state.monitoringTransactions,
      addMonitoringTransactions,
      monitoringThreshold: state.monitoringThreshold,
      setMonitoringThreshold,
      resetWorkspace,
      exportJSON,
      importJSON,
      activeRoute,
      setActiveRoute,
      routeParams,
      isAssistantOpen,
      setIsAssistantOpen,
      isHelpOpen,
      setIsHelpOpen,
      searchQuery,
      setSearchQuery,
      canMutate,
      isReviewer,
      isAdmin,
      dismissedRecommendations: dismissedRecs,
      dismissRecommendation,
      restoreRecommendation,
      setActiveCompanyId: switchCompany,
      rawState: state
    }),
    [
      state,
      setLanguage,
      t,
      activeCompany,
      switchCompany,
      updateCompany,
      createCompany,
      activeUser,
      setActiveRole,
      addUser,
      saveAssessment,
      createReassessment,
      createAction,
      updateAction,
      deleteAction,
      addEvidence,
      updateEvidence,
      deleteEvidence,
      addTestRun,
      savePlanSnapshot,
      addServiceRequest,
      markNotificationRead,
      updateMethodologyConfig,
      addMonitoringTransactions,
      setMonitoringThreshold,
      resetWorkspace,
      exportJSON,
      importJSON,
      activeRoute,
      setActiveRoute,
      routeParams,
      isAssistantOpen,
      isHelpOpen,
      searchQuery,
      canMutate,
      isReviewer,
      isAdmin,
      dismissedRecs,
      dismissRecommendation,
      restoreRecommendation
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
