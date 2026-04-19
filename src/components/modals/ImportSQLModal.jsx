import React, { useState, useEffect, useRef } from 'react';
import { parseSQL } from '../../utils/sqlParser';

export default function ImportSQLModal({ onClose, onImport }) {
    const [sql, setSQL] = useState('');
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        setTimeout(() => textareaRef.current?.focus(), 50);
    }, []);

    const handleParse = () => {
        setError('');
        setPreview(null);

        if (!sql.trim()) {
            setError('Pega tu SQL aquí primero.');
            return;
        }

        try {
            const result = parseSQL(sql);
            if (result.tables.length === 0) {
                setError('No se encontraron sentencias CREATE TABLE válidas.');
                return;
            }
            setPreview(result);
        } catch (e) {
            setError('Error parseando SQL: ' + e.message);
        }
    };

    const handleConfirmImport = () => {
        if (!preview) return;
        onImport(preview);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div 
                className="bg-warm-bg border border-warm-border rounded-xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-warm-border flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-[16px] text-warm-text">Importar desde SQL</h3>
                        <p className="text-[12px] text-text-secondary mt-0.5">Pega tu esquema SQL y lo convertimos en un diagrama visual.</p>
                    </div>
                    <button onClick={onClose} className="text-text-soft hover:text-warm-text transition-colors text-lg">✕</button>
                </div>

                {/* Textarea */}
                <div className="p-6">
                    <textarea
                        ref={textareaRef}
                        className="w-full h-48 bg-warm-card border border-warm-border rounded-lg p-4 font-mono text-[13px] text-warm-text resize-none focus:outline-none focus:border-accent transition-colors placeholder-text-soft leading-relaxed"
                        placeholder={"CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT now()\n);"}
                        value={sql}
                        onChange={e => { setSQL(e.target.value); setError(''); setPreview(null); }}
                    />

                    {error && (
                        <div className="mt-3 text-[12px] text-error bg-error/10 border border-error/20 rounded-lg px-4 py-2.5 font-medium">
                            {error}
                        </div>
                    )}

                    {preview && (
                        <div className="mt-3 bg-accent/5 border border-accent/20 rounded-lg px-4 py-3">
                            <p className="text-[13px] font-semibold text-accent mb-2">
                                ✓ {preview.tables.length} tabla{preview.tables.length > 1 ? 's' : ''} detectada{preview.tables.length > 1 ? 's' : ''}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {preview.tables.map(t => (
                                    <span key={t.id} className="px-2.5 py-1 bg-warm-card border border-warm-border rounded-md text-[12px] font-mono text-warm-text">
                                        {t.name} <span className="text-text-soft">({t.columns.length} cols)</span>
                                    </span>
                                ))}
                            </div>
                            {preview.connections.length > 0 && (
                                <p className="text-[11px] text-text-secondary mt-2">
                                    + {preview.connections.length} relación{preview.connections.length > 1 ? 'es' : ''} detectada{preview.connections.length > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-warm-border bg-warm-card/30 flex justify-between items-center">
                    <p className="text-[11px] text-text-soft">Soporta PostgreSQL, MySQL y SQLite</p>
                    <div className="flex gap-3">
                        {!preview ? (
                            <button
                                className="px-5 py-2 bg-accent text-white rounded-lg text-[13px] font-semibold hover:bg-accent-hover transition-colors shadow-sm"
                                onClick={handleParse}
                            >
                                Analizar SQL
                            </button>
                        ) : (
                            <button
                                className="px-5 py-2 bg-accent text-white rounded-lg text-[13px] font-semibold hover:bg-accent-hover transition-colors shadow-sm"
                                onClick={handleConfirmImport}
                            >
                                Importar {preview.tables.length} tabla{preview.tables.length > 1 ? 's' : ''}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
