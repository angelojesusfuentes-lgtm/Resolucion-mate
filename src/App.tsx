import React, { useState } from 'react';
import Header from './components/Header';
import SolverPanel from './components/SolverPanel';
import GeneratorPanel from './components/GeneratorPanel';
import ExamPanel from './components/ExamPanel';
import HistoryPanel from './components/HistoryPanel';

type Tab = 'resolver' | 'practicar' | 'examen' | 'historial';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'resolver',  label: 'Resolver',  icon: '🔍' },
  { id: 'practicar', label: 'Practicar', icon: '🎲' },
  { id: 'examen',    label: 'Examen',    icon: '📝' },
  { id: 'historial', label: 'Historial', icon: '📚' },
];

const App: React.FC = () => {
  const [tab, setTab] = useState<Tab>('resolver');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  tab === t.id
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {tab === 'resolver' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-white text-2xl font-bold">Resuelve tu problema</h2>
              <p className="text-white/70 mt-1 text-sm">
                Ingresa cualquier problema matemático y recibe la solución con todos los pasos explicados
              </p>
            </div>
            <SolverPanel />
          </div>
        )}

        {tab === 'practicar' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-white text-2xl font-bold">Practica con problemas aleatorios</h2>
              <p className="text-white/70 mt-1 text-sm">
                Elige una categoría y dificultad para generar un problema nuevo
              </p>
            </div>
            <GeneratorPanel />
          </div>
        )}

        {tab === 'examen' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-white text-2xl font-bold">Modo Examen</h2>
              <p className="text-white/70 mt-1 text-sm">
                Pon a prueba tus conocimientos con un examen cronometrado
              </p>
            </div>
            <ExamPanel />
          </div>
        )}

        {tab === 'historial' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-white text-2xl font-bold">Historial</h2>
              <p className="text-white/70 mt-1 text-sm">
                Revisa todos los problemas que has practicado y examinado
              </p>
            </div>
            <HistoryPanel />
          </div>
        )}

        {/* Categorías info — only on resolver/practicar */}
        {(tab === 'resolver' || tab === 'practicar') && (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { icon: '➕', label: 'Aritmética',   desc: 'Operaciones básicas' },
              { icon: '🔤', label: 'Álgebra',      desc: 'Términos y expresiones' },
              { icon: '⚖️', label: 'Ecuaciones',   desc: 'Ecuaciones lineales' },
              { icon: '½',  label: 'Fracciones',   desc: 'Operaciones con fracciones' },
              { icon: '%',  label: 'Porcentajes',  desc: 'Cálculos porcentuales' },
            ].map((cat) => (
              <div
                key={cat.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 hover:bg-white/20 transition-colors"
              >
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <p className="text-white font-semibold text-xs">{cat.label}</p>
                <p className="text-white/60 text-xs mt-0.5">{cat.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-white/40 text-xs">
        MatemáticaApp — Aprende matemáticas paso a paso
      </footer>
    </div>
  );
};

export default App;
