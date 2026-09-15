'use client';

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { WelcomeModal } from '@/components/WelcomeModal';
import { OnboardingWizardModal } from '@/components/OnboardingWizardModal';

// Views
import { DashboardView } from '@/components/views/DashboardView';
import { AssessmentView } from '@/components/views/AssessmentView';
import { RiskRegisterView } from '@/components/views/RiskRegisterView';
import { ControlsLibraryView } from '@/components/views/ControlsLibraryView';
import { EvidenceCenterView } from '@/components/views/EvidenceCenterView';
import { RecommendationsView } from '@/components/views/RecommendationsView';
import { ActionPlanView } from '@/components/views/ActionPlanView';
import { GovernancePlanView } from '@/components/views/GovernancePlanView';
import { ServicesView } from '@/components/views/ServicesView';
import { CompanyProfileView } from '@/components/views/CompanyProfileView';
import { ChallengesScopeView } from '@/components/views/ChallengesScopeView';
import { TeamView } from '@/components/views/TeamView';
import { FrameworkConfigView } from '@/components/views/FrameworkConfigView';
import { IntegrationsView } from '@/components/views/IntegrationsView';
import { ActivityLogView } from '@/components/views/ActivityLogView';
import { SettingsView } from '@/components/views/SettingsView';

function AppMain() {
  const { language, activeRoute, setActiveRoute, isHelpOpen, setIsHelpOpen } = useApp();
  const [welcomeDismissed, setWelcomeDismissed] = useState<boolean>(true);

  useEffect(() => {
    try {
      const hasVisited = localStorage.getItem('ihkam_has_visited');
      if (!hasVisited) {
        setWelcomeDismissed(false);
      }
    } catch {
      // ignore
    }
  }, []);

  const isWelcomeModalOpen = (!welcomeDismissed) || isHelpOpen;
  const isOnboardingModalOpen = activeRoute === 'onboarding';

  const handleCloseWelcome = () => {
    setWelcomeDismissed(true);
    setIsHelpOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ihkam_has_visited', 'true');
    }
  };

  const handleCloseOnboarding = () => {
    if (activeRoute === 'onboarding') {
      setActiveRoute('dashboard');
    }
  };

  const renderActiveView = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <DashboardView />;
      case 'company_profile':
      case 'profile':
        return <CompanyProfileView />;
      case 'challenges':
        return <ChallengesScopeView />;
      case 'assessments':
        return <AssessmentView />;
      case 'risk_register':
        return <RiskRegisterView />;
      case 'controls_library':
        return <ControlsLibraryView />;
      case 'evidence_center':
      case 'evidence':
        return <EvidenceCenterView />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'action_plan':
        return <ActionPlanView />;
      case 'governance_plan':
        return <GovernancePlanView />;
      case 'services':
        return <ServicesView />;
      case 'team':
        return <TeamView />;
      case 'framework_config':
      case 'methodology':
        return <FrameworkConfigView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'activity_log':
        return <ActivityLogView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen flex bg-[#F5F7FA] text-slate-900 font-sans"
    >
      {/* Sidebar - Desktop and Mobile Drawer */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleCloseWelcome}
      />

      <OnboardingWizardModal
        isOpen={isOnboardingModalOpen}
        onClose={handleCloseOnboarding}
      />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <AppMain />
    </AppProvider>
  );
}
