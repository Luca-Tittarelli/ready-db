import React from 'react';
import { SEVERITY } from '../utils/schemaAnalyzer';
import { AlertCircle, AlertTriangle, Info, Wrench } from 'lucide-react';

export default function HealthPanel({ score, issues, onSelectTable, onApplyQuickFix }) {
    const errors = issues.filter(i => i.severity === SEVERITY.ERROR);
    const warnings = issues.filter(i => i.severity === SEVERITY.WARNING);
    const infos = issues.filter(i => i.severity === SEVERITY.INFO);

    const renderIssue = (issue) => (
        <div key={issue.id + issue.tableId + issue.colId} className="bg-warm-bg border border-warm-border p-3.5 rounded-xl mb-3 hover:border-warm-border/80 transition-colors">
            <div 
                className="font-semibold text-[13px] text-warm-text mb-1 cursor-pointer hover:underline"
                onClick={() => issue.tableId && onSelectTable(issue.tableId)}
            >
                {issue.tableName ? `${issue.tableName}${issue.colName ? `.${issue.colName}` : ''}: ` : ''}{issue.title}
            </div>
            <div className="text-[11px] text-text-secondary leading-relaxed mb-3">
                {issue.description}
            </div>
            {issue.quickFix && (
                <button 
                    onClick={() => onApplyQuickFix(issue.quickFix)}
                    className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-warm-card border border-warm-border rounded-lg text-[11px] font-semibold text-warm-text hover:bg-white hover:text-accent transition-colors"
                >
                    <Wrench size={12} />
                    {issue.quickFix.label}
                </button>
            )}
        </div>
    );

    return (
        <div className="w-80 bg-warm-card border-l border-warm-border flex flex-col flex-none h-full z-10 transition-transform">
            <div className="px-6 py-5 border-b border-warm-border bg-warm-bg flex items-center justify-between">
                <h2 className="font-semibold text-[15px] flex items-center gap-2 text-warm-text tracking-tight">
                    Schema Health
                </h2>
                <div className="font-bold text-xl">{score}%</div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
                {issues.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <h3 className="text-[13px] font-bold text-warm-text mb-1">¡Esquema Perfecto!</h3>
                        <p className="text-[12px] text-text-secondary">No se encontraron problemas en el diseño.</p>
                    </div>
                ) : (
                    <>
                        {errors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-[11px] font-bold text-error uppercase mb-3 flex items-center gap-1.5">
                                    <AlertCircle size={14} /> Errores ({errors.length})
                                </h3>
                                {errors.map(renderIssue)}
                            </div>
                        )}
                        {warnings.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-[11px] font-bold text-warn uppercase mb-3 flex items-center gap-1.5">
                                    <AlertTriangle size={14} /> Advertencias ({warnings.length})
                                </h3>
                                {warnings.map(renderIssue)}
                            </div>
                        )}
                        {infos.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-[11px] font-bold text-accent uppercase mb-3 flex items-center gap-1.5">
                                    <Info size={14} /> Sugerencias ({infos.length})
                                </h3>
                                {infos.map(renderIssue)}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
