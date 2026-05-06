import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">📐</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-none">MatemáticaApp</h1>
            <p className="text-white/70 text-xs mt-0.5">Resuelve y practica matemáticas</p>
          </div>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2">
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
            5 categorías
          </span>
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
            3 niveles
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
