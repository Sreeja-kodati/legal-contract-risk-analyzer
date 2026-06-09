import React, { useState } from 'react';

function AskQuestions() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || 'Failed to get answer.');
      }

      const payload = await response.json();
      setResult(payload);
    } catch (err) {
      setError(err.message || 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Ask Questions</h2>
        <p className="mt-2 text-sm text-slate-600">Ask the contract analyzer a question and receive a risk-aware response with retrieval sources.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Enter your question about the uploaded contract..."
          rows={4}
          className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Analyzing...' : 'Submit Question'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {result && (
        <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Answer</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{result.analysis?.summary || 'No summary available.'}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Risk Score</h4>
              <p className="mt-2 text-3xl font-bold text-blue-600">{result.analysis?.riskScore ?? 'N/A'}</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Risk Level</h4>
              <p className="mt-2 text-2xl font-semibold text-slate-700">{result.analysis?.riskLevel || 'N/A'}</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900">Red Flags</h4>
            {Array.isArray(result.analysis?.redFlags) && result.analysis.redFlags.length ? (
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                {result.analysis.redFlags.map((flag, index) => (
                  <li key={index} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-900">{flag.id || `Flag ${index + 1}`}</p>
                    <p>{flag.description || 'No description provided.'}</p>
                    <p className="mt-1 text-xs text-slate-500">Severity: {flag.severity || 'unknown'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No red flags detected.</p>
            )}
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900">Retrieved Sources</h4>
            {Array.isArray(result.context) && result.context.length ? (
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                {result.context.map((source, index) => (
                  <li key={index} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-900">{source.contractName || `Source ${index + 1}`}</p>
                    <p>{source.chunkId || 'Chunk not specified'}</p>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-3">{source.clauseText || 'No clause text available.'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No retrieval sources were returned.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AskQuestions;
