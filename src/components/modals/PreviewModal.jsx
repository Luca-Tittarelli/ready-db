import React, { useEffect } from 'react';

export default function PreviewModal({ onClose, sql }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-warm-bg/80 flex items-center justify-center z-50 p-6 transition-opacity">
            <div className="bg-warm-card border border-warm-border rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-[0_16px_48px_rgba(0,0,0,0.04)] overflow-hidden relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-5 right-5 text-text-soft hover:text-warm-text transition-colors w-8 h-8 flex items-center justify-center bg-warm-bg rounded-lg border border-warm-border z-10"
                >
                    ✕
                </button>

                <div className="p-8 flex-1 overflow-auto">
                    <pre className="text-text-secondary font-mono text-[13px] leading-7 bg-transparent border-none w-full h-full">
                        {sql || '-- El esquema está vacío'}
                    </pre>
                </div>

                <div className="px-8 py-5 border-t border-warm-border bg-warm-bg flex justify-between items-center">
                    <p className="text-[12px] text-text-soft">Vista de esquema generado automáticamente</p>
                    <button 
                        className="px-5 py-2.5 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover transition-colors shadow-sm"
                        onClick={() => {
                            navigator.clipboard.writeText(sql);
                            onClose();
                        }}
                    >
                        Copiar al portapapeles
                    </button>
                </div>
            </div>
        </div>
    );
}
