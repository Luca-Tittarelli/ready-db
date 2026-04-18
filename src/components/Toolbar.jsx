import React, { useRef } from 'react';
import upop from 'upop';

export default function Toolbar({ 
    tablesCount, 
    searchTerm, 
    setSearchTerm,
    onImport,
    onExportJSON,
    onExportSQL,
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
            <div className="flex items-center gap-3">
                <button 
                    className="text-[12px] font-medium text-text-secondary hover:text-warm-text transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Importar
                </button>
                <button 
                    className="text-[12px] font-medium text-text-secondary hover:text-warm-text transition-colors"
                    onClick={() => {
                        onExportJSON();
                        upop.toast.info('JSON Exportado');
                    }}
                >
                    Exportar JSON
                </button>
                <button 
                    className="text-[12px] font-medium text-accent hover:text-accent-hover transition-colors"
                    onClick={() => {
                        onExportSQL();
                        upop.toast.info('SQL Exportado');
                    }}
                >
                    Exportar SQL
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
