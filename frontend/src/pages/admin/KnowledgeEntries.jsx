import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ShieldCheck, ShieldAlert, Edit, Trash2, CheckCircle, RefreshCw, X, ExternalLink } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import StreamBadge from '../../components/common/StreamBadge';
import {
  getKnowledgeEntries,
  createKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
  toggleVerifyKnowledgeEntry,
  getAdminCategories,
  getAdminJurisdictions
} from '../../services/adminService';

const WASTE_STREAMS = ['WET_WASTE', 'DRY_WASTE', 'SANITARY_WASTE', 'SPECIAL_CARE_WASTE'];

export default function KnowledgeEntries() {
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStream, setFilterStream] = useState('');
  const [filterVerified, setFilterVerified] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    wasteCategory: 'PLASTIC_CONTAINER',
    wasteStream: 'DRY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: '',
    sourceTitle: '',
    sourceUrl: '',
    sourceAuthority: '',
    verified: false
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesRes, catsRes, jurisRes] = await Promise.all([
        getKnowledgeEntries({
          search: search || undefined,
          wasteStream: filterStream || undefined,
          verified: filterVerified || undefined
        }),
        getAdminCategories().catch(() => ({ categories: [] })),
        getAdminJurisdictions().catch(() => ({ jurisdictions: [] }))
      ]);
      setEntries(entriesRes.entries || []);
      setCategories(catsRes.categories || []);
      setJurisdictions(jurisRes.jurisdictions || []);
    } catch (err) {
      console.error('Failed to load KB data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStream, filterVerified]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setFormData({
      wasteCategory: categories[0] || 'PLASTIC_CONTAINER',
      wasteStream: 'DRY_WASTE',
      jurisdiction: 'GENERAL_INDIA',
      guidanceText: '',
      sourceTitle: '',
      sourceUrl: '',
      sourceAuthority: '',
      verified: false
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      wasteCategory: entry.wasteCategory,
      wasteStream: entry.wasteStream,
      jurisdiction: entry.jurisdiction,
      guidanceText: entry.guidanceText,
      sourceTitle: entry.sourceTitle,
      sourceUrl: entry.sourceUrl,
      sourceAuthority: entry.sourceAuthority || '',
      verified: entry.verified
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleToggleVerify = async (id) => {
    try {
      const updated = await toggleVerifyKnowledgeEntry(id);
      setEntries(entries.map(e => (e._id === id ? updated.entry : e)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle verification status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this knowledge entry? This will also remove it from LanceDB vector store.')) {
      return;
    }
    try {
      await deleteKnowledgeEntry(id);
      setEntries(entries.filter(e => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete knowledge entry.');
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    setModalError('');
    setSaving(true);
    try {
      if (editingEntry) {
        const res = await updateKnowledgeEntry(editingEntry._id, formData);
        setEntries(entries.map(e => (e._id === editingEntry._id ? res.entry : e)));
      } else {
        const res = await createKnowledgeEntry(formData);
        setEntries([res.entry, ...entries]);
      }
      setModalOpen(false);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save entry. Check all fields.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <AdminHeader />

      <div className="space-y-6">
        {/* Top bar: title + create button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base Entries</h1>
            <p className="text-xs text-slate-500">
              Verified ground truth for RAG retrieval and IBM Granite citation grounding.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Knowledge Entry</span>
          </button>
        </div>

        {/* Filters and search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guidance, sources..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:border-brand-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={filterStream}
              onChange={(e) => setFilterStream(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="">All Streams</option>
              {WASTE_STREAMS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="">All Verification States</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified / Drafts</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh table"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Category & Stream</th>
                  <th className="py-3.5 px-4">Jurisdiction</th>
                  <th className="py-3.5 px-4 max-w-xs">Guidance Summary</th>
                  <th className="py-3.5 px-4">Source Reference</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      {loading ? 'Loading knowledge entries...' : 'No knowledge entries found matching criteria.'}
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {entry.wasteCategory}
                        </div>
                        <div className="mt-1">
                          <StreamBadge stream={entry.wasteStream} className="scale-90 origin-left" />
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {entry.jurisdiction}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-800">
                          {entry.guidanceText}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 line-clamp-1">
                          {entry.sourceTitle}
                        </div>
                        {entry.sourceUrl && (
                          <a
                            href={entry.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-brand-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleVerify(entry._id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            entry.verified
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                          }`}
                          title="Click to toggle verified status"
                        >
                          {entry.verified ? (
                            <>
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(entry)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit entry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingEntry ? 'Edit Knowledge Entry' : 'Create Knowledge Base Entry'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Waste Category</label>
                  <select
                    value={formData.wasteCategory}
                    onChange={(e) => setFormData({ ...formData, wasteCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none"
                    required
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Waste Stream</label>
                  <select
                    value={formData.wasteStream}
                    onChange={(e) => setFormData({ ...formData, wasteStream: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none"
                    required
                  >
                    {WASTE_STREAMS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jurisdiction / ULB</label>
                <input
                  type="text"
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                  placeholder="GENERAL_INDIA or e.g. BBMP_BANGALORE"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guidance Text</label>
                <textarea
                  rows={4}
                  value={formData.guidanceText}
                  onChange={(e) => setFormData({ ...formData, guidanceText: e.target.value })}
                  placeholder="Official disposal instructions, segregation rules, cleaning steps, bin color..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source Title</label>
                  <input
                    type="text"
                    value={formData.sourceTitle}
                    onChange={(e) => setFormData({ ...formData, sourceTitle: e.target.value })}
                    placeholder="e.g. Swachh Bharat Solid Waste Rules"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source Authority</label>
                  <input
                    type="text"
                    value={formData.sourceAuthority}
                    onChange={(e) => setFormData({ ...formData, sourceAuthority: e.target.value })}
                    placeholder="e.g. CPCB / MoHUA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source URL</label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://cpcb.nic.in/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="verifiedCheck"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="verifiedCheck" className="text-xs font-medium text-slate-700">
                  Mark as officially verified Indian ULB guideline
                </label>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                  {modalError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingEntry ? 'Update & Re-index' : 'Create & Index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
