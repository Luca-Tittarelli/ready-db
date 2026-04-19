import React, { useRef } from 'react';
import upop from 'upop';

export default function Toolbar({ 
    tablesCount, 
    searchTerm, 
    setSearchTerm,
    onImport,
    onExportJSON,
    onExportSQL,
    onExportPrisma,
    onExportTS,
    onClearAll 
}) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                onImport(data);
            } catch (error) {
                alert('Error importing file: ' + error.message);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-warm-card border border-warm-border rounded-xl px-4 py-3 flex items-center gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            {/* Search Pill */}
            <div className="relative flex items-center">
                <input
                    type="text"
                    placeholder="Buscar entidades..."
                    className="pl-4 pr-3 py-1.5 bg-warm-bg border border-warm-border rounded-lg text-[13px] text-warm-text font-medium w-48 transition-all outline-none placeholder-text-soft focus:border-accent"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="w-px h-5 bg-warm-border"></div>

            {/* Actions */}
            <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                className="hidden" 
            />
            <div className="flex items-center gap-1.5">
                <button 
                    className="px-3 py-1.5 bg-warm-bg border border-warm-border rounded-[8px] text-[12px] font-semibold text-text-secondary hover:text-warm-text hover:bg-warm-card transition-all shadow-sm flex items-center"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Importar
                </button>
            </div>

            <div className="w-px h-5 bg-warm-border mx-1"></div>

            <div className="flex items-center bg-warm-bg border border-warm-border rounded-[8px] p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/50 flex items-center px-2 mr-1 select-none">
                    Export
                </span>
                <button 
                    className="px-3 py-1 text-[11px] font-bold text-text-secondary hover:text-warm-text hover:bg-warm-card rounded-[6px] transition-all"
                    onClick={() => {
                        onExportJSON();
                        upop.toast.info('JSON Exportado');
                    }}
                >
                    JSON
                </button>
                <button 
                    className="px-3 py-1 text-[11px] font-bold text-accent hover:text-accent-hover hover:bg-accent/10 rounded-[6px] transition-all"
                    onClick={() => {
                        onExportSQL();
                        upop.toast.info('SQL Exportado');
                    }}
                >
                    SQL
                </button>
                <button 
                    className="px-3 py-1 text-[11px] font-bold text-[#5a67d8] hover:text-[#434190] hover:bg-[#5a67d8]/10 rounded-[6px] transition-all"
                    onClick={() => {
                        onExportPrisma();
                        upop.toast.info('Prisma Exportado');
                    }}
                >
                    Prisma
                </button>
                <button 
                    className="px-3 py-1 text-[11px] font-bold text-[#2b6cb0] hover:text-[#2c5282] hover:bg-[#2b6cb0]/10 rounded-[6px] transition-all"
                    onClick={() => {
                        onExportTS();
                        upop.toast.info('Typescript Exportado');
                    }}
                >
                    TS Types
                </button>
            </div>
            
            {tablesCount > 0 && (
                <>
                    <div className="w-px h-5 bg-warm-border"></div>
                    <button 
                        className="text-[12px] font-medium text-text-soft hover:text-error transition-colors"
                        onClick={onClearAll}
                    >
                        Limpiar Diagrama
                    </button>
                </>
            )}
        </div>
    );
}
