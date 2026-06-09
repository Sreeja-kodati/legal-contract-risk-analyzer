import React, { useState } from 'react';

const comparisonMetrics = [
  { key: 'paymentTerms', label: 'Payment Terms' },
  { key: 'penalties', label: 'Penalties' },
  { key: 'liability', label: 'Liability' },
  { key: 'confidentiality', label: 'Confidentiality' },
  { key: 'termination', label: 'Termination Rules' },
];

const defaultComparison = {
  paymentTerms: 'Not evaluated yet',
  penalties: 'Not evaluated yet',
  liability: 'Not evaluated yet',
  confidentiality: 'Not evaluated yet',
  termination: 'Not evaluated yet',
};

function CompareContracts() {
  const [contractA, setContractA] = useState(null);
  const [contractB, setContractB] = useState(null);
  const [comparison, setComparison] = useState(defaultComparison);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (setter) => (event) => {
    setter(event.target.files?.[0] || null);
    setComparison(defaultComparison);
    setStatus('');
    setError('');
  };

  const handleCompare = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('Comparing contracts...');
    setComparison(defaultComparison);

    if (!contractA || !contractB) {
      setError('Please upload both Contract A and Contract B.');
      setStatus('');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('contracts', contractA);
      formData.append('contracts', contractB);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/compare`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Comparison request failed.');
      }

      const data = await response.json();
      setComparison({
        paymentTerms: data.paymentTerms || 'No comparison available',
        penalties: data.penalties || 'No comparison available',
        liability: data.liability || 'No comparison available',
        confidentiality: data.confidentiality || 'No comparison available',
        termination: data.termination || 'No comparison available',
      });
      setStatus('Comparison completed successfully.');
    } catch (err) {
      setError(err.message || 'Unable to compare contracts.');
      setStatus('Comparison failed.');
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Compare Contracts</h2>
        <p className="mt-2 text-sm text-slate-600">Upload two contracts and compare key commercial clauses side by side.</p>
      </div>

      <form onSubmit={handleCompare} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-base font-semibold text-slate-900">Contract A</h3>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange(setContractA)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
          {contractA && <p className="text-sm text-slate-600">Selected: {contractA.name}</p>}
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-base font-semibold text-slate-900">Contract B</h3>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange(setContractB)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
          {contractB && <p className="text-sm text-slate-600">Selected: {contractB.name}</p>}
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Compare Contracts
          </button>
        </div>
      </form>

      {status && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{status}</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Clause</th>
              <th className="px-4 py-3">Comparison Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
            {comparisonMetrics.map((metric) => (
              <tr key={metric.key} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-medium text-slate-900">{metric.label}</td>
                <td className="px-4 py-4">{comparison[metric.key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompareContracts;
