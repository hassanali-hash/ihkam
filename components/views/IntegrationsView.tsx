'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface MockTransaction {
  id: string;
  reference: string;
  type: string;
  amount: number;
  date: string;
  beneficiary: string;
  approvalsCount: number;
  hasVatInvoice: boolean;
  status: 'passed' | 'flagged';
  flagReason?: string;
}

export function IntegrationsView() {
  const { language, t, activeCompany } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('Connected • Last sync: 12 minutes ago');

  const [transactions, setTransactions] = useState<MockTransaction[]>([
    {
      id: 'tx-101',
      reference: 'EXP-2025-0891',
      type: 'Vendor Wire Transfer',
      amount: 68500,
      date: '2025-09-14',
      beneficiary: 'Gulf Logistics Co.',
      approvalsCount: 1, // Violates >50k dual rule!
      hasVatInvoice: true,
      status: 'flagged',
      flagReason: 'Missing mandatory 2nd signatory for transfers > 50,000 SAR'
    },
    {
      id: 'tx-102',
      reference: 'EXP-2025-0892',
      type: 'Executive Travel Reimbursement',
      amount: 8200,
      date: '2025-09-13',
      beneficiary: 'Marketing Director',
      approvalsCount: 2,
      hasVatInvoice: true,
      status: 'passed'
    },
    {
      id: 'tx-103',
      reference: 'INV-2025-0341',
      type: 'Inventory Scrap Write-off',
      amount: 34000,
      date: '2025-09-12',
      beneficiary: 'Central Warehouse B',
      approvalsCount: 1,
      hasVatInvoice: false,
      status: 'flagged',
      flagReason: 'Inventory write-off lacks independent finance inspection signature'
    },
    {
      id: 'tx-104',
      reference: 'PAY-2025-009',
      type: 'Monthly Payroll Batch (WPS)',
      amount: 142000,
      date: '2025-09-01',
      beneficiary: 'Al-Rajhi WPS File',
      approvalsCount: 2,
      hasVatInvoice: true,
      status: 'passed'
    },
    {
      id: 'tx-105',
      reference: 'EXP-2025-0893',
      type: 'Office Supplies & IT Hardware',
      amount: 23500,
      date: '2025-09-10',
      beneficiary: 'Jarir Bookstore Commercial',
      approvalsCount: 1,
      hasVatInvoice: false,
      status: 'flagged',
      flagReason: 'Tax invoice XML cryptographic stamp verification failed'
    }
  ]);

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus(`Connected • Last sync: Just now (via ${activeCompany.erpSystem.toUpperCase()} API)`);
    }, 1200);
  };

  const handleInjectSample = () => {
    const newTx: MockTransaction = {
      id: `tx-${Date.now()}`,
      reference: `EXP-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Petty Cash Replenishment',
      amount: 14500,
      date: new Date().toISOString().split('T')[0],
      beneficiary: 'Branch Custodian',
      approvalsCount: 1,
      hasVatInvoice: true,
      status: 'passed'
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('integrations')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time transaction surveillance and automated financial governance rule evaluator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInjectSample}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-teal-700" />
            <span>Simulate ERP Voucher</span>
          </button>

          <button
            disabled={isSyncing}
            onClick={handleSyncNow}
            className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync ERP Now'}</span>
          </button>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">ERP Data Pipeline</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
              Live Socket
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900 capitalize">
            {activeCompany.erpSystem.replace('_', ' ')}
          </p>
          <p className="text-[11px] text-slate-500">{syncStatus}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">ZATCA Fatoora Connector</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900">
              Validated
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900">Phase 2 Compliant</p>
          <p className="text-[11px] text-slate-500">Cryptographic stamps and XML schemas verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Continuous Audit Engine</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900">
              {transactions.filter((t) => t.status === 'flagged').length} Anomalies
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900">Rule Evaluator Active</p>
          <p className="text-[11px] text-slate-500">Evaluating 12 deterministic internal control rules</p>
        </div>
      </div>

      {/* Real-Time Transaction Surveillance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Transaction Surveillance &amp; Control Exceptions</h2>
            <p className="text-slate-500 text-[11px]">Real-time audit log evaluating vouchers against authority matrices</p>
          </div>
          <span className="text-slate-400 text-xs font-medium">{transactions.length} Streamed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Ref &amp; Date</th>
                <th className="py-3 px-3">Transaction Type</th>
                <th className="py-3 px-3">Beneficiary</th>
                <th className="py-3 px-3 text-right rtl:text-left">Amount ({activeCompany.currency})</th>
                <th className="py-3 px-3 text-center">Approvals</th>
                <th className="py-3 px-4">Rule Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono">
                    <p className="font-bold text-slate-900">{tx.reference}</p>
                    <p className="text-[11px] text-slate-400">{tx.date}</p>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {tx.type}
                  </td>

                  <td className="py-3 px-3 text-slate-600">
                    {tx.beneficiary}
                  </td>

                  <td className="py-3 px-3 text-right rtl:text-left font-bold text-slate-900">
                    {tx.amount.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.approvalsCount >= 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tx.approvalsCount} Signature{tx.approvalsCount > 1 ? 's' : ''}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {tx.status === 'flagged' ? (
                      <div className="flex items-start gap-1.5 text-rose-700">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="text-[11px] font-semibold leading-tight">{tx.flagReason}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-semibold">Compliant with Matrix</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
