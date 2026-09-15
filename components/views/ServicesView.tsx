'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ServiceRequest } from '@/lib/types';
import {
  Briefcase,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  Shield,
  FileCheck
} from 'lucide-react';

interface ServicePackage {
  id: string;
  title: string;
  titleAr: string;
  category: string;
  description: string;
  descriptionAr: string;
  deliverables: string[];
  deliverablesAr: string[];
  estimatedWeeks: number;
}

export function ServicesView() {
  const {
    language,
    t,
    activeCompany,
    activeUser,
    serviceRequests,
    addServiceRequest,
    routeParams
  } = useApp();

  const prefillTitle = routeParams?.prefillTitle || '';
  const prefillModule = routeParams?.prefillModule || '';

  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(!!prefillTitle);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Consultation form state
  const [fullName, setFullName] = useState<string>(activeUser.name);
  const [email, setEmail] = useState<string>(activeUser.email);
  const [phone, setPhone] = useState<string>('+966 50 123 4567');
  const [preferredDate, setPreferredDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [serviceTitleInput, setServiceTitleInput] = useState<string>(prefillTitle || 'Financial Authority Matrix Design');
  const [notes, setNotes] = useState<string>('');

  const packages: ServicePackage[] = [
    {
      id: 'srv-matrix',
      title: 'Financial Delegation Matrix & Sign-off Governance',
      titleAr: 'تصميم مصفوفة الصلاحيات المالية واعتمادات التوقيع البنكي',
      category: 'Governance Framework',
      description: 'Establish comprehensive multi-tiered spending limits, dual-authorization electronic bank rules, and departmental delegation frameworks aligned with company bylaws.',
      descriptionAr: 'بناء مصفوفة الصلاحيات المالية الشاملة وتحديد مستويات الصرف واعتمادات التحويلات البنكية الثنائية وفق النظام الأساسي للشركة.',
      deliverables: [
        'Board-approved Authority Matrix Document',
        'ERP electronic workflow mapping',
        'Executive training & compliance guidelines'
      ],
      deliverablesAr: [
        'لائحة مصفوفة الصلاحيات المعتمدة من مجلس الإدارة',
        'مخطط تطبيق مسارات الموافقة في نظام ERP',
        'دليل إرشادي وجلسة تدريبية للإدارة التنفيذية'
      ],
      estimatedWeeks: 2
    },
    {
      id: 'srv-policy',
      title: 'Expense Management & Travel Policy Package',
      titleAr: 'حزمة سياسات المصروفات التشغيلية وبدلات السفر',
      category: 'Operational Controls',
      description: 'Draft standardized corporate expense manuals, per diem rate guidelines, credit card usage controls, and non-reimbursable expense exclusions.',
      descriptionAr: 'صياغة دليل سياسة المصروفات، وبدلات السفر والإقامة، وضوابط البطاقات الائتمانية المؤسسية والمصروفات غير المؤهلة.',
      deliverables: [
        'Complete Expense & Per Diem Policy Manual',
        'Claim voucher templates & receipt checklist',
        'VAT compliance receipting standard operating procedure'
      ],
      deliverablesAr: [
        'دليل سياسة المصروفات وبدلات السفر الشامل',
        'نماذج مطالبات الصرف وقائمة تدقيق المستندات',
        'إجراءات التحقق من الفواتير الضريبية المؤهلة للخصم'
      ],
      estimatedWeeks: 2
    },
    {
      id: 'srv-zatca',
      title: 'ZATCA Phase 2 E-Invoicing & Tax Assurance Review',
      titleAr: 'مراجعة الامتثال للفوترة الإلكترونية (المرحلة الثانية) والفحص الزكوي',
      category: 'Tax & Compliance',
      description: 'Technical and financial audit of ERP cryptographic stamps, XML schemas, invoice archiving, and historical VAT return accuracy.',
      descriptionAr: 'فحص فني ومالي لتكامل الفوترة الإلكترونية والختم التشفيري وأرشفة الفواتير ومطابقة الإقرارات الضريبية السابقة.',
      deliverables: [
        'ZATCA Readiness & Gap Verification Report',
        'VAT reconciliation workpapers & remediation',
        'Mock tax audit simulation'
      ],
      deliverablesAr: [
        'تقرير التحقق وفجوات الربط مع هيئة الزكاة والضريبة',
        'أوراق عمل تسوية ضريبة القيمة المضافة السنوية',
        'محاكاة عملية للفحص الضريبي الميداني'
      ],
      estimatedWeeks: 3
    },
    {
      id: 'srv-inventory',
      title: 'Warehouse Inventory & Procurement Control Overhaul',
      titleAr: 'تطوير الرقابة على المخزون والمستودعات وسلاسل الإمداد',
      category: 'Supply Chain Controls',
      description: 'Design cycle counting schedules, 3-way matching purchase automation, standard scrap authorization, and supplier master fraud prevention.',
      descriptionAr: 'تطبيق إجراءات الجرد الدوري المستمر، والمطابقة الثلاثية لأوامر الشراء، وضوابط اعتماد الإتلاف ومنع تلاعب حسابات الموردين.',
      deliverables: [
        'Warehouse Standard Operating Procedure Manual',
        'Vendor Master Change Verification Protocol',
        'Cycle Count Variance Reconciliation Framework'
      ],
      deliverablesAr: [
        'دليل الإجراءات التشغيلية للمستودعات وحركات الأصناف',
        'بروتوكول التحقق الصارم من تعديل بيانات الموردين البنكية',
        'نموذج تسوية فروقات الجرد الدوري ومعالجة التالف'
      ],
      estimatedWeeks: 4
    },
    {
      id: 'srv-reporting',
      title: 'Month-End Close Acceleration & Management Reporting',
      titleAr: 'تسريع الإقفال المالي الشهري وتطوير التقارير الإدارية',
      category: 'Financial Reporting',
      description: 'Compress the monthly financial close cycle from 20+ days down to 5-10 business days through standardized balance sheet reconciliation templates.',
      descriptionAr: 'تقليص دورة الإقفال المالي الشهري من أكثر من 20 يوماً إلى 5-10 أيام عمل عبر أتمتة مطابقات الميزانية وقوائم التدقيق.',
      deliverables: [
        'Structured Month-End Closing Timeline & Checklist',
        'Balance Sheet Account Reconciliation Template Kit',
        'Executive Financial KPI Dashboard'
      ],
      deliverablesAr: [
        'الجدول الزمني وقائمة تدقيق الإقفال المالي الشهري',
        'حزمة نماذج تسويات ومطابقات أرصدة الميزانية العمومية',
        'لوحة المؤشرات المالية التنفيذية للإدارة العليا'
      ],
      estimatedWeeks: 3
    },
    {
      id: 'srv-cfo',
      title: 'Part-Time / Advisory Fractional CFO Engagement',
      titleAr: 'خدمات المدير المالي التنفيذي الاستشاري (Fractional CFO)',
      category: 'Executive Advisory',
      description: 'Dedicated senior financial strategist providing board advisory, 13-week cash forecasting, banking relationship management, and governance oversight.',
      descriptionAr: 'خبير مالي تنفيذي لمساندة مجلس الإدارة والإدارة العليا في التخطيط المالي، وإدارة السيولة، والعلاقات البنكية والحوكمة المستمرة.',
      deliverables: [
        'Monthly Board Strategic Financial Pack',
        '13-Week Rolling Liquidity Model',
        'Bi-weekly CFO leadership meetings'
      ],
      deliverablesAr: [
        'الملف المالي الاستراتيجي الشهري لمجلس الإدارة',
        'نموذج توقعات السيولة النقدية المتجدد لـ 13 أسبوعاً',
        'اجتماعات قيادية دورية لمتابعة الأداء المالي والرقابي'
      ],
      estimatedWeeks: 12
    }
  ];

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceRequest({
      companyId: activeCompany.id,
      serviceTitle: serviceTitleInput,
      contactName: fullName,
      contactEmail: email,
      preferredDate,
      notes,
      status: 'pending'
    });

    setSuccessMessage(t('requestConfirmed'));
    setIsModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleOpenModal = (pkg?: ServicePackage) => {
    if (pkg) {
      setSelectedService(pkg);
      setServiceTitleInput(language === 'ar' ? pkg.titleAr : pkg.title);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('services')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Certified financial advisory engagements and bespoke governance implementations delivered by Ihkam specialists.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('requestConsultation')}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-700/50 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 inline-block mb-2">
                {pkg.category}
              </span>

              <h2 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                {language === 'ar' ? pkg.titleAr : pkg.title}
              </h2>

              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                {language === 'ar' ? pkg.descriptionAr : pkg.description}
              </p>

              {/* Key Deliverables */}
              <div className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3 mb-4">
                <span className="font-bold text-slate-800 text-[11px] block">Key Engagement Outputs:</span>
                {(language === 'ar' ? pkg.deliverablesAr : pkg.deliverables).map((deliv, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Est. Duration: <strong>{pkg.estimatedWeeks} weeks</strong>
              </span>

              <button
                onClick={() => handleOpenModal(pkg)}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Inquire Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submitted Requests Log */}
      {serviceRequests.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Your Requested Consultations ({serviceRequests.length})</h2>
          <div className="divide-y divide-slate-100">
            {serviceRequests.map((req) => (
              <div key={req.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{req.serviceTitle}</p>
                  <p className="text-slate-500 text-[11px]">
                    Requested by {req.contactName} ({req.contactEmail}) • Target: {req.preferredDate}
                  </p>
                  {req.notes && <p className="text-slate-600 text-[11px] mt-0.5 italic">&quot;{req.notes}&quot;</p>}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 shrink-0 capitalize">
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONSULTATION REQUEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="bg-[#102D32] text-white p-5">
              <h2 className="text-base font-bold text-white">{t('requestConsultation')}</h2>
              <p className="text-xs text-teal-200 mt-0.5">{t('consultationSubtitle')}</p>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service / Advisory Focus Area</label>
                <input
                  type="text"
                  required
                  value={serviceTitleInput}
                  onChange={(e) => setServiceTitleInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('fullName')}</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('emailAddress')}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('preferredDate')}</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('notesRequirements')}</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention any specific ERP constraints, upcoming board meetings, or audit timelines..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 text-white rounded-lg font-bold hover:bg-teal-800"
                >
                  {t('submitRequest')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
