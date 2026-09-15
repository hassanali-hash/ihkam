'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { MODULES_LIST } from '@/lib/modulesData';
import { EvidenceRecord, EvidenceReviewStatus } from '@/lib/types';
import { getBlob } from '@/lib/idb';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Trash2,
  Eye,
  Paperclip,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';

export function EvidenceCenterView() {
  const {
    language,
    t,
    activeCompany,
    activeUser,
    evidence,
    addEvidence,
    updateEvidence,
    deleteEvidence,
    canMutate,
    isReviewer
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<EvidenceRecord | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reviewNotesModal, setReviewNotesModal] = useState<EvidenceRecord | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState<string>('');

  // Selected module filter
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvidence = evidence.filter((e) => {
    if (moduleFilter !== 'all' && e.moduleId !== moduleFilter) return false;
    if (statusFilter !== 'all' && e.reviewStatus !== statusFilter) return false;
    return true;
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !canMutate) return;
    setUploadError('');

    const file = files[0];
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit.');
      return;
    }

    try {
      await addEvidence(
        {
          companyId: activeCompany.id,
          moduleId: moduleFilter !== 'all' ? moduleFilter : 'expense_management',
          title: file.name.replace(/\.[^/.]+$/, ''),
          titleAr: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
          uploadedBy: activeUser.name,
          reviewStatus: 'pending'
        },
        file
      );
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document to local database.');
    }
  };

  const handlePreview = async (doc: EvidenceRecord) => {
    setPreviewDoc(doc);
    if (doc.blobKey) {
      const blob = await getBlob(doc.blobKey);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return;
      }
    }
    setPreviewUrl(null);
  };

  const handleDownload = async (doc: EvidenceRecord) => {
    if (doc.blobKey) {
      const blob = await getBlob(doc.blobKey);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
    }
    // Fallback if no binary stored
    const dummyBlob = new Blob([`Evidence document content for ${doc.fileName}`], { type: 'text/plain' });
    const url = URL.createObjectURL(dummyBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSetStatus = (doc: EvidenceRecord, status: EvidenceReviewStatus) => {
    if (!isReviewer) return;
    updateEvidence(doc.id, {
      reviewStatus: status,
      reviewedBy: activeUser.name,
      reviewedAt: new Date().toISOString()
    });
  };

  const handleSaveReviewerNotes = () => {
    if (!reviewNotesModal || !isReviewer) return;
    updateEvidence(reviewNotesModal.id, {
      reviewerNotes: reviewNoteInput,
      reviewedBy: activeUser.name,
      reviewedAt: new Date().toISOString()
    });
    setReviewNotesModal(null);
    setReviewNoteInput('');
  };

  const handleDelete = async (doc: EvidenceRecord) => {
    if (!canMutate) return;
    if (confirm(t('confirmDelete'))) {
      await deleteEvidence(doc.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('evidenceCenter')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Secure browser repository for financial policies, bank statements, sample approvals, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t('uploadEvidence')}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      {canMutate && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 md:p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-teal-600 bg-teal-50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-teal-700 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-800">{t('dragDropText')}</p>
          <p className="text-[11px] text-slate-400 mt-1">{t('supportedFiles')}</p>
          {uploadError && <p className="text-rose-600 text-xs font-semibold mt-2">{uploadError}</p>}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Modules ({evidence.length})</option>
            {MODULES_LIST.map((m) => (
              <option key={m.id} value={m.id}>
                {language === 'ar' ? m.titleAr : m.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <span className="text-slate-400 font-medium text-[11px]">
          Showing {filteredEvidence.length} documents
        </span>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredEvidence.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No evidence documents found.</p>
            <p className="mt-0.5">Upload supporting policies or vouchers to fulfill control requirements.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Document / File</th>
                  <th className="py-3 px-3">Module</th>
                  <th className="py-3 px-3">Size & Date</th>
                  <th className="py-3 px-3">Review Status</th>
                  <th className="py-3 px-4">Reviewer Feedback</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvidence.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-900 truncate max-w-xs">{doc.fileName}</p>
                          <p className="text-[11px] text-slate-400">Uploaded by {doc.uploadedBy}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-top">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {doc.moduleId}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 align-top text-slate-500 text-[11px]">
                      <p>{formatFileSize(doc.fileSize)}</p>
                      <p>{doc.uploadedAt.split('T')[0]}</p>
                    </td>

                    <td className="py-3.5 px-3 align-top">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        doc.reviewStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : doc.reviewStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {doc.reviewStatus === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {doc.reviewStatus === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {doc.reviewStatus === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{t(doc.reviewStatus as any)}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-xs text-[11px] text-slate-600">
                      {doc.reviewerNotes ? (
                        <p className="line-clamp-2 italic">&quot;{doc.reviewerNotes}&quot;</p>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                      {isReviewer && (
                        <button
                          onClick={() => {
                            setReviewNotesModal(doc);
                            setReviewNoteInput(doc.reviewerNotes || '');
                          }}
                          className="text-[10px] text-teal-700 hover:underline font-semibold block mt-0.5"
                        >
                          Edit Feedback
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handlePreview(doc)}
                          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600"
                          title={t('previewDoc')}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600"
                          title={t('downloadDoc')}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Reviewer Quick Approval / Reject buttons */}
                        {isReviewer && doc.reviewStatus !== 'approved' && (
                          <button
                            onClick={() => handleSetStatus(doc, 'approved')}
                            className="p-1.5 hover:bg-emerald-100 text-emerald-700 rounded-md"
                            title="Approve Evidence"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isReviewer && doc.reviewStatus !== 'rejected' && (
                          <button
                            onClick={() => handleSetStatus(doc, 'rejected')}
                            className="p-1.5 hover:bg-rose-100 text-rose-700 rounded-md"
                            title="Reject Evidence"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canMutate && (
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-md"
                            title={t('deleteDoc')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900 flex flex-col max-h-[85vh]">
            <div className="bg-[#102D32] text-white p-4 flex items-center justify-between">
              <div className="truncate">
                <h3 className="font-bold text-sm truncate">{previewDoc.fileName}</h3>
                <p className="text-[11px] text-teal-200">
                  {formatFileSize(previewDoc.fileSize)} • Uploaded {previewDoc.uploadedAt.split('T')[0]}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-300 hover:text-white text-sm px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center">
              {previewUrl ? (
                previewDoc.fileType.startsWith('image/') ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={previewUrl} alt={previewDoc.fileName} className="max-h-[60vh] object-contain rounded-lg shadow-xs" />
                ) : (
                  <iframe src={previewUrl} className="w-full h-96 border rounded-lg bg-white" title="Doc Preview" />
                )
              ) : (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-xl shadow-xs max-w-md">
                  <FileText className="w-12 h-12 text-teal-700 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 text-sm">{previewDoc.fileName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sample governance document stored in browser local storage.
                  </p>
                  <button
                    onClick={() => handleDownload(previewDoc)}
                    className="mt-4 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Download Local Copy
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white p-4 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Status: {previewDoc.reviewStatus}</span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEWER FEEDBACK MODAL */}
      {reviewNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Review Feedback for {reviewNotesModal.fileName}
            </h3>
            <textarea
              rows={4}
              value={reviewNoteInput}
              onChange={(e) => setReviewNoteInput(e.target.value)}
              placeholder="Provide specific notes regarding compliance, missing signatures, or validity..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setReviewNotesModal(null)}
                className="px-4 py-2 border rounded-lg font-semibold hover:bg-slate-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveReviewerNotes}
                className="px-4 py-2 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800"
              >
                Save Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
