import React, { useState, useEffect } from 'react';
import { Activity, Filter, RefreshCw, CheckCircle2, HelpCircle, Database, Search } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { getQueryLogs } from '../../services/adminService';

export default function QueryLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOutcome, setFilterOutcome] = useState('');
  const [filterType, setFilterType] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await getQueryLogs({
        outcome: filterOutcome || undefined,
        type: filterType || undefined
      });
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filterOutcome, filterType]);

  const outcomeBadge = (outcome) => {
    switch (outcome) {
      case 'CONFIDENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            CONFIDENT
          </span>
        );
      case 'UNCERTAIN':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <HelpCircle className="w-3 h-3" />
            UNCERTAIN (Gate 1)
          </span>
        );
      case 'COVERAGE_INSUFFICIENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
            <Database className="w-3 h-3" />
            COVERAGE (Gate 2)
          </span>
        );
      default:
        return outcome;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <AdminHeader />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Query Audit Log</h1>
            <p className="text-xs text-slate-500">
              Anonymized audit trail of user queries and gate outcomes. (No raw images or PII recorded).
            </p>
          </div>
          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Filter Outcome:</span>
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="">All Outcomes</option>
              <option value="CONFIDENT">CONFIDENT</option>
              <option value="UNCERTAIN">UNCERTAIN</option>
              <option value="COVERAGE_INSUFFICIENT">COVERAGE_INSUFFICIENT</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="analyze">analyze (Intake)</option>
              <option value="query">query (Ask WasteWise)</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Outcome</th>
                  <th className="py-3.5 px-4">Input Summary</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Cited Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      {loading ? 'Loading audit logs...' : 'No query logs found matching criteria.'}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {log.type}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {outcomeBadge(log.outcome)}
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate text-slate-800" title={log.inputSummary}>
                        {log.inputSummary || 'N/A'}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {log.wasteCategory || 'N/A'}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {log.citedEntryIds ? `${log.citedEntryIds.length} sources` : '0 sources'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
