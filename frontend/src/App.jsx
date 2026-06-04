import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import AskQuestions from './pages/AskQuestions';
import CompareContracts from './pages/CompareContracts';
import History from './pages/History';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-lg font-semibold">Legal Contract Risk Analyzer</h1>
              <p className="text-sm text-slate-500">Upload contracts, analyze risk, compare agreements, and review history.</p>
            </div>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <NavLink to="/" end className={({ isActive }) => isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}>
                Dashboard
              </NavLink>
              <NavLink to="/upload" className={({ isActive }) => isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}>
                Upload
              </NavLink>
              <NavLink to="/ask" className={({ isActive }) => isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}>
                Ask Questions
              </NavLink>
              <NavLink to="/compare" className={({ isActive }) => isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}>
                Compare
              </NavLink>
              <NavLink to="/history" className={({ isActive }) => isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}>
                History
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/ask" element={<AskQuestions />} />
            <Route path="/compare" element={<CompareContracts />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
