import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, ShieldCheck, Activity, CheckCircle, AlertTriangle, Layers, ArrowRight, RefreshCw, Cpu } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { getKnowledgeEntries, getQueryLogs } from '../../services/adminService';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [entriesRes, logsRes] = await Promise.all([
          getKnowledgeEntries({ limit: 100 }).catch(() => ({ entries: [] })),
          getQueryLogs({ limit: 50 }).catch(() => ({ logs: [] }))
        ]);
        setEntries(entriesRes.entries || []);
        setLogs(logsRes.logs || []);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalEntries = entries.length;
  const verifiedCount = entries.filter(e => e.verified).length;
  const unverifiedCount = totalEntries - verifiedCount;

  const totalLogs = logs.length;
  const confidentLogs = logs.filter(l => l.outcome === 'CONFIDENT').length;
  const uncertainLogs = logs.filter(l => l.outcome === 'UNCERTAIN').length;
  const coverageLogs = logs.filter(l => l.outcome === 'COVERAGE_INSUFFICIENT').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <AdminHeader />

      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Knowledge Entries</span>
              <Database className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{totalEntries}</div>
            <p className="text-xs text-slate-500 mt-1">Indexed in MongoDB & LanceDB</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Guidelines</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">{verifiedCount}</div>
            <p className="text-xs text-slate-500 mt-1">{unverifiedCount} pending ULB verification</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Recent Audit Queries</span>
              <Activity className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{totalLogs}</div>
            <p className="text-xs text-slate-500 mt-1">Anonymized query log events</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Confident Ratio</span>
              <CheckCircle className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {totalLogs > 0 ? `${Math.round((confidentLogs / totalLogs) * 100)}%` : '100%'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Passed both Gate 1 & Gate 2
            </p>
          </div>
        </div>

        {/* System & AI Architecture Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              IBM watsonx.ai & RAG Stack Infrastructure
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">IBM Granite Vision & Text</span>
              <p className="text-slate-600">
                Multimodal classification for images and text into 22 taxonomy categories.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">IBM Slate Embeddings + LanceDB</span>
              <p className="text-slate-600">
                Embedded vector store running in-process for fast cosine similarity and metadata filtering.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">MongoDB Atlas</span>
              <p className="text-slate-600">
                Authoritative source of truth for Knowledge Base entries, jurisdictions, and query logs.
              </p>
            </div>
          </div>
        </div>

        {/* Quick action links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/admin/knowledge-entries"
            className="group p-6 rounded-3xl bg-white border border-slate-200 hover:border-brand-500 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">
                Knowledge Base Management
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Add, update, delete, or toggle verified status of Indian ULB waste rules.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/query-log"
            className="group p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-500 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-slate-900 text-base group-hover:text-sky-700 transition-colors">
                Audit Query Logs
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Inspect outcome distribution (Confident, Uncertain, Coverage Insufficient) without PII.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
