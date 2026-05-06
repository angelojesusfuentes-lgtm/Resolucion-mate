import React, { useState } from 'react';
import Header from './components/Header';
import SolverPanel from './components/SolverPanel';
import GeneratorPanel from './components/GeneratorPanel';
import ExamPanel from './components/ExamPanel';
import HistoryPanel from './components/HistoryPanel';

type Tab = 'resolver' | 'practicar' | 'examen' | 'historial';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'resolver', label: 'Resolver', icon: '🔍' },
  { id: 'practicar', label: 'Practicar', icon: '🎲' },
  { id: 'examen', label: 'Examen', icon: '📝' },
  { id: 'historial', label: 'Historial', icon: '📚' },
];

const App: React.FC = () => {
  const [tab, setTab] = useState<Tab>('resolver');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  tab === t.id ? 'border-white text-white' : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {tab === 'resolver' && <div className="max-w-2xl mx-auto"><SolverPanel /></div>}
        {tab === 'practicar' && <div className="max-w-3xl mx-auto"><GeneratorPanel /></div>}
        {tab === 'examen' && <div className="max-w-3xl mx-auto"><ExamPanel /></div>}
        {tab === 'historial' && <div className="max-w-3xl mx-auto"><HistoryPanel /></div>}
      </main>

      <footer className="text-center py-4 text-white/40 text-xs">
        MatematicaApp - Aprende matematicas paso a paso
      </footer>
    </div>
  );
};

export default App;