import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react"
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import Inspector from './components/Inspector';
import TableModal from './components/modals/TableModal';
import PreviewModal from './components/modals/PreviewModal';
import ImportSQLModal from './components/modals/ImportSQLModal';
import TemplatesModal from './components/modals/TemplatesModal';
import CommandPalette from './components/CommandPalette';
import { generatePrismaSchema, generateTypescript } from './utils/generators';
import { analyzeSchema, getTableSeverity } from './utils/schemaAnalyzer';
import HealthPanel from './components/HealthPanel';
import { useDBState } from './hooks/useDBState';

export default function App() {
    const dbState = useDBState();
    
    const [showTableForm, setShowTableForm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [showImportSQL, setShowImportSQL] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showHealthPanel, setShowHealthPanel] = useState(false);

    const { score, issues, tableIssues } = React.useMemo(() => {
        return analyzeSchema(dbState.tables, dbState.connections);
    }, [dbState.tables, dbState.connections]);

    const globalSeverity = getTableSeverity(issues);

    const handleApplyQuickFix = (quickFix) => {
        if (!quickFix) return;
        const { action, payload } = quickFix;
        if (action === 'ADD_PK') {
            dbState.addColumn(payload.tableId, { name: 'id', pk: true, nullable: false, type: dbState.sqlDialect === 'postgres' ? 'serial' : (dbState.sqlDialect === 'mysql' ? 'int AUTO_INCREMENT' : 'INTEGER') });
        } else if (action === 'ADD_TIMESTAMPS') {
            dbState.addColumn(payload.tableId, { name: 'created_at', type: 'timestamp', nullable: true, defaultValue: 'CURRENT_TIMESTAMP' });
            dbState.addColumn(payload.tableId, { name: 'updated_at', type: 'timestamp', nullable: true });
        } else if (action === 'ADD_CREATED_AT') {
            dbState.addColumn(payload.tableId, { name: 'created_at', type: 'timestamp', nullable: true, defaultValue: 'CURRENT_TIMESTAMP' });
        } else if (action === 'ADD_UPDATED_AT') {
            dbState.addColumn(payload.tableId, { name: 'updated_at', type: 'timestamp', nullable: true });
        } else if (action === 'SET_COLUMN_TYPE') {
            dbState.updateColumn(payload.tableId, payload.colId, { type: payload.type });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(prev => !prev);
            }
            // Undo: Ctrl+Z
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                // Don't intercept if user is typing in an input
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                e.preventDefault();
                dbState.undo();
            }
            // Redo: Ctrl+Shift+Z or Ctrl+Y
            if ((e.metaKey || e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                e.preventDefault();
                dbState.redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dbState.undo, dbState.redo]);

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

    const handleExportPrisma = () => {
        const prisma = generatePrismaSchema(dbState.tables, dbState.connections);
        const blob = new Blob([prisma], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schema.prisma`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportTS = () => {
        const ts = generateTypescript(dbState.tables, dbState.connections);
        const blob = new Blob([ts], { type: 'text/typescript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `types.ts`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportSQL = (parsed) => {
        dbState.importData({
            tables: parsed.tables,
            connections: parsed.connections,
            dialect: dbState.sqlDialect
        });
    };

    const handleApplyTemplate = (data) => {
        dbState.importData({
            tables: data.tables,
            connections: data.connections,
            dialect: dbState.sqlDialect
        });
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
                onShowImportSQL={() => setShowImportSQL(true)}
                onShowTemplates={() => setShowTemplates(true)}
                canUndo={dbState.canUndo}
                canRedo={dbState.canRedo}
                onUndo={dbState.undo}
                onRedo={dbState.redo}
                healthScore={score}
                onToggleHealthPanel={() => setShowHealthPanel(!showHealthPanel)}
            />
            
            {dbState.viewMode === 'design' && (
                <Toolbar 
                    tablesCount={dbState.tables.length}
                    searchTerm={dbState.searchTerm}
                    setSearchTerm={dbState.setSearchTerm}
                    onImport={dbState.importData}
                    onExportJSON={handleExportJSON}
                    onExportSQL={handleExportSQL}
                    onExportPrisma={handleExportPrisma}
                    onExportTS={handleExportTS}
                    onClearAll={dbState.clearAll}
                />
            )}

            <div className="flex-1 flex overflow-hidden border-t border-slate-200">
                <Canvas 
                    tables={dbState.tables}
                    connections={dbState.connections}
                    tableIssues={tableIssues}
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

                    zoom={dbState.zoom}
                    pan={dbState.pan}
                    onMouseDownCanvas={dbState.onMouseDownCanvas}

                    onApplyTemplate={handleApplyTemplate}
                    onShowImportSQL={() => setShowImportSQL(true)}
                />
                
                {dbState.viewMode === 'design' && (
                    selectedTable ? (
                        <Inspector 
                            selectedTable={selectedTable}
                            tableIssues={tableIssues[selectedTable.id] || []}
                            onCopySQL={handleCopySQLTable}
                            onApplyQuickFix={handleApplyQuickFix}
                        />
                    ) : showHealthPanel ? (
                        <HealthPanel 
                            score={score}
                            issues={issues}
                            onSelectTable={dbState.setSelectedTableId}
                            onApplyQuickFix={handleApplyQuickFix}
                        />
                    ) : (
                        <Inspector selectedTable={null} />
                    )
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

            {showImportSQL && (
                <ImportSQLModal 
                    onClose={() => setShowImportSQL(false)}
                    onImport={handleImportSQL}
                />
            )}

            {showTemplates && (
                <TemplatesModal 
                    onClose={() => setShowTemplates(false)}
                    onApply={handleApplyTemplate}
                />
            )}

            <CommandPalette 
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                dbState={dbState}
                onShowNewTable={() => setShowTableForm(true)}
                onExportJSON={handleExportJSON}
                onExportSQL={handleExportSQL}
                onExportPrisma={handleExportPrisma}
                onExportTS={handleExportTS}
                onShowImportSQL={() => setShowImportSQL(true)}
                onShowTemplates={() => setShowTemplates(true)}
            />
            
            <Analytics />
        </div>
    );
}