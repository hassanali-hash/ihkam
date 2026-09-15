'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Building2,
  Layers,
  ClipboardCheck,
  AlertTriangle,
  ShieldCheck,
  FolderLock,
  Lightbulb,
  CheckSquare,
  FileSpreadsheet,
  Briefcase,
  Users,
  Sliders,
  Radio,
  History,
  Settings,
  Menu,
  X,
  ChevronRight,
  Shield
} from 'lucide-react';

interface NavItem {
  id: string;
  labelKey: any;
  icon: React.ElementType;
  badge?: string | number;
}

export function Sidebar() {
  const { language, t, activeRoute, setActiveRoute, actions, evidence, assessments } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const openGapsCount = actions.filter((a) => a.status !== 'completed').length;
  const pendingEvidenceCount = evidence.filter((e) => e.reviewStatus === 'pending').length;
  const draftAssessmentsCount = assessments.filter((a) => a.status === 'draft').length;

  const workspaceNav: NavItem[] = [
    { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { id: 'company_profile', labelKey: 'companyProfile', icon: Building2 },
    { id: 'challenges', labelKey: 'challenges', icon: Layers },
    { id: 'assessments', labelKey: 'assessments', icon: ClipboardCheck, badge: draftAssessmentsCount || undefined }
  ];

  const governanceNav: NavItem[] = [
    { id: 'risk_register', labelKey: 'riskRegister', icon: AlertTriangle },
    { id: 'controls_library', labelKey: 'controlsLibrary', icon: ShieldCheck },
    { id: 'evidence_center', labelKey: 'evidenceCenter', icon: FolderLock, badge: pendingEvidenceCount || undefined },
    { id: 'recommendations', labelKey: 'recommendations', icon: Lightbulb },
    { id: 'action_plan', labelKey: 'actionPlan', icon: CheckSquare, badge: openGapsCount || undefined },
    { id: 'governance_plan', labelKey: 'governancePlan', icon: FileSpreadsheet }
  ];

  const adminNav: NavItem[] = [
    { id: 'services', labelKey: 'services', icon: Briefcase },
    { id: 'team', labelKey: 'team', icon: Users },
    { id: 'framework_config', labelKey: 'frameworkConfig', icon: Sliders },
    { id: 'integrations', labelKey: 'integrations', icon: Radio },
    { id: 'activity_log', labelKey: 'activityLog', icon: History },
    { id: 'settings', labelKey: 'settings', icon: Settings }
  ];

  const handleNavClick = (id: string) => {
    setActiveRoute(id);
    setIsMobileOpen(false);
  };

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div key={title} className="mb-5">
      <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-[#15393f] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-teal-300'}`} />
                <span className="truncate">{t(item.labelKey)}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  isActive ? 'bg-teal-900 text-white' : 'bg-slate-800 text-teal-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-4 right-4 rtl:right-auto rtl:left-4 z-40 no-print">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-3 bg-teal-800 text-white rounded-full shadow-lg hover:bg-teal-900 transition-colors flex items-center justify-center"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static top-0 bottom-0 z-40 w-[248px] bg-[#102D32] text-slate-100 flex flex-col shrink-0 transition-transform duration-200 ease-in-out border-r rtl:border-r-0 rtl:border-l border-[#1a444a] no-print ${
          isMobileOpen
            ? 'translate-x-0'
            : language === 'ar'
            ? 'translate-x-full md:translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Logo Brand */}
        <div className="h-[72px] flex items-center gap-3 px-5 border-b border-[#1a444a] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Shield className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>{language === 'ar' ? 'إحكام' : 'Ihkam'}</span>
              <span className="text-xs font-normal text-teal-300 px-1.5 py-0.2 bg-[#092226] rounded-sm">v1</span>
            </span>
            <p className="text-[10px] text-slate-400 -mt-0.5">{t('brandTagline')}</p>
          </div>
        </div>

        {/* Scrollable Nav Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 select-none">
          {renderNavGroup(t('navWorkspace'), workspaceNav)}
          {renderNavGroup(t('navGovernance'), governanceNav)}
          {renderNavGroup(t('navAdmin'), adminNav)}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#1a444a] shrink-0 bg-[#0c2327]">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>{language === 'ar' ? 'نموذج محلي تجريبي' : 'Client Prototype'}</span>
            <span className="text-[#B48A42] font-semibold">SA 2026</span>
          </div>
        </div>
      </aside>
    </>
  );
}
