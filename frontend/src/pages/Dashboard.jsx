import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const MOCK_COLORS = ['#cbd5e1'];

const clauseCoverageData = [
  { name: 'Liability', covered: 85, expected: 100 },
  { name: 'Termination', covered: 70, expected: 100 },
  { name: 'Renewal', covered: 60, expected: 100 },
  { name: 'Compliance', covered: 90, expected: 100 },
  { name: 'Confidentiality', covered: 75, expected: 100 },
];

function Dashboard() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/history`);
        if (res.ok) {
          const data = await res.json();
          setHistoryItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch history for dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const totalContracts = historyItems.length;

  const avgRiskScore = totalContracts > 0
    ? Math.round(historyItems.reduce((sum, item) => sum + (item.riskScore || 0), 0) / totalContracts)
    : 0;

  let avgRiskLevel = 'N/A';
  if (totalContracts > 0) {
    if (avgRiskScore <= 35) avgRiskLevel = 'Low';
    else if (avgRiskScore <= 70) avgRiskLevel = 'Medium';
    else avgRiskLevel = 'High';
  }

  let totalRedFlags = 0;
  let totalRecommendations = 0;
  const recentRedFlags = [];

  historyItems.forEach((item) => {
    try {
      const flags = item.redFlags ? JSON.parse(item.redFlags) : [];
      totalRedFlags += flags.length;
      flags.forEach((f) => {
        recentRedFlags.push({
          id: f.id || 'Risk Alert',
          description: f.description || 'Action required',
          severity: f.severity || 'medium',
          contractName: item.filename,
        });
      });
    } catch (e) {
    }

    try {
      const recs = item.recommendations ? JSON.parse(item.recommendations) : [];
      totalRecommendations += recs.length;
    } catch (e) {
    }
  });

  const lowCount = historyItems.filter(item => item.riskLevel?.toLowerCase() === 'low').length;
  const medCount = historyItems.filter(item => item.riskLevel?.toLowerCase() === 'medium').length;
  const highCount = historyItems.filter(item => item.riskLevel?.toLowerCase() === 'high').length;

  const riskDistributionData = totalContracts > 0
    ? [
        { name: 'Low', value: lowCount },
        { name: 'Medium', value: medCount },
        { name: 'High', value: highCount },
      ].filter(d => d.value > 0)
    : [{ name: 'No Contracts', value: 1 }];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Loading Dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Overview of contract risk, clause coverage, missing provisions, and red flag trends.</p>
      </div>

      {totalContracts === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-base font-semibold text-slate-800">No contract analysis data available</p>
          <p className="mt-1 text-sm text-slate-500">Upload and ingest your first contract PDF to populate dashboard analytics.</p>
          <a
            href="/upload"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Upload Contract
          </a>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Risk Score</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{avgRiskScore}%</p>
              <p className="mt-2 text-xs text-slate-600">Average risk score across {totalContracts} contract(s).</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Average Risk Level</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{avgRiskLevel}</p>
              <p className="mt-2 text-xs text-slate-600">Current aggregate risk classification.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Red Flags Identified</p>
              <p className="mt-3 text-4xl font-semibold text-red-600">{totalRedFlags}</p>
              <p className="mt-2 text-xs text-slate-600">Total critical red flags requiring mitigation.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Recommendations</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{totalRecommendations}</p>
              <p className="mt-2 text-xs text-slate-600">Total recommended actions generated.</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Risk Distribution</h3>
                  <p className="text-sm text-slate-500">Proportion of contracts by risk levels.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Live</div>
              </div>
              <div style={{ width: '100%', height: 300 }} className="flex justify-center items-center">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={4}
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={totalContracts > 0 ? COLORS[index % COLORS.length] : MOCK_COLORS[0]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Typical Clause Coverage</h3>
                  <p className="text-sm text-slate-500">Expected compliance/coverage level across categories.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Standards</div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={clauseCoverageData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="covered" name="Covered" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expected" name="Expected" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Highest Risk Red Flags</h3>
              <p className="text-sm text-slate-500">The most critical items identified across your contracts.</p>
            </div>
            <div className="space-y-4">
              {recentRedFlags.length > 0 ? (
                recentRedFlags.slice(0, 4).map((flag, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 ${
                      flag.severity.toLowerCase() === 'high' ? 'border-red-100 bg-red-50' :
                      flag.severity.toLowerCase() === 'medium' ? 'border-orange-100 bg-orange-50' :
                      'border-yellow-100 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${
                        flag.severity.toLowerCase() === 'high' ? 'text-red-900' :
                        flag.severity.toLowerCase() === 'medium' ? 'text-orange-900' :
                        'text-amber-900'
                      }`}>
                        {flag.id} ({flag.contractName})
                      </p>
                      <span className={`text-xs px-2 py-0.5 font-bold uppercase rounded ${
                        flag.severity.toLowerCase() === 'high' ? 'bg-red-200 text-red-800' :
                        flag.severity.toLowerCase() === 'medium' ? 'bg-orange-200 text-orange-800' :
                        'bg-amber-200 text-amber-800'
                      }`}>
                        {flag.severity}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm ${
                      flag.severity.toLowerCase() === 'high' ? 'text-red-800' :
                      flag.severity.toLowerCase() === 'medium' ? 'text-orange-800' :
                      'text-amber-800'
                    }`}>
                      {flag.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center">
                  <p className="text-sm text-slate-500">No red flags identified in uploaded contracts.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
