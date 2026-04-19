import React, { useEffect } from 'react';
import { TEMPLATES } from '../../utils/templates';
import { Shield, FileText, ShoppingCart, Building2, Users, KanbanSquare, BarChart3 } from 'lucide-react';

const ICON_MAP = {
    Shield,
    FileText,
    ShoppingCart,
    Building2,
    Users,
    KanbanSquare,
    BarChart3,
};

export default function TemplatesModal({ onClose, onApply }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSelect = (template) => {
        const data = template.build();
        onApply(data);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div 
                className="bg-warm-bg border border-warm-border rounded-xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-warm-border">
                    <h3 className="font-bold text-[16px] text-warm-text">Plantillas de Esquema</h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Elige un patrón y genera un diagrama completo en un clic.</p>
                </div>

                {/* Grid */}
                <div className="p-5 grid grid-cols-3 gap-3 max-h-[420px] overflow-y-auto">
                    {TEMPLATES.map(tpl => {
                        const IconComponent = ICON_MAP[tpl.icon];
                        return (
                            <button
                                key={tpl.id}
                                className="bg-warm-card border border-warm-border rounded-xl p-4 text-left hover:border-accent/50 hover:shadow-md transition-all group"
                                onClick={() => handleSelect(tpl)}
                            >
                                <div 
                                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                                    style={{ backgroundColor: tpl.color + '12', color: tpl.color }}
                                >
                                    {IconComponent && <IconComponent size={18} strokeWidth={2} />}
                                </div>
                                <h4 className="font-bold text-[13px] text-warm-text group-hover:text-accent transition-colors leading-tight">{tpl.name}</h4>
                                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">{tpl.description}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-warm-border bg-warm-card/30 flex justify-between items-center">
                    <p className="text-[11px] text-text-soft">Reemplaza el diagrama actual</p>
                    <button
                        className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-warm-text transition-colors"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
