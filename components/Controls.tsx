import React from 'react';
import { RotateCcw, Monitor, Users, Focus } from 'lucide-react';
import { Chess } from 'chess.js';

interface ControlsProps {
  game: Chess;
  onReset: () => void;
  onCenterBoard: () => void;
  onSwitchPerspective: () => void;
  turn: 'w' | 'b';
  inCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
  game, 
  onReset, 
  onCenterBoard,
  onSwitchPerspective,
  turn, 
  inCheck, 
  isCheckmate, 
  isDraw,
  isStalemate,
  isThreefoldRepetition,
  isInsufficientMaterial
}) => {
  const winner = turn === 'w' ? 'Black' : 'White';
  
  let title = '';
  let subtitle = '';

  if (isCheckmate) {
      title = 'CHECKMATE!';
      subtitle = `${winner} Wins`;
  } else if (isStalemate) {
      title = 'STALEMATE';
      subtitle = 'Draw';
  } else if (isInsufficientMaterial) {
      title = 'DRAW';
      subtitle = 'Insufficient Material';
  } else if (isThreefoldRepetition) {
      title = 'DRAW';
      subtitle = 'Threefold Repetition';
  } else if (isDraw) {
      title = 'DRAW';
      subtitle = '50-Move Rule';
  }

  return (
    <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex flex-col justify-between h-full z-10">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></div>
            Abet's 3D Chess
          </h1>
          <div className="flex items-center gap-4 text-slate-300 text-sm">
             <div className="flex items-center gap-1">
                <Users size={16} />
                <span>Local Multiplayer</span>
             </div>
             <div className="flex items-center gap-1">
                <Monitor size={16} />
                <span>React + Three.js</span>
             </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onCenterBoard}
            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full transition-all shadow-lg border border-slate-600 group"
            title="Recenter Board"
          >
              <Focus size={24} className="group-hover:scale-110 transition-transform duration-300"/>
          </button>
          <button 
            onClick={onReset}
            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full transition-all shadow-lg border border-slate-600 group"
            title="Reset Game"
          >
              <RotateCcw size={24} className="group-hover:-rotate-180 transition-transform duration-500"/>
          </button>
        </div>
      </div>

      {/* Game Status - Centered only for End Game States */}
      <div className="flex justify-center pointer-events-auto min-h-[100px]">
        {(isCheckmate || isDraw) && (
            <div className={`
            px-8 py-4 rounded-2xl backdrop-blur-xl shadow-2xl border-2 transition-all duration-300 transform
            ${isCheckmate 
                ? 'bg-red-500/90 border-red-400 scale-110' 
                : 'bg-slate-900/80 border-slate-700'}
            `}>
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-white">{title}</h2>
                    <p className="text-white/90 font-medium mt-1">{subtitle}</p>
                </div>
            </div>
        )}
      </div>
      
      {/* Footer / Instructions & Turn Indicator */}
      <div className="pointer-events-auto relative pb-4 flex justify-center items-end">
        {/* Instructions */}
        <p className="text-slate-400 text-sm bg-slate-900/50 inline-block px-4 py-2 rounded-full backdrop-blur-sm shadow-lg border border-slate-800/50">
            Drag to Rotate • Scroll to Zoom • Click to Move
        </p>

        {/* Turn Indicator - Bottom Right */}
        {!isCheckmate && !isDraw && (
            <button 
                onClick={onSwitchPerspective}
                className="absolute right-0 bottom-4 text-left transition-transform hover:scale-105 active:scale-95 focus:outline-none"
                title="Click to rotate to player perspective"
            >
                <div className={`
                    px-5 py-3 rounded-xl backdrop-blur-xl shadow-2xl border transition-all duration-300
                    ${inCheck ? 'bg-orange-500/90 border-orange-400 animate-pulse' : 'bg-slate-900/80 border-slate-700'}
                `}>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Current Turn</span>
                        <div className="flex items-center gap-3">
                             <span className="text-xl font-bold text-white">
                                {inCheck ? 'CHECK!' : (turn === 'w' ? 'White' : 'Black')}
                            </span>
                            <div className={`w-3 h-3 rounded-full ${turn === 'w' ? 'bg-white shadow-[0_0_10px_white]' : 'bg-black border border-slate-500'}`}></div>
                        </div>
                    </div>
                </div>
            </button>
        )}
      </div>
    </div>
  );
};