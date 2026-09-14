import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ExternalLink, HelpCircle, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';
import StreamBadge from '../common/StreamBadge';

export default function ResultConfident({ result, onAskFollowUp }) {
  const {
    category,
    wasteStream,
    jurisdiction,
    guidance,
    reasoning,
    cautionNotes,
    sources = [],
    identificationConfidence,
    retrievalScore
  } = result;

  return (
    <div className="space-y-6">
      {/* Outcome Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-emerald-950">Confident Identification</h3>
                <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Gate 1: {identificationConfidence ? `${Math.round(identificationConfidence * 100)}%` : 'Passed'}
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Grounding evidence verified in RAG knowledge base (Score: {retrievalScore ? `${Math.round(retrievalScore * 100)}%` : 'Passed'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <StreamBadge stream={wasteStream} />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {category?.replace(/_/g, ' ')}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/80 text-slate-600 border border-slate-200">
              📍 {jurisdiction || 'GENERAL_INDIA'}
            </span>
          </div>
        </div>

        {/* Guidance section */}
        <div className="mt-5 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>Disposal & Segregation Guidance</span>
            </h4>
            <div className="text-slate-800 text-sm sm:text-base leading-relaxed bg-white/80 p-4 rounded-xl border border-emerald-100/80 shadow-2xs whitespace-pre-line">
              {guidance}
            </div>
          </div>

          {/* Reasoning */}
          {reasoning && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Why this classification?</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                {reasoning}
              </p>
            </div>
          )}

          {/* Caution notes */}
          {cautionNotes && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-950">Precautions: </span>
                <span>{cautionNotes}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sources & Citations list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              Retrieved Grounding Sources ({sources.length})
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Strictly grounded in evidence</span>
        </div>

        {sources.length === 0 ? (
          <p className="text-xs text-slate-500">No external URLs cited in knowledge document.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sources.map((src, index) => (
              <li key={src._id || src.id || index} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      [{index + 1}] {src.sourceTitle || 'Official Waste Management Guideline'}
                    </span>
                    {src.verified ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                        ULB Benchmark Draft
                      </span>
                    )}
                  </div>
                  {src.sourceAuthority && (
                    <p className="text-[11px] text-slate-500">Authority: {src.sourceAuthority}</p>
                  )}
                </div>

                {src.sourceUrl && (
                  <a
                    href={src.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium hover:underline shrink-0"
                  >
                    <span>View Reference</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action to Ask follow-up */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 text-white p-5 rounded-2xl shadow-md">
        <div>
          <h5 className="font-semibold text-sm">Have more questions about this item?</h5>
          <p className="text-xs text-slate-400">Ask about cleaning, municipal collection days, or local recycling centers.</p>
        </div>
        <button
          onClick={onAskFollowUp}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask WasteWise</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
