'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Globe,
  Bell,
  Building,
  UserCheck,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Check,
  Plus,
  Info,
  ExternalLink
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export function Header() {
  const {
    language,
    setLanguage,
    t,
    activeCompany,
    companies,
    switchCompany,
    activeUser,
    activeRole,
    setActiveRole,
    notifications,
    markNotificationRead,
    setActiveRoute,
    setIsAssistantOpen,
    setIsHelpOpen,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDemoTooltipOpen, setIsDemoTooltipOpen] = useState(false);

  const companyRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const roles: { role: UserRole; labelEn: string; labelAr: string; descEn: string; descAr: string }[] = [
    { role: 'admin', labelEn: 'Company Admin', labelAr: 'مدير المنشأة', descEn: 'Full settings, team & company management', descAr: 'إدارة كاملة للإعدادات والمنشأة والفريق' },
    { role: 'finance_manager', labelEn: 'Finance Manager', labelAr: 'مدير الحسابات والمالية', descEn: 'Runs assessments, creates actions & uploads evidence', descAr: 'إجراء التقييمات، إدارة الإجراءات ورفع المستندات' },
    { role: 'reviewer', labelEn: 'Financial Reviewer', labelAr: 'المراجع والخبير المالي', descEn: 'Approves evidence, tests controls & reviews methodology', descAr: 'اعتماد الأدلة، اختبار الضوابط ومراجعة المنهجية' },
    { role: 'viewer', labelEn: 'Viewer (Read-only)', labelAr: 'مراقب (اطلاع فقط)', descEn: 'Inspects boards, reports & analytics without edits', descAr: 'معاينة التقارير واللوحات دون إمكانية التعديل' }
  ];

  return (
    <header className="h-[72px] bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print">
      {/* Left: Brand / Demo Badge / Search */}
      <div className="flex items-center gap-3 md:gap-5 flex-1 max-w-xl">
        {/* Discreet Persistent Demo Workspace Badge */}
        <div className="relative">
          <button
            onClick={() => setIsDemoTooltipOpen(!isDemoTooltipOpen)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
            title={t('demoTooltip')}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>{t('demoBadge')}</span>
            <Info className="w-3 h-3 text-amber-700" />
          </button>

          {isDemoTooltipOpen && (
            <div className="absolute top-8 left-0 z-50 w-72 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-1">
              <div className="flex justify-between items-start mb-1.5">
                <span className="font-semibold text-amber-400">{t('demoBadge')}</span>
                <button
                  onClick={() => setIsDemoTooltipOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed">{t('demoTooltip')}</p>
              <button
                onClick={() => {
                  setIsDemoTooltipOpen(false);
                  setIsHelpOpen(true);
                }}
                className="mt-2 text-teal-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>{t('help')}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Global Search */}
        <div className="relative flex-1 max-w-sm hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Company Switcher */}
        <div className="relative" ref={companyRef}>
          <button
            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 transition-colors"
          >
            <Building className="w-4 h-4 text-teal-700" />
            <span className="max-w-[130px] md:max-w-[170px] truncate font-semibold">
              {language === 'ar' ? activeCompany.nameAr : activeCompany.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {isCompanyDropdownOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 top-11 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{t('switchCompany')}</p>
              </div>

              <div className="max-h-56 overflow-y-auto py-1">
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      switchCompany(c.id);
                      setIsCompanyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rtl:text-right text-xs hover:bg-slate-50 transition-colors ${
                      c.id === activeCompany.id ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <p className="truncate">{language === 'ar' ? c.nameAr : c.name}</p>
                      <p className="text-[11px] text-slate-400">{c.industry.replace('_', ' ')} • {c.branchCount} branches</p>
                    </div>
                    {c.id === activeCompany.id && <Check className="w-4 h-4 text-teal-700 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsCompanyDropdownOpen(false);
                    setActiveRoute('onboarding');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start a new company assessment</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Demo Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
            title="Switch Demo Role"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">
              {roles.find((r) => r.role === activeRole)?.[language === 'ar' ? 'labelAr' : 'labelEn']}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 top-11 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Demo Role Switcher</p>
                <p className="text-[11px] text-slate-500">Test role-specific permissions and views</p>
              </div>
              <div className="py-1">
                {roles.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setActiveRole(item.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left rtl:text-right flex items-start justify-between hover:bg-slate-50 transition-colors ${
                      activeRole === item.role ? 'bg-teal-50 text-teal-950 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{language === 'ar' ? item.labelAr : item.labelEn}</p>
                      <p className="text-[11px] text-slate-500">{language === 'ar' ? item.descAr : item.descEn}</p>
                    </div>
                    {activeRole === item.role && <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          title={language === 'en' ? 'التحويل للغة العربية' : 'Switch to English'}
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title={t('notifications')}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 top-11 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in">
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">{t('notifications')}</span>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={() => markNotificationRead()}
                    className="text-[11px] text-teal-700 hover:underline font-medium"
                  >
                    {t('markAllRead')}
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">{t('noNotifications')}</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) setActiveRoute(n.link);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-teal-50/40 font-medium' : ''
                      }`}
                    >
                      <p className="font-medium text-slate-900 mb-0.5">
                        {language === 'ar' ? n.titleAr : n.title}
                      </p>
                      <p className="text-slate-500 line-clamp-2 text-[11px]">
                        {language === 'ar' ? n.messageAr : n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    setActiveRoute('activity_log');
                  }}
                  className="text-xs text-teal-700 font-medium hover:underline"
                >
                  {t('viewAllNotifications')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Ihkam Assistant Trigger */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
          title="Open Ihkam Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden md:inline">{t('assistant')}</span>
        </button>

        {/* Help Modal Trigger */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title={t('help')}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
