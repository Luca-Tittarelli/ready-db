import React, { useState, useEffect } from 'react';

export default function TableModal({ onClose, onCreate }) {
    const [name, setName] = useState('');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && name.trim()) onCreate(name);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [name, onClose, onCreate]);

    return (
        <div className="fixed inset-0 bg-warm-bg/60 flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-warm-card border border-warm-border rounded-xl w-full max-w-sm overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
                <div className="px-6 py-5 border-b border-warm-border flex justify-between items-center bg-warm-bg">
                    <h3 className="font-semibold text-[15px] text-warm-text">Nueva Entidad</h3>
                    <button onClick={onClose} className="text-text-soft hover:text-warm-text transition-colors">✕</button>
                </div>
                
                <div className="p-6">
                    <label className="block text-[12px] font-medium text-text-secondary mb-2">
                        Nombre de la tabla
                    </label>
                    <input 
                        type="text" 
                        autoFocus
                        className="w-full px-4 py-2.5 bg-warm-bg border border-warm-border rounded-lg text-warm-text text-[14px] focus:outline-none focus:border-accent transition-colors placeholder-text-soft"
                        placeholder="ej. usuarios, posts..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <div className="px-6 py-4 bg-warm-bg border-t border-warm-border flex justify-end gap-3">
                    <button 
                        className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-warm-text transition-colors"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button 
                        className="px-5 py-2 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-50"
                        onClick={() => onCreate(name)}
                        disabled={!name.trim()}
                    >
                        Crear Entidad
                    </button>
                </div>
            </div>
        </div>
    );
}
