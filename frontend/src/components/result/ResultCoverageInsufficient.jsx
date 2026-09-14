import React from 'react';
import { Database, AlertCircle, ArrowLeft, Building2 } from 'lucide-react';

export default function ResultCoverageInsufficient({ result, onRetry }) {
  const { category, jurisdiction, message } = result;

  return (
    <div className="bg-sky-50/90 border border-sky-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <Database className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-sky-950">Knowledge Base Coverage Insufficient</h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-200 text-sky-900">
              Gate 2 Halted
            </span>
          </div>
          <p className="text-sm text-sky-900 leading-relaxed">
            The item was successfully identified as{' '}
            <strong className="text-sky-950 font-bold underline">
              {category ? category.replace(/_/g, ' ') : 'a specific waste category'}
            </strong>
            , but our verified knowledge base does not yet have sufficient high-confidence disposal documentation for jurisdiction{' '}
            <span className="font-mono text-xs bg-sky-200/70 px-1.5 py-0.5 rounded text-sky-900">
              {jurisdiction || 'GENERAL_INDIA'}
            </span>
            .
          </p>
        </div>
      </div>

      {/* Grounding guarantee notice */}
      <div className="bg-white/80 rounded-xl p-5 border border-sky-200/70 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-950">
          <AlertCircle className="w-4 h-4 text-sky-700" />
          <span>Strict Grounding Principle</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Unlike generic language models that might invent disposal advice, AI WasteWise enforces a strict retrieval gate:
          <strong> if verifiable municipal sources are not retrieved, Granite LLM generation is deliberately suppressed.</strong>
        </p>
      </div>

      {/* Suggested next steps */}
      <div className="bg-white/80 rounded-xl p-5 border border-sky-200/70 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Building2 className="w-4 h-4 text-slate-700" />
          <span>Recommended Next Steps:</span>
        </div>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li>Check your local Municipal Corporation / Nagar Nigam waste segregation manual.</li>
          <li>For hazardous, electronic, or biomedical waste, do not mix with regular domestic waste.</li>
          <li>This request has been logged for municipal guidelines review by the platform administrator.</li>
        </ul>
      </div>

      {/* Action button */}
      <div className="pt-2 flex justify-start">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Identify Another Item</span>
        </button>
      </div>
    </div>
  );
}
