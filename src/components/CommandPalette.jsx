import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Code, Eye, FileJson, Trash2, Database, Upload, LayoutTemplate, Undo2, Redo2 } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, dbState, onShowNewTable, onExportJSON, onExportSQL, onExportPrisma, onExportTS, onShowImportSQL, onShowTemplates }) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    // List of available commands
    const commands = [
        { id: 'new-table', name: 'Nueva Tabla', icon: <Plus size={16} />, action: onShowNewTable, view: 'any' },
        { id: 'import-sql', name: 'Importar desde SQL', icon: <Upload size={16} />, action: onShowImportSQL, view: 'any' },
        { id: 'templates', name: 'Usar Plantilla (Auth, Blog, E-Commerce...)', icon: <LayoutTemplate size={16} />, action: onShowTemplates, view: 'any' },
        { id: 'view-design', name: 'Ver Diseño (Canvas)', icon: <Database size={16} />, action: () => dbState.setViewMode('design'), view: 'code' },
        { id: 'view-code', name: 'Ver Código (SQL/ORMs)', icon: <Code size={16} />, action: () => dbState.setViewMode('code'), view: 'design' },
        { id: 'undo', name: 'Deshacer', icon: <Undo2 size={16} />, action: dbState.undo, view: 'any' },
        { id: 'redo', name: 'Rehacer', icon: <Redo2 size={16} />, action: dbState.redo, view: 'any' },
        { id: 'export-json', name: 'Exportar Proyecto (JSON)', icon: <FileJson size={16} />, action: onExportJSON, view: 'any' },
        { id: 'export-sql', name: 'Exportar SQL', icon: <Code size={16} />, action: onExportSQL, view: 'any' },
        { id: 'export-prisma', name: 'Exportar Prisma Schema', icon: <Code size={16} />, action: onExportPrisma, view: 'any' },
        { id: 'export-ts', name: 'Exportar Tipos TypeScript', icon: <Code size={16} />, action: onExportTS, view: 'any' },
        { id: 'clear-all', name: 'Limpiar Todo', icon: <Trash2 size={16} />, action: dbState.clearAll, view: 'any', danger: true },
    ];

    // Filter commands based on search and current view
    const filteredCommands = commands.filter(cmd => {
        const matchesSearch = cmd.name.toLowerCase().includes(search.toLowerCase());
        const matchesView = cmd.view === 'any' || cmd.view === dbState.viewMode;
        return matchesSearch && matchesView;
    });

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredCommands, selectedIndex, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="w-full max-w-lg bg-warm-bg rounded-xl shadow-2xl border border-warm-border overflow-hidden flex flex-col font-sans"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-3 border-b border-warm-border/50">
                    <Search size={18} className="text-text-secondary mr-3" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="flex-1 bg-transparent border-none outline-none text-warm-text placeholder:text-text-secondary/50 text-[15px]"
                        placeholder="Escribe un comando o busca..."
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <div className="text-[10px] text-text-secondary font-mono tracking-wider px-1.5 py-0.5 rounded bg-warm-card border border-warm-border">ESC</div>
                </div>

                <div className="max-h-[300px] overflow-y-auto py-2">
                    {filteredCommands.length === 0 ? (
                        <div className="text-center py-8 text-text-secondary text-[13px]">
                            No se encontraron comandos.
                        </div>
                    ) : (
                        <div className="px-2">
                            <div className="text-[11px] font-medium text-text-secondary/70 mb-2 px-2 uppercase tracking-widest">
                                Comandos
                            </div>
                            {filteredCommands.map((cmd, idx) => (
                                <button
                                    key={cmd.id}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-0.5 transition-colors text-left ${idx === selectedIndex ? (cmd.danger ? 'bg-error/10 text-error' : 'bg-accent/10 text-accent') : 'text-warm-text hover:bg-warm-card'}`}
                                    onClick={() => {
                                        cmd.action();
                                        onClose();
                                    }}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={idx === selectedIndex ? (cmd.danger ? 'text-error' : 'text-accent') : 'text-text-secondary'}>
                                            {cmd.icon}
                                        </div>
                                        <span className="text-[13px] font-medium">{cmd.name}</span>
                                    </div>
                                    {idx === selectedIndex && (
                                        <span className="text-[10px] font-mono opacity-60">↵</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
