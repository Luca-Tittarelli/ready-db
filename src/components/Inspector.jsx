import React from 'react';
import upop from 'upop';

export default function Inspector({ selectedTable, onCopySQL }) {
    if (!selectedTable) {
        return (
            <div className="w-72 bg-warm-bg border-l border-warm-border p-8 flex flex-col items-center justify-center text-center flex-none z-10 transition-colors">
                <p className="text-[13px] text-text-soft leading-relaxed max-w-[200px]">Selecciona una entidad estructural para ver sus meta-propiedades.</p>
            </div>
        );
    }

    return (
        <div className="w-72 bg-warm-card border-l border-warm-border flex flex-col flex-none h-full z-10">
            <div className="px-6 py-5 border-b border-warm-border bg-warm-bg">
                <h2 className="font-semibold text-[15px] flex items-center gap-3 text-warm-text tracking-tight">
                    {selectedTable.name}
                </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                    <h3 className="text-[10px] font-semibold text-text-soft uppercase mb-3">Geometría</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-warm-bg p-3 rounded-lg border border-warm-border">
                            <label className="block text-[10px] text-text-soft uppercase mb-0.5">Eje X</label>
                            <div className="text-warm-text font-mono text-[13px]">{Math.round(selectedTable.x)}</div>
                        </div>
                        <div className="bg-warm-bg p-3 rounded-lg border border-warm-border">
                            <label className="block text-[10px] text-text-soft uppercase mb-0.5">Eje Y</label>
                            <div className="text-warm-text font-mono text-[13px]">{Math.round(selectedTable.y)}</div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-[10px] font-semibold text-text-soft uppercase mb-3 flex items-center justify-between">
                        Esquema 
                        <span className="text-text-soft text-[10px]">
                            ({selectedTable.columns.length})
                        </span>
                    </h3>
                    
                    <div className="space-y-3">
                        {selectedTable.columns.map(c => (
                            <div key={c.id} className="bg-warm-bg border border-warm-border p-3.5 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-semibold text-[13px] text-warm-text">{c.name}</div>
                                    <div className="flex gap-1.5">
                                        {c.pk && (
                                            <span className="px-1.5 py-0.5 text-accent text-[9px] uppercase font-bold rounded-md border border-accent">
                                                PK
                                            </span>
                                        )}
                                        {c.nullable ? (
                                            <span className="px-1.5 py-0.5 text-success text-[9px] uppercase font-bold rounded-md border border-success">NL</span>
                                        ) : (
                                            <span className="px-1.5 py-0.5 text-text-soft text-[9px] uppercase font-bold rounded-md border border-warm-border">NOT</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-[11px] text-text-secondary font-mono">
                                    {c.type}
                                </div>
                                {c.defaultValue && (
                                    <div className="text-[10px] text-text-secondary mt-2 flex gap-1">
                                        <span className="text-text-soft">Default:</span> <span className="font-mono text-warm-text">{c.defaultValue}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {selectedTable.columns.length === 0 && (
                            <div className="text-center py-6 text-[12px] text-text-soft">
                                Sin atributos
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="p-6 border-t border-warm-border bg-warm-bg">
                <button 
                    className="w-full px-4 py-2 border border-warm-border hover:border-warm-text text-warm-text rounded-lg transition-colors text-[13px] font-medium"
                    onClick={() => {
                        onCopySQL();
                        upop.toast.info('SQL Copiado');
                    }}
                >
                    Extraer SQL Local
                </button>
            </div>
        </div>
    );
}
