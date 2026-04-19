import { useState, useEffect, useRef, useCallback } from 'react';
import upop from 'upop';
import { generatePrismaSchema, generateTypescript } from '../utils/generators';

const STORAGE_KEY = 'db-maker-design';

const sampleData = {
    tables: [
        {
            id: 'sample-1',
            name: 'users',
            x: 80,
            y: 80,
            color: '#007AFF', // Apple Blue
            columns: [
                { id: 'sample-1-c1', name: 'id', type: 'serial', pk: true, nullable: false },
                { id: 'sample-1-c2', name: 'username', type: 'varchar(50)', pk: false, nullable: false },
                { id: 'sample-1-c3', name: 'email', type: 'varchar(255)', pk: false, nullable: false },
                { id: 'sample-1-c4', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                { id: 'sample-1-c5', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
            ]
        },
        {
            id: 'sample-2',
            name: 'posts',
            x: 420,
            y: 120,
            color: '#FF9500', // Apple Orange
            columns: [
                { id: 'sample-2-c1', name: 'id', type: 'serial', pk: true, nullable: false },
                { id: 'sample-2-c2', name: 'user_id', type: 'integer', pk: false, nullable: false },
                { id: 'sample-2-c3', name: 'title', type: 'varchar(255)', pk: false, nullable: false },
                { id: 'sample-2-c4', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                { id: 'sample-2-c5', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
            ]
        }
    ],
    connections: [
        {
            id: 'conn-1',
            fromTableId: 'sample-2',
            fromColId: 'sample-2-c2',
            toTableId: 'sample-1',
            toColId: 'sample-1-c1',
            relationType: '1:n'
        }
    ],
    dialect: 'postgres'
};

export function useDBState() {
    const [tables, setTables] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.tables || [];
            }
        } catch (e) {
            console.error('Error loading tables from localStorage', e);
        }
        return sampleData.tables;
    });

    const [connections, setConnections] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.connections || [];
            }
        } catch (e) {}
        return sampleData.connections;
    });
    
    const [sqlDialect, setSqlDialect] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved).dialect || 'postgres';
        } catch (e) {}
        return sampleData.dialect;
    });

    const [selectedTableId, setSelectedTableId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('design');

    const [connectingFK, setConnectingFK] = useState(null);

    // --- Pan & Zoom ---
    const [zoom, _setZoom] = useState(1);
    const [pan, _setPan] = useState({ x: 0, y: 0 });
    const zoomRef = useRef(1);
    const panRef = useRef({ x: 0, y: 0 });

    const setZoom = useCallback((z) => {
        zoomRef.current = z;
        _setZoom(z);
    }, []);

    const setPan = useCallback((p) => {
        panRef.current = p;
        _setPan(p);
    }, []);

    const getCanvasCoords = useCallback((clientX, clientY) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (clientX - rect.left - panRef.current.x) / zoomRef.current,
            y: (clientY - rect.top - panRef.current.y) / zoomRef.current
        };
    }, []);

    // --- Undo/Redo History ---
    const historyRef = useRef([]);
    const historyIndexRef = useRef(-1);
    const isUndoRedoRef = useRef(false);
    const MAX_HISTORY = 50;

    const pushHistory = useCallback(() => {
        if (isUndoRedoRef.current) return;
        const snapshot = JSON.stringify({ tables, connections });
        // Avoid duplicate consecutive snapshots
        if (historyRef.current.length > 0 && historyRef.current[historyIndexRef.current] === snapshot) return;
        // Truncate future states if we're not at the end
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        historyRef.current.push(snapshot);
        if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
        historyIndexRef.current = historyRef.current.length - 1;
    }, [tables, connections]);

    // Save history on meaningful state changes (debounced slightly)
    const historyTimer = useRef(null);
    useEffect(() => {
        if (historyTimer.current) clearTimeout(historyTimer.current);
        historyTimer.current = setTimeout(() => pushHistory(), 300);
    }, [tables, connections, pushHistory]);

    const undo = useCallback(() => {
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current -= 1;
        const snapshot = JSON.parse(historyRef.current[historyIndexRef.current]);
        isUndoRedoRef.current = true;
        setTables(snapshot.tables);
        setConnections(snapshot.connections);
        setTimeout(() => { isUndoRedoRef.current = false; }, 50);
        upop.toast.info('Deshacer');
    }, []);

    const redo = useCallback(() => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current += 1;
        const snapshot = JSON.parse(historyRef.current[historyIndexRef.current]);
        isUndoRedoRef.current = true;
        setTables(snapshot.tables);
        setConnections(snapshot.connections);
        setTimeout(() => { isUndoRedoRef.current = false; }, 50);
        upop.toast.info('Rehacer');
    }, []);

    const canUndo = historyIndexRef.current > 0;
    const canRedo = historyIndexRef.current < historyRef.current.length - 1;

    // Auto-save
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tables, connections, dialect: sqlDialect }));
    }, [tables, connections, sqlDialect]);

    const canvasRef = useRef(null);
    const dragging = useRef({ id: null, offsetX: 0, offsetY: 0, requestedFrame: null });

    function createTable(newTableName) {
        if (!newTableName.trim()) return;
        const id = Date.now().toString();
        const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#FF2D55']; // Apple system colors
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const t = {
            id,
            name: newTableName.trim(),
            x: 100 + (tables.length % 5) * 40,
            y: 100 + (tables.length % 5) * 40,
            color: randomColor,
            columns: [
                { 
                    id: id + '-c1', 
                    name: 'id', 
                    type: sqlDialect === 'postgres' ? 'serial' : 
                          sqlDialect === 'mysql' ? 'int AUTO_INCREMENT' : 'INTEGER', 
                    pk: true, 
                    nullable: false 
                }
            ]
        };
        setTables(prev => [...prev, t]);
        setSelectedTableId(id);
    }

    function addColumn(tableId, initialProps = {}) {
        setTables(prev => prev.map(t => {
            if (t.id !== tableId) return t;
            const colId = t.id + '-c' + Date.now() + Math.floor(Math.random()*1000);
            return { 
                ...t, 
                columns: [...t.columns, { 
                    id: colId, 
                    name: initialProps.name || 'new_column', 
                    type: initialProps.type || 'varchar(255)', 
                    pk: initialProps.pk || false, 
                    nullable: initialProps.nullable !== undefined ? initialProps.nullable : true,
                    defaultValue: initialProps.defaultValue || ''
                }] 
            };
        }));
    }

    const updateColumn = useCallback((tableId, colId, patch) => {
        setTables(prev => prev.map(t => {
            if (t.id !== tableId) return t;
            return {
                ...t,
                columns: t.columns.map(c => c.id === colId ? { ...c, ...patch } : c)
            };
        }));
    }, []);

    const removeColumn = useCallback((tableId, colId) => {
        setTables(prev => prev.map(t => {
            if (t.id !== tableId) return t;
            return { ...t, columns: t.columns.filter(c => c.id !== colId) };
        }));
        setConnections(prev => prev.filter(c => c.fromColId !== colId && c.toColId !== colId));
    }, []);

    function removeTable(tableId) {
        setTables(prev => prev.filter(t => t.id !== tableId));
        setConnections(prev => prev.filter(c => c.fromTableId !== tableId && c.toTableId !== tableId));
        if (selectedTableId === tableId) setSelectedTableId(null);
    }

    function duplicateTable(tableId) {
        const original = tables.find(t => t.id === tableId);
        if (!original) return;
        
        const newId = Date.now().toString();
        const duplicated = {
            ...original,
            id: newId,
            name: original.name + '_copy',
            x: original.x + 40,
            y: original.y + 40,
            columns: original.columns.map(col => ({
                ...col,
                id: newId + '-c' + col.id.split('-c')[1] + Math.floor(Math.random()*1000)
            }))
        };
        
        setTables(prev => [...prev, duplicated]);
        setSelectedTableId(newId);
    }

    // --- Table Dragging Optimized with requestAnimationFrame ---
    const onMouseDownTable = useCallback((e, table) => {
        if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button' || e.target.closest('.port')) {
            return;
        }
        
        e.stopPropagation();

        const coords = getCanvasCoords(e.clientX, e.clientY);
        dragging.current.id = table.id;
        dragging.current.offsetX = coords.x - table.x;
        dragging.current.offsetY = coords.y - table.y;
        setSelectedTableId(table.id);
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [getCanvasCoords]);

    function onMouseMove(e) {
        const id = dragging.current.id;
        if (!id) return;
        
        if (dragging.current.requestedFrame) {
            cancelAnimationFrame(dragging.current.requestedFrame);
        }

        // Use requestAnimationFrame for smooth 60fps execution
        dragging.current.requestedFrame = requestAnimationFrame(() => {
            const coords = getCanvasCoords(e.clientX, e.clientY);
            setTables(prev => prev.map(t => 
                t.id === id ? { 
                    ...t, 
                    x: coords.x - dragging.current.offsetX, 
                    y: coords.y - dragging.current.offsetY 
                } : t
            ));
        });
    }

    function onMouseUp() {
        dragging.current.id = null;
        if (dragging.current.requestedFrame) {
            cancelAnimationFrame(dragging.current.requestedFrame);
        }
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }

    // --- Connection Dragging ---
    const connectionDragging = useRef({ active: false, requestedFrame: null });

    const startConnection = useCallback((e, tableId, colId) => {
        e.preventDefault();
        e.stopPropagation();
        
        const coords = getCanvasCoords(e.clientX, e.clientY);
        const startX = coords.x;
        const startY = coords.y;

        connectionDragging.current.active = true;
        connectionDragging.current.fromTableId = tableId;
        connectionDragging.current.fromColId = colId;

        setConnectingFK({
            fromTableId: tableId,
            fromColId: colId,
            startX,
            startY,
            currentX: startX,
            currentY: startY
        });

        window.addEventListener('mousemove', onConnectionMove);
        window.addEventListener('mouseup', onConnectionUp);
    }, [getCanvasCoords]);

    function onConnectionMove(e) {
        if (!connectionDragging.current.active) return;
        
        if (connectionDragging.current.requestedFrame) {
            cancelAnimationFrame(connectionDragging.current.requestedFrame);
        }
        
        connectionDragging.current.requestedFrame = requestAnimationFrame(() => {
            const coords = getCanvasCoords(e.clientX, e.clientY);
            setConnectingFK(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    currentX: coords.x,
                    currentY: coords.y
                };
            });
        });
    }

    function onConnectionUp() {
        connectionDragging.current.active = false;
        connectionDragging.current.fromTableId = null;
        connectionDragging.current.fromColId = null;
        if (connectionDragging.current.requestedFrame) {
            cancelAnimationFrame(connectionDragging.current.requestedFrame);
        }
        setConnectingFK(null);
        window.removeEventListener('mousemove', onConnectionMove);
        window.removeEventListener('mouseup', onConnectionUp);
    }

    const completeConnection = useCallback((toTableId, toColId) => {
        if (!connectionDragging.current.active) return;
        
        const fromTableId = connectionDragging.current.fromTableId;
        const fromColId = connectionDragging.current.fromColId;

        if (!fromTableId || !fromColId) return;

        if (fromTableId === toTableId) {
            if (fromColId === toColId) return;
        }

        const newConn = {
            id: 'conn-' + Date.now(),
            fromTableId,
            fromColId,
            toTableId,
            toColId,
            relationType: '1:n'
        };

        setConnections(prev => {
            const exists = prev.find(c => c.fromColId === newConn.fromColId && c.toColId === newConn.toColId);
            if (exists) return prev;
            return [...prev, newConn];
        });
    }, []);

    const removeConnection = useCallback((connId) => {
        setConnections(prev => prev.filter(c => c.id !== connId));
    }, []);

    const updateConnection = useCallback((connId, patch) => {
        setConnections(prev => prev.map(c => c.id === connId ? { ...c, ...patch } : c));
    }, []);

    // --- Canvas Panning & Zoom Handler ---
    const canvasPanDragging = useRef({ active: false, startX: 0, startY: 0, initialPanX: 0, initialPanY: 0 });

    const onMouseDownCanvas = useCallback((e) => {
        if (!e.target.classList.contains('canvas-zoom-container') && e.target !== canvasRef.current && e.target.tagName.toLowerCase() !== 'svg') return;
        
        canvasPanDragging.current.active = true;
        canvasPanDragging.current.startX = e.clientX;
        canvasPanDragging.current.startY = e.clientY;
        canvasPanDragging.current.initialPanX = panRef.current.x;
        canvasPanDragging.current.initialPanY = panRef.current.y;
        
        window.addEventListener('mousemove', onCanvasMouseMove);
        window.addEventListener('mouseup', onCanvasMouseUp);
        setSelectedTableId(null);
    }, []);

    const onCanvasMouseMove = useCallback((e) => {
        if (!canvasPanDragging.current.active) return;
        
        const dx = e.clientX - canvasPanDragging.current.startX;
        const dy = e.clientY - canvasPanDragging.current.startY;
        
        setPan({
            x: canvasPanDragging.current.initialPanX + dx,
            y: canvasPanDragging.current.initialPanY + dy
        });
    }, [setPan]);

    const onCanvasMouseUp = useCallback(() => {
        canvasPanDragging.current.active = false;
        window.removeEventListener('mousemove', onCanvasMouseMove);
        window.removeEventListener('mouseup', onCanvasMouseUp);
    }, [onCanvasMouseMove]);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        
        const handleWheel = (e) => {
            if (viewMode !== 'design') return;
            e.preventDefault();
            
            // Adjust zoom sensitivity 
            const isTrackpad = Math.abs(e.deltaY) < 50;
            const zoomSensitivity = isTrackpad ? 0.005 : 0.001; // higher sensitivity for trackpad relative to mouse wheel which comes in larger chunks
            const delta = -e.deltaY * zoomSensitivity;
            let newZoom = Math.max(0.1, Math.min(zoomRef.current + delta, 3));
            
            const rect = canvasEl.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const canvasX = (mouseX - panRef.current.x) / zoomRef.current;
            const canvasY = (mouseY - panRef.current.y) / zoomRef.current;
            
            setZoom(newZoom);
            setPan({
                x: mouseX - canvasX * newZoom,
                y: mouseY - canvasY * newZoom
            });
        };
        
        canvasEl.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvasEl.removeEventListener('wheel', handleWheel);
    }, [viewMode, setPan, setZoom]);

    // ... generator code...
    function generateSQL() {
        if (sqlDialect === 'prisma') return generatePrismaSchema(tables, connections);
        if (sqlDialect === 'typescript') return generateTypescript(tables, connections);

        const fkMap = {};
        connections.forEach(conn => {
            if (!fkMap[conn.fromTableId]) fkMap[conn.fromTableId] = [];
            
            const fromTable = tables.find(t => t.id === conn.fromTableId);
            const toTable = tables.find(t => t.id === conn.toTableId);
            const fromCol = fromTable?.columns.find(c => c.id === conn.fromColId);
            const toCol = toTable?.columns.find(c => c.id === conn.toColId);

            if (fromTable && toTable && fromCol && toCol) {
                fkMap[conn.fromTableId].push({
                    fromColName: fromCol.name,
                    toTableName: toTable.name,
                    toColName: toCol.name
                });
            }
        });

        const snippets = tables.map(t => {
            const cols = t.columns.map(c => {
                let line = `  ${c.name} ${c.type}`;
                if (c.pk && sqlDialect === 'mysql' && !c.type.toLowerCase().includes('auto_increment')) {
                    line += ' AUTO_INCREMENT';
                }
                line += c.nullable ? '' : ' NOT NULL';
                if (c.defaultValue && c.defaultValue.trim()) {
                    line += ` DEFAULT ${c.defaultValue}`;
                }
                return line;
            }).join(',\n');

            const pkCols = t.columns.filter(c => c.pk).map(c => c.name);
            let pkLine = pkCols.length ? `,\n  PRIMARY KEY (${pkCols.join(', ')})` : '';

            return `CREATE TABLE ${t.name} (\n${cols}${pkLine}\n);`;
        });

        const alterSnippets = [];
        Object.keys(fkMap).forEach(tableId => {
            const tableName = tables.find(t => t.id === tableId).name;
            fkMap[tableId].forEach((fk, idx) => {
                alterSnippets.push(`ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName}_${fk.fromColName} FOREIGN KEY (${fk.fromColName}) REFERENCES ${fk.toTableName} (${fk.toColName});`);
            });
        });

        let output = snippets.join('\n\n');
        if (alterSnippets.length > 0) {
            output += '\n\n-- Foreign Keys\n\n' + alterSnippets.join('\n');
        }

        return output;
    }

    function clearAll() {
        upop.confirm.warning('¿Estás seguro de que quieres eliminar todas las tablas?', {
            textoAceptar: 'Eliminar todo',
            textoCancelar: 'Cancelar',
            onConfirm: () => {
                setTables([]);
                setConnections([]);
                setSelectedTableId(null);
                localStorage.removeItem(STORAGE_KEY);
                upop.toast.success('Diagrama limpiado');
            }
        });
    }

    function importData(data) {
        if (data.tables && Array.isArray(data.tables)) {
            setTables(data.tables);
            setConnections(data.connections || []);
            if (data.dialect) setSqlDialect(data.dialect);
        }
    }

    return {
        tables,
        setTables,
        connections,
        sqlDialect,
        setSqlDialect,
        selectedTableId,
        setSelectedTableId,
        searchTerm,
        setSearchTerm,
        viewMode,
        setViewMode,
        createTable,
        addColumn,
        updateColumn,
        removeColumn,
        removeTable,
        duplicateTable,
        onMouseDownTable,
        generateSQL,
        clearAll,
        importData,
        canvasRef,
        
        connectingFK,
        startConnection,
        completeConnection,
        removeConnection,
        updateConnection,

        zoom,
        pan,
        setZoom,
        setPan,
        onMouseDownCanvas,

        undo,
        redo,
        canUndo,
        canRedo
    };
}
