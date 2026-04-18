import React, { useState } from 'react';
import { Analytics } from "@vercel/analytics/react"
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import Inspector from './components/Inspector';
import TableModal from './components/modals/TableModal';
import PreviewModal from './components/modals/PreviewModal';
import { useDBState } from './hooks/useDBState';

export default function App() {
    const dbState = useDBState();
    
    const [showTableForm, setShowTableForm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleCreateTable = (name) => {
        dbState.createTable(name);
        setShowTableForm(false);
    };

    const handleExportJSON = () => {
        const data = { 
            dialect: dbState.sqlDialect, 
            tables: dbState.tables,
            connections: dbState.connections,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'database-design.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportSQL = () => {
        const sql = dbState.generateSQL();
        const blob = new Blob([sql], { type: 'text/sql' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schema-${dbState.sqlDialect}.sql`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopySQLTable = () => {
        if (!dbState.selectedTableId) return;
        const table = dbState.tables.find(t => t.id === dbState.selectedTableId);
        if(!table) return;

        const cols = table.columns.map(c => {
            let line = `  ${c.name} ${c.type}`;
            if (c.pk && dbState.sqlDialect === 'mysql' && !c.type.toLowerCase().includes('auto_increment')) {
                line += ' AUTO_INCREMENT';
            }
            line += c.nullable ? '' : ' NOT NULL';
            if (c.defaultValue && c.defaultValue.trim()) {
                line += ` DEFAULT ${c.defaultValue}`;
            }
            return line;
        }).join(',\n');
        const pkCols = table.columns.filter(c => c.pk).map(c => c.name);
        let pkLine = pkCols.length ? `,\n  PRIMARY KEY (${pkCols.join(', ')})` : '';
        const sql = `CREATE TABLE ${table.name} (\n${cols}${pkLine}\n);`;
        
        navigator.clipboard.writeText(sql);
    };

    const selectedTable = dbState.tables.find(t => t.id === dbState.selectedTableId);

    return (
        <div className="h-screen w-screen bg-warm-bg flex flex-col overflow-hidden text-warm-text font-sans">
            <Header 
                viewMode={dbState.viewMode}
                setViewMode={dbState.setViewMode}
                sqlDialect={dbState.sqlDialect}
                setSqlDialect={dbState.setSqlDialect}
                onShowPreview={() => setShowPreview(true)}
                onShowNewTable={() => setShowTableForm(true)}
            />
            
            {dbState.viewMode === 'design' && (
                <Toolbar 
                    tablesCount={dbState.tables.length}
                    searchTerm={dbState.searchTerm}
                    setSearchTerm={dbState.setSearchTerm}
                    onImport={dbState.importData}
                    onExportJSON={handleExportJSON}
                    onExportSQL={handleExportSQL}
                    onClearAll={dbState.clearAll}
                />
            )}

            <div className="flex-1 flex overflow-hidden border-t border-slate-200">
                <Canvas 
                    tables={dbState.tables}
                    connections={dbState.connections}
                    selectedTableId={dbState.selectedTableId}
                    canvasRef={dbState.canvasRef}
                    viewMode={dbState.viewMode}
                    searchTerm={dbState.searchTerm}
                    generateSQL={dbState.generateSQL}
                    onMouseDownTable={dbState.onMouseDownTable}
                    setSelectedTableId={dbState.setSelectedTableId}
                    onUpdateColumn={dbState.updateColumn}
                    onRemoveColumn={dbState.removeColumn}
                    onAddColumn={dbState.addColumn}
                    onDuplicateTable={dbState.duplicateTable}
                    onRemoveTable={dbState.removeTable}
                    onShowNewTable={() => setShowTableForm(true)}
                    
                    connectingFK={dbState.connectingFK}
                    startConnection={dbState.startConnection}
                    completeConnection={dbState.completeConnection}
                    removeConnection={dbState.removeConnection}
                    updateConnection={dbState.updateConnection}
                />
                
                {dbState.viewMode === 'design' && (
                    <Inspector 
                        selectedTable={selectedTable}
                        onCopySQL={handleCopySQLTable}
                    />
                )}
            </div>

            {showTableForm && (
                <TableModal 
                    onClose={() => setShowTableForm(false)}
                    onCreate={handleCreateTable}
                />
            )}

            {showPreview && (
                <PreviewModal 
                    onClose={() => setShowPreview(false)}
                    sql={dbState.generateSQL()}
                />
            )}
            
            <Analytics />
        </div>
    );
}