import React, { useEffect, useMemo, useState } from 'react';

const riskLevels = ['All', 'Low', 'Medium', 'High'];

function formatDate(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/history');
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error || 'Unable to load history.');
        }

        const data = await response.json();
        setHistoryItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to load history.');
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return historyItems.filter((item) => {
      const matchesSearch = item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'All' || item.riskLevel?.toLowerCase() === riskFilter.toLowerCase();
      return matchesSearch && matchesRisk;
    });
  }, [historyItems, searchTerm, riskFilter]);

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">History</h2>
        <p className="mt-2 text-sm text-slate-600">Review previous contract analyses, filter by risk level, and inspect detailed summaries.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="text-sm font-medium text-slate-700">Search</label>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search contract name or summary"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
          />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="text-sm font-medium text-slate-700">Filter by Risk Level</label>
          <select
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
          >
            {riskLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading history...</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">Contract Name</th>
                  <th className="px-4 py-3">Risk Score</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                {filteredHistory.length ? (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedItem(item)}>
                      <td className="px-4 py-4 font-medium text-slate-900">{item.filename || 'Untitled Contract'}</td>
                      <td className="px-4 py-4">{item.riskScore ?? 'N/A'}</td>
                      <td className="px-4 py-4 capitalize">{item.riskLevel || 'N/A'}</td>
                      <td className="px-4 py-4">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={4}>
                      No history items match your search and filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Details</h3>
          {selectedItem ? (
            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-900">Contract Name</p>
                <p>{selectedItem.filename || 'Untitled Contract'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Risk Score</p>
                <p>{selectedItem.riskScore ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Risk Level</p>
                <p>{selectedItem.riskLevel || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Date</p>
                <p>{formatDate(selectedItem.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Summary</p>
                <p className="whitespace-pre-line text-slate-700">{selectedItem.summary || 'No summary available.'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Red Flags</p>
                {(() => {
                  try {
                    const flags = selectedItem.redFlags ? JSON.parse(selectedItem.redFlags) : [];
                    if (Array.isArray(flags) && flags.length > 0) {
                      return (
                        <ul className="list-disc pl-4 space-y-2 text-slate-700">
                          {flags.map((flag, idx) => (
                            <li key={idx} className="text-sm">
                              <span className="font-semibold text-slate-900">{flag.id || flag.type || `Flag ${idx + 1}`}</span>
                              {flag.severity && (
                                <span className={`ml-2 px-1.5 py-0.5 text-xs font-semibold rounded ${
                                  flag.severity.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                                  flag.severity.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {flag.severity}
                                </span>
                              )}
                              <p className="mt-0.5 text-xs text-slate-600">{flag.description || 'No description provided.'}</p>
                              {flag.mitigation && <p className="text-xs text-green-700"><span className="font-medium">Mitigation:</span> {flag.mitigation}</p>}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                  } catch (e) {}
                  return <p className="text-slate-500">No red flags recorded.</p>;
                })()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Recommendations</p>
                {(() => {
                  try {
                    const recs = selectedItem.recommendations ? JSON.parse(selectedItem.recommendations) : [];
                    if (Array.isArray(recs) && recs.length > 0) {
                      return (
                        <ul className="list-disc pl-4 space-y-2 text-slate-700">
                          {recs.map((rec, idx) => (
                            <li key={idx} className="text-sm">
                              <span className="font-semibold text-slate-900">{rec.id || `Rec ${idx + 1}`}</span>
                              {rec.priority && (
                                <span className={`ml-2 px-1.5 py-0.5 text-xs font-semibold rounded ${
                                  rec.priority.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                                  rec.priority.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {rec.priority}
                                </span>
                              )}
                              <p className="mt-0.5 text-xs text-slate-600"><span className="font-medium">Area:</span> {rec.area || 'General'}</p>
                              <p className="text-xs text-slate-700"><span className="font-medium">Action:</span> {rec.action || 'No action specified.'}</p>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                  } catch (e) {}
                  return <p className="text-slate-500">No recommendations recorded.</p>;
                })()}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">Select a history entry to view more details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;
