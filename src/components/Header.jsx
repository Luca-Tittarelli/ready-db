import React from 'react';
import SchemaHealthBadge from './SchemaHealthBadge';

export default function Header({ 
    viewMode, 
    setViewMode, 
    sqlDialect, 
    setSqlDialect,
    onShowPreview,
    onShowNewTable,
    onShowImportSQL,
    onShowTemplates,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    healthScore,
    onToggleHealthPanel
}) {
    return (
        <header className="bg-warm-bg border-b border-warm-border px-8 py-4 flex-none z-40 relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* Brand with Logo */}
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" onError={(e) => {
                            e.target.style.display = 'none'; // Fallback visual silencing on error
                        }} />
                        <h1 className="text-[15px] font-bold tracking-tight text-warm-text">
                            READYDB
                        </h1>
                        <div className="ml-2 flex items-center px-1.5 py-0.5 rounded-[5px] border border-warm-border bg-warm-card shadow-[0_1px_2px_rgba(0,0,0,0.03)] text-[10px] text-text-secondary font-mono opacity-80 cursor-default hover:opacity-100 hover:border-text-secondary/30 transition-all" title="Abre el Command Palette">
                            <span className="font-semibold">⌘ K</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center bg-warm-card border border-warm-border rounded-lg p-1">
                        <button 
                            className={`px-4 py-1 rounded-[6px] text-[13px] transition-colors ${
                                viewMode === 'design' 
                                    ? 'bg-warm-bg text-warm-text font-medium shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-warm-border/50' 
                                    : 'text-text-secondary hover:text-warm-text font-normal'
                            }`}
                            onClick={() => setViewMode('design')}
                        >
                            Esquema Gráfico
                        </button>
                        <button 
                            className={`px-4 py-1 rounded-[6px] text-[13px] transition-colors ${
                                viewMode === 'code' 
                                    ? 'bg-warm-bg text-warm-text font-medium shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-warm-border/50' 
                                    : 'text-text-secondary hover:text-warm-text font-normal'
                            }`}
                            onClick={() => setViewMode('code')}
                        >
                            Código SQL
                        </button>
                    </div>

                    {/* Undo / Redo */}
                    <div className="flex items-center gap-1">
                        <button 
                            className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-text-secondary hover:text-warm-text hover:bg-warm-card' : 'text-text-soft/30 cursor-not-allowed'}`}
                            onClick={onUndo}
                            disabled={!canUndo}
                            title="Deshacer (Ctrl+Z)"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
                        </button>
                        <button 
                            className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-text-secondary hover:text-warm-text hover:bg-warm-card' : 'text-text-soft/30 cursor-not-allowed'}`}
                            onClick={onRedo}
                            disabled={!canRedo}
                            title="Rehacer (Ctrl+Shift+Z)"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <SchemaHealthBadge score={healthScore} onClick={onToggleHealthPanel} />
                    
                    <div className="relative group">
                        <select 
                            className="bg-warm-card border border-warm-border text-[13px] font-semibold text-text-secondary focus:outline-none hover:text-warm-text hover:border-text-secondary/40 cursor-pointer appearance-none rounded-[8px] pl-3 pr-8 py-1.5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                            value={sqlDialect} 
                            onChange={e => setSqlDialect(e.target.value)}
                        >
                            <option value="postgres">PostgreSQL</option>
                            <option value="mysql">MySQL</option>
                            <option value="sqlite">SQLite</option>
                            <option disabled>──────────</option>
                            <option value="prisma">Prisma ORM</option>
                            <option value="typescript">TypeScript</option>
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-hover:text-warm-text transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                    
                    <div className="w-px h-4 bg-warm-border"></div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            className="text-[13px] text-text-secondary hover:text-warm-text transition-colors"
                            onClick={onShowImportSQL}
                            title="Importar SQL existente"
                        >
                            Importar SQL
                        </button>
                        <button 
                            className="text-[13px] text-text-secondary hover:text-warm-text transition-colors"
                            onClick={onShowTemplates}
                            title="Usar una plantilla"
                        >
                            Plantillas
                        </button>
                        <button 
                            className="text-[13px] text-text-secondary hover:text-warm-text transition-colors"
                            onClick={onShowPreview}
                        >
                            Vista previa
                        </button>
                        <button 
                            className="px-4 py-1.5 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover transition-colors"
                            onClick={onShowNewTable}
                        >
                            + Tabla
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
