import React from 'react';
import upop from 'upop';
import TableNode from './TableNode';
import { Database } from 'lucide-react';

export default function Canvas({
    tables,
    connections,
    selectedTableId,
    canvasRef,
    viewMode,
    searchTerm,
    generateSQL,
    onMouseDownTable,
    setSelectedTableId,
    onUpdateColumn,
    onRemoveColumn,
    onAddColumn,
    onDuplicateTable,
    onRemoveTable,
    onShowNewTable,
    
    connectingFK,
    startConnection,
    completeConnection,
    removeConnection,
    updateConnection
}) {
    if (viewMode === 'code') {
        return (
            <div className="flex-1 bg-warm-bg p-8 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 flex-none border-b border-warm-border pb-4 w-full max-w-4xl mx-auto">
                    <h2 className="font-semibold text-lg text-warm-text">Esquema SQL</h2>
                    <button 
                        className="px-4 py-2 bg-warm-card border border-warm-border text-warm-text rounded-md hover:bg-white transition-colors text-xs font-medium"
                        onClick={() => {
                            navigator.clipboard.writeText(generateSQL());
                            upop.toast.info('Copiado al portapapeles');
                        }}
                    >
                        Copiar al portapapeles
                    </button>
                </div>
                <div className="w-full max-w-4xl mx-auto flex-1 overflow-auto rounded-lg">
                    <pre className="text-text-secondary p-6 rounded-lg overflow-auto h-full text-[13px] font-mono leading-relaxed bg-[#f1ebd9] border border-warm-border">
                        {generateSQL() || '-- No hay tablas creadas para generar SQL.'}
                    </pre>
                </div>
            </div>
        );
    }

    const filteredTables = tables.filter(table =>
        table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.columns.some(col => col.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const TABLE_WIDTH = 288;
    const HEADER_HEIGHT = 49; 
    const ROW_HEIGHT = 40; 
    const ROW_OFFSET = 20;

    const getPortCoords = (tableId, colId) => {
        const table = tables.find(t => t.id === tableId);
        if (!table) return null;
        const colIdx = table.columns.findIndex(c => c.id === colId);
        if (colIdx === -1) return null;

        const baseY = table.y + HEADER_HEIGHT + (colIdx * ROW_HEIGHT) + ROW_OFFSET;
        
        return {
            leftX: table.x,
            leftY: baseY,
            rightX: table.x + TABLE_WIDTH,
            rightY: baseY
        };
    };

    const toggleRelation = (connId, currentType) => {
        const types = ['1:1', '1:n', 'n:1', 'n:n'];
        const nextIdx = (types.indexOf(currentType || '1:n') + 1) % types.length;
        updateConnection(connId, { relationType: types[nextIdx] });
    };

    const renderMarker = (x, y, type, dir) => {
        if (type === 'n') {
            return <path d={`M ${x} ${y - 6} L ${x + 10 * dir} ${y} L ${x} ${y + 6}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-200" />;
        }
        // As requested: '1' is just the line, no markers
        return null;
    };

    return (
        <div className="flex-1 relative bg-warm-bg overflow-hidden flex flex-col min-h-0 select-none">
            {/* Extremely subtle dot grid */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(var(--color-text-soft) 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}
            ></div>
            
            <div 
                ref={canvasRef}
                className="w-full h-full relative overflow-auto z-0 p-8"
                onClick={(e) => {
                    if (e.target === canvasRef.current || e.target.tagName.toLowerCase() === 'svg') {
                        setSelectedTableId(null);
                    }
                }}
            >
                {/* SVG Connections Layer */}
                <svg className="absolute top-0 left-0 pointer-events-none w-full h-full min-w-[3000px] min-h-[3000px] overflow-visible">
                    {connections.map(conn => {
                        const fromCoords = getPortCoords(conn.fromTableId, conn.fromColId);
                        const toCoords = getPortCoords(conn.toTableId, conn.toColId);
                        
                        if (!fromCoords || !toCoords) return null;

                        let startX = fromCoords.rightX;
                        let startY = fromCoords.rightY;
                        let endX = toCoords.leftX;
                        let endY = toCoords.leftY;
                        let startDir = 1;
                        let endDir = -1;

                        if (fromCoords.leftX > toCoords.rightX) {
                            startX = fromCoords.leftX;
                            endX = toCoords.rightX;
                            startDir = -1;
                            endDir = 1;
                        }

                        let cOff = Math.max(80, Math.abs(endX - startX) / 2);
                        const pathData = `M ${startX} ${startY} C ${startX > endX ? startX - cOff : startX + cOff} ${startY}, ${endX > startX ? endX - cOff : endX + cOff} ${endY}, ${endX} ${endY}`;
                        
                        const midX = (startX + endX) / 2;
                        const midY = (startY + endY) / 2;
                        const type = conn.relationType || '1:n';
                        const [fromType, toType] = type.split(':');

                        return (
                            <g key={conn.id} className="pointer-events-auto group/conn text-[color:var(--color-text-soft)] hover:text-[color:var(--color-accent)]">
                                <path d={pathData} fill="none" stroke="transparent" strokeWidth="20" />
                                <path 
                                    d={pathData} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="1.5" 
                                    className="transition-colors duration-200"
                                />
                                
                                {/* Markers */}
                                {renderMarker(startX, startY, fromType, startDir)}
                                {renderMarker(endX, endY, toType, endDir)}

                                {/* Rel Type Pill */}
                                <g transform={`translate(${midX}, ${midY})`}>
                                    <g 
                                        onClick={(e) => { e.stopPropagation(); toggleRelation(conn.id, type); }}
                                        className="cursor-pointer hover:scale-105 transition-transform"
                                        style={{ transformOrigin: '0px 0px' }}
                                    >
                                        <rect x="-14" y="-9" width="28" height="18" rx="6" fill="var(--color-warm-card)" stroke="var(--color-warm-border)" className="group-hover/conn:stroke-accent group-hover/conn:fill-accent-soft transition-colors" />
                                        <text x="0" y="3.5" textAnchor="middle" fontSize="10" fill="currentColor" className="font-mono font-bold select-none pointer-events-none transition-colors">
                                            {type}
                                        </text>
                                    </g>

                                    {/* Delete Button (Visible on Hover) */}
                                    <g 
                                        className="opacity-0 group-hover/conn:opacity-100 transition-opacity cursor-pointer shadow-sm"
                                        style={{ transform: 'translate(18px, -18px)' }}
                                        onClick={(e) => { e.stopPropagation(); removeConnection(conn.id); }}
                                    >
                                        <circle r="7" fill="var(--color-error)" />
                                        <line x1="-3" y1="-3" x2="3" y2="3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                                        <line x1="3" y1="-3" x2="-3" y2="3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                                    </g>
                                </g>
                            </g>
                        );
                    })}

                    {connectingFK && (
                        <path 
                            d={`M ${connectingFK.startX} ${connectingFK.startY} C ${connectingFK.startX + 100} ${connectingFK.startY}, ${connectingFK.currentX - 100} ${connectingFK.currentY}, ${connectingFK.currentX} ${connectingFK.currentY}`}
                            fill="none" 
                            stroke="var(--color-accent)" 
                            strokeWidth="1.5"
                            strokeDasharray="4,4"
                        />
                    )}
                </svg>

                {filteredTables.map(t => (
                    <TableNode
                        key={t.id}
                        table={t}
                        isSelected={selectedTableId === t.id}
                        onMouseDown={onMouseDownTable}
                        onClick={setSelectedTableId}
                        onUpdateColumn={onUpdateColumn}
                        onRemoveColumn={onRemoveColumn}
                        onAddColumn={onAddColumn}
                        onDuplicate={onDuplicateTable}
                        onRemove={onRemoveTable}
                        startConnection={startConnection}
                        completeConnection={completeConnection}
                    />
                ))}

                {tables.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center pointer-events-auto max-w-sm">
                            <div className="w-16 h-16 bg-warm-card border border-warm-border text-text-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Database size={24} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-medium mb-2 text-warm-text">Lienzo en blanco</h3>
                            <p className="text-[14px] mb-8 text-text-secondary leading-relaxed">
                                Comienza tu diseño estructural agregando la primera entidad.
                            </p>
                            <button 
                                className="px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium text-[13px]"
                                onClick={onShowNewTable}
                            >
                                Nueva Tabla
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
