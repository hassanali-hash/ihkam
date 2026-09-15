'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Industry, ErpSystem } from '@/lib/types';
import {
  Building,
  Save,
  CheckCircle2,
  Calendar,
  Layers,
  Cpu,
  AlertCircle
} from 'lucide-react';

export function CompanyProfileView() {
  const { language, t, activeCompany, updateCompany, canMutate } = useApp();

  const [name, setName] = useState(activeCompany.name);
  const [nameAr, setNameAr] = useState(activeCompany.nameAr);
  const [industry, setIndustry] = useState<Industry>(activeCompany.industry);
  const [currency, setCurrency] = useState(activeCompany.currency);
  const [employeeRange, setEmployeeRange] = useState(activeCompany.employeeRange);
  const [annualRevenueRange, setAnnualRevenueRange] = useState(activeCompany.annualRevenueRange);
  const [branchCount, setBranchCount] = useState(activeCompany.branchCount);
  const [mainActivities, setMainActivities] = useState(activeCompany.mainActivities);
  const [mainActivitiesAr, setMainActivitiesAr] = useState(activeCompany.mainActivitiesAr || activeCompany.mainActivities);
  const [erpSystem, setErpSystem] = useState<ErpSystem>(activeCompany.erpSystem);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMutate) return;

    updateCompany({
      name,
      nameAr,
      industry,
      currency,
      employeeRange,
      annualRevenueRange,
      branchCount: Number(branchCount) || 1,
      mainActivities,
      mainActivitiesAr,
      erpSystem
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('companyProfile')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Core organizational parameters used to baseline control maturity and governance thresholds.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile saved successfully</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('companyName')} *</label>
            <input
              type="text"
              required
              disabled={!canMutate}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('companyNameAr')} *</label>
            <input
              type="text"
              required
              disabled={!canMutate}
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('industry')}</label>
            <select
              disabled={!canMutate}
              value={industry}
              onChange={(e) => setIndustry(e.target.value as Industry)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="trading_distribution">Trading & Distribution</option>
              <option value="professional_services">Professional Services</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="construction">Construction & Contracting</option>
              <option value="hospitality">Hospitality & F&B</option>
              <option value="other">Other Commercial</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('currency')}</label>
            <select
              disabled={!canMutate}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="SAR">SAR (Saudi Riyal)</option>
              <option value="AED">AED (UAE Dirham)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="KWD">KWD (Kuwaiti Dinar)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('branchCount')} *</label>
            <input
              type="number"
              min="1"
              required
              disabled={!canMutate}
              value={branchCount}
              onChange={(e) => setBranchCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('employeeCount')}</label>
            <select
              disabled={!canMutate}
              value={employeeRange}
              onChange={(e) => setEmployeeRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="1-10">1 - 10 Employees</option>
              <option value="11-50">11 - 50 Employees</option>
              <option value="51-150">51 - 150 Employees</option>
              <option value="151-500">151 - 500 Employees</option>
              <option value="500+">500+ Employees</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('annualRevenue')}</label>
            <select
              disabled={!canMutate}
              value={annualRevenueRange}
              onChange={(e) => setAnnualRevenueRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="Under 3M">Under 3M SAR</option>
              <option value="3M-10M">3M - 10M SAR</option>
              <option value="10M-40M">10M - 40M SAR</option>
              <option value="40M-100M">40M - 100M SAR</option>
              <option value="100M+">100M+ SAR</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">{t('erpSystem')}</label>
          <select
            disabled={!canMutate}
            value={erpSystem}
            onChange={(e) => setErpSystem(e.target.value as ErpSystem)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
          >
            <option value="odoo">Odoo ERP</option>
            <option value="sap">SAP Business One / S/4HANA</option>
            <option value="oracle">Oracle NetSuite</option>
            <option value="microsoft_dynamics">Microsoft Dynamics 365</option>
            <option value="spreadsheets">Spreadsheets / Excel</option>
            <option value="other">Other Commercial Accounting Tool</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">{t('mainActivities')}</label>
          <textarea
            rows={3}
            disabled={!canMutate}
            value={mainActivities}
            onChange={(e) => setMainActivities(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {canMutate && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Company Profile</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
