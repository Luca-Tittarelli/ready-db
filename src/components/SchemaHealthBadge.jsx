import React from 'react';

export default function SchemaHealthBadge({ score, onClick }) {
    let colorClass = 'text-success border-success/30 bg-success/10';
    let dotClass = 'bg-success shadow-[0_0_8px_rgba(76,175,80,0.5)]';
    
    if (score < 50) {
        colorClass = 'text-error border-error/30 bg-error/10';
        dotClass = 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse';
    } else if (score < 80) {
        colorClass = 'text-warn border-warn/30 bg-warn/10';
        dotClass = 'bg-warn shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    }

    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:opacity-80 scale-100 hover:scale-105 active:scale-95 ${colorClass}`}
            title="Ver estado del esquema"
        >
            <div className={`w-2 h-2 rounded-full ${dotClass}`}></div>
            <span className="font-bold text-[13px]">{score}</span>
        </button>
    );
}
