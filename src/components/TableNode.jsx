import React, { memo } from 'react';
import { getTableSeverity, SEVERITY } from '../utils/schemaAnalyzer';

const COMMON_TYPES = [
    { label: 'SERIAL', value: 'serial' },
    { label: 'INT', value: 'int' },
    { label: 'BIGINT', value: 'bigint' },
    { label: 'VARCHAR', value: 'varchar' },
    { label: 'TEXT', value: 'text' },
    { label: 'BOOLEAN', value: 'boolean' },
    { label: 'DATE', value: 'date' },
    { label: 'TIMESTAMP', value: 'timestamp' },
    { label: 'UUID', value: 'uuid' },
    { label: 'JSONB', value: 'jsonb' },
    { label: 'DECIMAL', value: 'decimal' },
    { label: 'CHAR', value: 'char' },
];

const parseType = (typeStr = '') => {
    if (typeStr.includes('(')) {
        const parts = typeStr.split(/(?=\()/); // splits before '('
        const base = parts[0].trim();
        const arg = parts.slice(1).join('').replace(/[\(\)]/g, '').trim();
        return { base, arg };
    }
    return { base: typeStr, arg: '' };
};

const TableNode = memo(function TableNode({
    table,
    tableIssues = [],
    onMouseDown,
    onClick,
    onUpdateColumn,
    onRemoveColumn,
    onAddColumn,
    onRemove,
    
    startConnection,
    completeConnection
}) {
    const severity = getTableSeverity(tableIssues);
    let dotClass = 'bg-success';
    if (severity === SEVERITY.ERROR) dotClass = 'bg-error animate-pulse';
    else if (severity === SEVERITY.WARNING) dotClass = 'bg-warn';

    return (
        <div
            className="absolute top-0 left-0 w-[310px] bg-warm-card border border-warm-border rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.03)] transition-shadow duration-200 z-10"
            style={{ 
                transform: `translate3d(${table.x}px, ${table.y}px, 0)`,
                willChange: 'transform'
            }}
        >
            {/* Table Header */}
            <div
                className="px-4 py-3 cursor-move flex items-center justify-between border-b border-warm-border group"
                onMouseDown={(e) => onMouseDown(e, table)}
                onClick={() => onClick(table.id)}
            >
                <div>
                    <h3 className="font-bold text-warm-text text-[15px] flex items-center gap-2">
                        {table.name}
                        {tableIssues.length > 0 && <div className={`w-2 h-2 rounded-full ${dotClass} shadow-sm`} title={`${tableIssues.length} alertas`} />}
                    </h3>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onRemove(table.id); }} className="text-text-soft hover:text-error transition-colors" title="Eliminar">
                         ✕
                    </button>
                </div>
            </div>

            {/* Table Columns */}
            <div className="flex flex-col">
                {table.columns.length === 0 ? (
                    <div className="text-xs text-text-soft py-6 text-center">Sin campos</div>
                ) : (
                    <div className="flex flex-col">
                        {table.columns.map((c, i) => {
                            const { base, arg } = parseType(c.type || '');
                            const isCustomBase = !COMMON_TYPES.some(t => t.value.toLowerCase() === base.toLowerCase());

                            return (
                                <div 
                                    key={c.id} 
                                    className={`group/row flex items-center h-10 transition-colors px-2 relative ${i !== table.columns.length - 1 ? 'border-b border-warm-border/50' : ''}`}
                                    onMouseUp={() => completeConnection(table.id, c.id)}
                                >
                                    {/* Left Connection Port */}
                                    <div 
                                        className="w-4 flex items-center justify-center cursor-crosshair port absolute -left-2 top-0 bottom-0 z-10 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                        onMouseDown={(e) => startConnection(e, table.id, c.id)}
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full bg-warm-card border-[1.5px] border-accent hover:bg-accent-soft transition-colors"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex items-center gap-1.5 px-2 min-w-0">
                                        <input 
                                            className="w-5/12 bg-transparent font-medium text-[13px] text-warm-text focus:outline-none placeholder-text-soft"
                                            value={c.name} 
                                            onChange={e => onUpdateColumn(table.id, c.id, { name: e.target.value })} 
                                            placeholder="Nombre"
                                        />
                                        
                                        {/* Type Selector */}
                                        <div className="w-[85px] relative flex items-center">
                                            <select 
                                                className="w-full bg-transparent font-mono text-[11px] text-text-secondary focus:outline-none appearance-none cursor-pointer pr-4 truncate"
                                                value={base}
                                                onChange={(e) => {
                                                    const newBase = e.target.value;
                                                    onUpdateColumn(table.id, c.id, { type: arg ? `${newBase}(${arg})` : newBase });
                                                }}
                                            >
                                                {isCustomBase && base && <option value={base}>{base}</option>}
                                                {COMMON_TYPES.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-text-soft">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </div>
                                        </div>

                                        {/* Argument Input */}
                                        <div className="w-[30px] shrink-0">
                                            <input 
                                                className="w-full bg-warm-bg border border-transparent font-mono text-[10px] text-warm-text rounded px-1 py-0.5 text-center focus:outline-none focus:border-accent focus:bg-white transition-colors"
                                                value={arg}
                                                placeholder="..."
                                                onChange={(e) => {
                                                    const newArg = e.target.value;
                                                    onUpdateColumn(table.id, c.id, { type: newArg ? `${base}(${newArg})` : base });
                                                }}
                                                title="Argumento (ej: 255)"
                                            />
                                        </div>
                                    </div>

                                    {/* Flags */}
                                    <div className="flex items-center gap-1 shrink-0 px-1">
                                        <button 
                                            className={`text-[9.5px] font-medium px-1 rounded transition-colors ${c.pk ? 'text-accent' : 'text-text-soft hover:text-text-secondary'}`}
                                            onClick={() => onUpdateColumn(table.id, c.id, { pk: !c.pk })}
                                            title="Primary Key"
                                        >PK</button>
                                        <button 
                                            className={`text-[9.5px] font-medium px-1 rounded transition-colors ${c.nullable ? 'text-success' : 'text-text-soft hover:text-text-secondary'}`}
                                            onClick={() => onUpdateColumn(table.id, c.id, { nullable: !c.nullable })}
                                            title="Nullable"
                                        >NL</button>
                                        <button 
                                            className="text-text-soft opacity-0 group-hover/row:opacity-100 hover:text-error transition-opacity ml-1 text-xs px-1"
                                            onClick={() => onRemoveColumn(table.id, c.id)}
                                            title="Remover campo"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Right Connection Port */}
                                    <div 
                                        className="w-4 flex items-center justify-center cursor-crosshair port absolute -right-2 top-0 bottom-0 z-10 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                        onMouseDown={(e) => startConnection(e, table.id, c.id)}
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full bg-warm-card border-[1.5px] border-accent hover:bg-accent-soft transition-colors"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer Add */}
            <div className="flex justify-center p-2 border-t border-warm-border bg-warm-card/50 rounded-b-xl">
                <button 
                    className="w-full h-7 rounded-md text-text-secondary hover:bg-white hover:text-warm-text flex items-center justify-center transition-colors text-[11px] font-medium"
                    onClick={() => onAddColumn(table.id)}
                >
                    + Nuevo campo
                </button>
            </div>
        </div>
    );
});

export default TableNode;
