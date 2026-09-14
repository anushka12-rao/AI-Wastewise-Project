import React from 'react';
import { HelpCircle, RefreshCw, Camera, FileText, ArrowLeft } from 'lucide-react';

export default function ResultUncertain({ result, onRetry }) {
  const { topConfidence, topCategory, candidates = [] } = result;

  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
          <HelpCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-amber-950">Identification Uncertain</h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
              Gate 1 Halted
            </span>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">
            The AI vision/text identification model could not determine the waste item category with adequate confidence.
            In compliance with our Responsible AI principles, the system halts before retrieval and grounded generation rather than guessing.
          </p>
        </div>
      </div>

      {/* Candidate probabilities if available */}
      {candidates.length > 0 && (
        <div className="bg-white/80 rounded-xl p-4 border border-amber-200/70">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-950 mb-2">
            Potential Matches (Below Required Confidence Threshold)
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidates.map((cand, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full font-medium border border-amber-200"
              >
                {cand.category?.replace(/_/g, ' ')}: {Math.round((cand.confidence || 0) * 100)}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* How to improve suggestions */}
      <div className="bg-white/80 rounded-xl p-5 border border-amber-200/70 space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">How to get an accurate result:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <Camera className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-700">
              <span className="font-semibold block text-slate-900">Clearer Photograph</span>
              Ensure good lighting, plain background, and focus directly on material labels or recycling numbers.
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <FileText className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-700">
              <span className="font-semibold block text-slate-900">Add Material Details</span>
              Mention if it is food-soiled, made of composite materials (foil + plastic), or has electrical components.
            </div>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="pt-2 flex justify-start">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Try Again with More Details</span>
        </button>
      </div>
    </div>
  );
}
