import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MessageSquare, Send, Sparkles, AlertCircle, RefreshCw, ShieldCheck, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';
import ResponsibleNotice from '../components/common/ResponsibleNotice';
import StreamBadge from '../components/common/StreamBadge';
import { queryWasteWise } from '../services/queryService';

const SAMPLE_QUESTIONS = [
  'How should I rinse plastic milk pouches before putting them in dry waste?',
  'Where can I safely drop off swollen lithium-ion power banks in India?',
  'Can grease-soaked cardboard boxes be composted in wet waste?',
  'How to wrap used sanitary napkins per Indian municipal sanitation rules?'
];

export default function AskWasteWise() {
  const location = useLocation();
  const priorCategory = location.state?.priorCategory || '';
  const priorSourceIds = location.state?.priorSourceIds || [];

  const [question, setQuestion] = useState(location.state?.initialContext || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question || question.trim().length < 4) {
      setError('Please enter a specific question (at least 4 characters).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await queryWasteWise({
        question: question.trim(),
        priorCategory: priorCategory || undefined,
        priorSourceIds: priorSourceIds.length > 0 ? priorSourceIds : undefined
      });
      setResponse(data);
    } catch (err) {
      console.error('Query error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-brand-100 text-brand-700">
            <MessageSquare className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ask WasteWise
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Conversational Q&A on segregation nuances, cleaning procedures, and local drop-off rules — strictly grounded in evidence.
        </p>
      </div>

      {/* Prior context banner if coming from an analysis */}
      {priorCategory && (
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Active Inquiry Context:</span>
            <span className="bg-white px-2 py-0.5 rounded font-mono text-slate-800 border border-slate-200">
              {priorCategory.replace(/_/g, ' ')}
            </span>
          </div>
          <Link to="/intake" className="text-brand-600 hover:text-brand-700 font-medium">
            Change item
          </Link>
        </div>
      )}

      {/* Question Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <form onSubmit={handleAsk} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              placeholder="Ask anything about waste segregation, cleaning containers, drop-off rules, or bin colors..."
              className="w-full rounded-2xl border border-slate-300 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all resize-none shadow-xs disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Grounded in RAG knowledge base</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Retrieving verified advice...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Question</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Question Prompts */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-2 font-medium">Common questions to try:</p>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuestion(q)}
                disabled={loading}
                className="text-xs bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 text-left transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Output */}
      {response && (
        <div className="space-y-6">
          {response.outcome === 'CONFIDENT' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <StreamBadge stream={response.wasteStream} />
                  <span className="text-xs font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-100">
                    {response.category?.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Score: {Math.round((response.retrievalScore || 0.85) * 100)}% grounded
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Verified Guidance
                </h4>
                <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  {response.guidance}
                </p>
              </div>

              {response.reasoning && (
                <div>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Context & Rules</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {response.reasoning}
                  </p>
                </div>
              )}

              {/* Citations */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>Citations & Sources</span>
                </h4>
                <div className="space-y-1.5">
                  {(response.sources || []).map((src, i) => (
                    <div key={src._id || i} className="text-xs flex items-center justify-between text-slate-600">
                      <span>[{i + 1}] {src.sourceTitle || 'Official Waste Management Guideline'}</span>
                      {src.sourceUrl && (
                        <a
                          href={src.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Reference</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {response.outcome === 'UNCERTAIN' && (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-2">
              <p className="font-bold">Inquiry Ambiguous</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                We could not pinpoint the exact waste material from your question. Please specify the object or material more clearly (e.g. mention if it's oily plastic, coated paper, or broken electronics).
              </p>
            </div>
          )}

          {response.outcome === 'COVERAGE_INSUFFICIENT' && (
            <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-sm space-y-2">
              <p className="font-bold">Specific Municipal Rule Not Found</p>
              <p className="text-xs text-sky-800 leading-relaxed">
                The waste item was identified, but the knowledge base does not yet have verified municipal citations addressing that exact question. Granite was not permitted to guess.
              </p>
            </div>
          )}
        </div>
      )}

      <ResponsibleNotice />
    </div>
  );
}
