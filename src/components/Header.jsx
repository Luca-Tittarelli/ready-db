import React from 'react';

export default function Header({ 
    viewMode, 
    setViewMode, 
    sqlDialect, 
    setSqlDialect,
    onShowPreview,
    onShowNewTable
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
                        <h1 className="text-[15px] font-semibold tracking-tight text-warm-text">
                            ReadyDB
                        </h1>
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
                </div>
                
                <div className="flex items-center gap-6">
                    <select 
                        className="bg-transparent text-[13px] font-medium text-text-secondary focus:outline-none hover:text-warm-text cursor-pointer appearance-none"
                        value={sqlDialect} 
                        onChange={e => setSqlDialect(e.target.value)}
                    >
                        <option value="postgres">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                        <option value="sqlite">SQLite</option>
                    </select>
                    
                    <div className="w-px h-4 bg-warm-border"></div>
                    
                    <div className="flex items-center gap-3">
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
