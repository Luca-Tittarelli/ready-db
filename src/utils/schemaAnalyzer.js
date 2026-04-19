/**
 * Schema Health Analyzer — ReadyDB
 * Analyzes database schema design and returns issues + health score.
 * Pure JS, zero dependencies, runs entirely client-side.
 */

// SQL reserved words — strict subset of truly dangerous keywords that will cause
// syntax errors if used unquoted in most dialects. Excludes common column/table 
// names like 'name', 'status', 'role', 'user' that are valid in PG/MySQL/SQLite.
const RESERVED_WORDS = new Set([
    'select', 'from', 'where', 'table', 'column', 'index', 'order', 'group',
    'by', 'insert', 'update', 'delete', 'drop', 'create', 'alter', 'add',
    'primary', 'foreign', 'unique', 'check', 'default',
    'null', 'not', 'and', 'or', 'in', 'is', 'like', 'join', 'left', 'right',
    'inner', 'outer', 'on', 'as', 'distinct', 'having', 'limit', 'offset',
    'union', 'all', 'exists', 'case', 'when', 'then', 'else', 'end',
    'between', 'values', 'into', 'begin', 'commit',
    'rollback', 'transaction', 'view', 'trigger', 'procedure', 'function',
    'database', 'schema', 'grant', 'revoke', 'constraint', 'references',
    'cascade', 'restrict',
]);

// Types considered monetary by name patterns
const MONEY_FIELD_PATTERNS = /^(price|cost|amount|total|fee|balance|salary|wage|rate|discount|tax|revenue|profit|payment|charge|budget|earnings)/i;
// Float types
const FLOAT_TYPES = /^(float|real|double|double\s+precision)/i;
// Integer-like types
const INT_TYPES = /^(int|integer|bigint|smallint|tinyint|serial|bigserial)/i;
// String types
const STRING_TYPES = /^(varchar|character\s+varying|char|nchar|nvarchar)/i;
// Date/time types
const DATE_TYPES = /^(date|time|timestamp|datetime)/i;

/**
 * Severity levels
 */
export const SEVERITY = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

/**
 * All rule IDs (used for toggling rules off)
 */
export const RULE_IDS = {
    NO_PRIMARY_KEY: 'NO_PRIMARY_KEY',
    FLOAT_FOR_MONEY: 'FLOAT_FOR_MONEY',
    DUPLICATE_COLUMN_NAMES: 'DUPLICATE_COLUMN_NAMES',
    NO_TIMESTAMPS: 'NO_TIMESTAMPS',
    VARCHAR_NO_LENGTH: 'VARCHAR_NO_LENGTH',
    MISSING_FK_COLUMN: 'MISSING_FK_COLUMN',
    RESERVED_WORD_NAME: 'RESERVED_WORD_NAME',
    NAMING_INCONSISTENCY: 'NAMING_INCONSISTENCY',
    ORPHAN_TABLE: 'ORPHAN_TABLE',
    LARGE_TABLE: 'LARGE_TABLE',
    SPARSE_TABLE: 'SPARSE_TABLE',
    MISSING_EMAIL_UNIQUE: 'MISSING_EMAIL_UNIQUE',
    CONSIDER_UUID: 'CONSIDER_UUID',
    NO_SOFT_DELETE: 'NO_SOFT_DELETE',
};

// --- RULES ---

function ruleNoPrimaryKey(tables) {
    const issues = [];
    for (const t of tables) {
        if (!t.columns.some(c => c.pk)) {
            issues.push({
                id: RULE_IDS.NO_PRIMARY_KEY,
                severity: SEVERITY.ERROR,
                tableId: t.id,
                tableName: t.name,
                title: 'Sin Primary Key',
                description: `La tabla "${t.name}" no tiene ninguna columna definida como Primary Key.`,
                quickFix: {
                    label: '+ Agregar campo id',
                    action: 'ADD_PK',
                    payload: { tableId: t.id },
                },
            });
        }
    }
    return issues;
}

function ruleFloatForMoney(tables) {
    const issues = [];
    for (const t of tables) {
        for (const c of t.columns) {
            if (MONEY_FIELD_PATTERNS.test(c.name) && FLOAT_TYPES.test(c.type)) {
                issues.push({
                    id: RULE_IDS.FLOAT_FOR_MONEY,
                    severity: SEVERITY.ERROR,
                    tableId: t.id,
                    tableName: t.name,
                    colId: c.id,
                    colName: c.name,
                    title: 'FLOAT para campo monetario',
                    description: `"${t.name}.${c.name}" usa ${c.type.toUpperCase()} para un valor monetario. FLOAT causa errores de redondeo. Usa DECIMAL(10,2).`,
                    quickFix: {
                        label: 'Cambiar a DECIMAL(10,2)',
                        action: 'SET_COLUMN_TYPE',
                        payload: { tableId: t.id, colId: c.id, type: 'decimal(10,2)' },
                    },
                });
            }
        }
    }
    return issues;
}

function ruleDuplicateColumnNames(tables) {
    const issues = [];
    for (const t of tables) {
        const names = t.columns.map(c => c.name.toLowerCase());
        const seen = new Set();
        const dups = new Set();
        for (const n of names) {
            if (seen.has(n)) dups.add(n);
            seen.add(n);
        }
        if (dups.size > 0) {
            issues.push({
                id: RULE_IDS.DUPLICATE_COLUMN_NAMES,
                severity: SEVERITY.ERROR,
                tableId: t.id,
                tableName: t.name,
                title: 'Columnas duplicadas',
                description: `La tabla "${t.name}" tiene columnas con el mismo nombre: ${[...dups].join(', ')}.`,
            });
        }
    }
    return issues;
}

function ruleNoTimestamps(tables) {
    const issues = [];
    for (const t of tables) {
        const colNames = t.columns.map(c => c.name.toLowerCase());
        const hasCreatedAt = colNames.some(n => n === 'created_at' || n === 'createdat' || n === 'created');
        const hasUpdatedAt = colNames.some(n => n === 'updated_at' || n === 'updatedat' || n === 'updated');
        if (!hasCreatedAt && !hasUpdatedAt) {
            issues.push({
                id: RULE_IDS.NO_TIMESTAMPS,
                severity: SEVERITY.WARNING,
                tableId: t.id,
                tableName: t.name,
                title: 'Sin timestamps de auditoría',
                description: `"${t.name}" no tiene campos created_at / updated_at. Estos son esenciales para auditoría y debugging.`,
                quickFix: {
                    label: '+ Agregar timestamps',
                    action: 'ADD_TIMESTAMPS',
                    payload: { tableId: t.id },
                },
            });
        } else if (!hasCreatedAt) {
            issues.push({
                id: RULE_IDS.NO_TIMESTAMPS,
                severity: SEVERITY.WARNING,
                tableId: t.id,
                tableName: t.name,
                title: 'Sin created_at',
                description: `"${t.name}" tiene updated_at pero le falta created_at.`,
                quickFix: {
                    label: '+ Agregar created_at',
                    action: 'ADD_CREATED_AT',
                    payload: { tableId: t.id },
                },
            });
        } else if (!hasUpdatedAt) {
            issues.push({
                id: RULE_IDS.NO_TIMESTAMPS,
                severity: SEVERITY.WARNING,
                tableId: t.id,
                tableName: t.name,
                title: 'Sin updated_at',
                description: `"${t.name}" tiene created_at pero le falta updated_at.`,
                quickFix: {
                    label: '+ Agregar updated_at',
                    action: 'ADD_UPDATED_AT',
                    payload: { tableId: t.id },
                },
            });
        }
    }
    return issues;
}

function ruleVarcharNoLength(tables) {
    const issues = [];
    for (const t of tables) {
        for (const c of t.columns) {
            const base = c.type.trim().toLowerCase();
            if ((base === 'varchar' || base === 'character varying' || base === 'nvarchar') && !c.type.includes('(')) {
                issues.push({
                    id: RULE_IDS.VARCHAR_NO_LENGTH,
                    severity: SEVERITY.WARNING,
                    tableId: t.id,
                    tableName: t.name,
                    colId: c.id,
                    colName: c.name,
                    title: 'VARCHAR sin longitud',
                    description: `"${t.name}.${c.name}" es VARCHAR sin longitud definida. Especifica una longitud (ej: varchar(255)).`,
                    quickFix: {
                        label: 'Cambiar a varchar(255)',
                        action: 'SET_COLUMN_TYPE',
                        payload: { tableId: t.id, colId: c.id, type: 'varchar(255)' },
                    },
                });
            }
        }
    }
    return issues;
}

function ruleMissingFKColumn(tables, connections) {
    // Columns ending in _id that don't have a connection
    const issues = [];
    const connectedColIds = new Set([
        ...connections.map(c => c.fromColId),
        ...connections.map(c => c.toColId),
    ]);
    for (const t of tables) {
        for (const c of t.columns) {
            if (c.pk) continue; // skip PKs like `id`
            if (c.name.toLowerCase().endsWith('_id') && INT_TYPES.test(c.type)) {
                if (!connectedColIds.has(c.id)) {
                    // Find the likely target table
                    const targetName = c.name.slice(0, -3); // strip _id
                    const targetTable = tables.find(t2 => t2.name.toLowerCase() === targetName.toLowerCase());
                    issues.push({
                        id: RULE_IDS.MISSING_FK_COLUMN,
                        severity: SEVERITY.WARNING,
                        tableId: t.id,
                        tableName: t.name,
                        colId: c.id,
                        colName: c.name,
                        title: 'Columna FK sin relación',
                        description: `"${t.name}.${c.name}" parece ser una clave foránea${targetTable ? ` a "${targetTable.name}"` : ''}, pero no tiene ninguna relación definida.`,
                    });
                }
            }
        }
    }
    return issues;
}

function ruleReservedWordName(tables) {
    const issues = [];
    for (const t of tables) {
        if (RESERVED_WORDS.has(t.name.toLowerCase())) {
            issues.push({
                id: RULE_IDS.RESERVED_WORD_NAME,
                severity: SEVERITY.WARNING,
                tableId: t.id,
                tableName: t.name,
                title: 'Nombre reservado de SQL',
                description: `"${t.name}" es una palabra reservada de SQL. Puede causar errores según el dialecto. Considera renombrarlo.`,
            });
        }
        for (const c of t.columns) {
            if (RESERVED_WORDS.has(c.name.toLowerCase()) && c.name.toLowerCase() !== 'id') {
                issues.push({
                    id: RULE_IDS.RESERVED_WORD_NAME,
                    severity: SEVERITY.WARNING,
                    tableId: t.id,
                    tableName: t.name,
                    colId: c.id,
                    colName: c.name,
                    title: 'Columna con nombre reservado',
                    description: `"${t.name}.${c.name}" es una palabra reservada de SQL.`,
                });
            }
        }
    }
    return issues;
}

function ruleNamingInconsistency(tables) {
    // Detect mix of snake_case and camelCase across ALL names
    const issues = [];
    const allNames = [];
    for (const t of tables) {
        allNames.push(t.name);
        for (const c of t.columns) allNames.push(c.name);
    }
    if (allNames.length < 2) return issues;

    const isSnake = name => name.includes('_') && name === name.toLowerCase();
    const isCamel = name => /[a-z][A-Z]/.test(name);

    const snakeNames = allNames.filter(isSnake);
    const camelNames = allNames.filter(isCamel);

    if (snakeNames.length > 0 && camelNames.length > 0) {
        issues.push({
            id: RULE_IDS.NAMING_INCONSISTENCY,
            severity: SEVERITY.INFO,
            tableId: null,
            tableName: null,
            title: 'Inconsistencia de nomenclatura',
            description: `El esquema mezcla snake_case (${snakeNames.slice(0, 2).join(', ')}) y camelCase (${camelNames.slice(0, 2).join(', ')}). Elige una convención y sé consistente.`,
        });
    }
    return issues;
}

function ruleOrphanTable(tables, connections) {
    const issues = [];
    if (tables.length < 2) return issues; // only meaningful with multiple tables
    
    const connectedTableIds = new Set([
        ...connections.map(c => c.fromTableId),
        ...connections.map(c => c.toTableId),
    ]);
    for (const t of tables) {
        if (!connectedTableIds.has(t.id)) {
            issues.push({
                id: RULE_IDS.ORPHAN_TABLE,
                severity: SEVERITY.INFO,
                tableId: t.id,
                tableName: t.name,
                title: 'Tabla sin relaciones',
                description: `"${t.name}" no tiene ninguna relación con otras tablas. ¿Es intencional?`,
            });
        }
    }
    return issues;
}

function ruleLargeTable(tables) {
    const issues = [];
    for (const t of tables) {
        if (t.columns.length > 15) {
            issues.push({
                id: RULE_IDS.LARGE_TABLE,
                severity: SEVERITY.INFO,
                tableId: t.id,
                tableName: t.name,
                title: 'Tabla con muchas columnas',
                description: `"${t.name}" tiene ${t.columns.length} columnas. Considera si hay oportunidad de normalizar y extraer una tabla relacionada.`,
            });
        }
    }
    return issues;
}

function ruleSparseTable(tables) {
    const issues = [];
    for (const t of tables) {
        if (t.columns.length < 3) continue;
        const nullableCount = t.columns.filter(c => c.nullable && !c.pk).length;
        const ratio = nullableCount / t.columns.length;
        if (ratio > 0.7) {
            issues.push({
                id: RULE_IDS.SPARSE_TABLE,
                severity: SEVERITY.INFO,
                tableId: t.id,
                tableName: t.name,
                title: 'Tabla muy dispersa (muchos NULL)',
                description: `"${t.name}" tiene ${Math.round(ratio * 100)}% de sus columnas como nullable. Puede indicar que debería dividirse.`,
            });
        }
    }
    return issues;
}

function ruleMissingEmailUnique(tables) {
    const issues = [];
    for (const t of tables) {
        for (const c of t.columns) {
            if (/^email$/i.test(c.name) && !c.pk) {
                // We can't enforce UNIQUE in current schema model but we can warn
                issues.push({
                    id: RULE_IDS.MISSING_EMAIL_UNIQUE,
                    severity: SEVERITY.INFO,
                    tableId: t.id,
                    tableName: t.name,
                    colId: c.id,
                    colName: c.name,
                    title: 'Email sin constraint UNIQUE',
                    description: `"${t.name}.email" debería tener un constraint UNIQUE para evitar duplicados. Recuerda añadirlo en tu migración.`,
                });
            }
        }
    }
    return issues;
}

function ruleConsiderUUID(tables) {
    const issues = [];
    if (tables.length < 3) return issues; // hint is more relevant for larger schemas
    for (const t of tables) {
        const pk = t.columns.find(c => c.pk);
        if (pk && /serial|auto_increment/i.test(pk.type)) {
            issues.push({
                id: RULE_IDS.CONSIDER_UUID,
                severity: SEVERITY.INFO,
                tableId: t.id,
                tableName: t.name,
                colId: pk.id,
                colName: pk.name,
                title: 'Considerar UUID para PK',
                description: `"${t.name}.${pk.name}" usa auto-increment. Para sistemas distribuidos o APIs públicas, UUID es preferible ya que no expone el volumen de registros.`,
            });
        }
    }
    return issues;
}

// --- RULE REGISTRY ---
const RULES = [
    { id: RULE_IDS.NO_PRIMARY_KEY,        fn: (t, c) => ruleNoPrimaryKey(t) },
    { id: RULE_IDS.FLOAT_FOR_MONEY,       fn: (t, c) => ruleFloatForMoney(t) },
    { id: RULE_IDS.DUPLICATE_COLUMN_NAMES, fn: (t, c) => ruleDuplicateColumnNames(t) },
    { id: RULE_IDS.NO_TIMESTAMPS,         fn: (t, c) => ruleNoTimestamps(t) },
    { id: RULE_IDS.VARCHAR_NO_LENGTH,     fn: (t, c) => ruleVarcharNoLength(t) },
    { id: RULE_IDS.MISSING_FK_COLUMN,     fn: (t, c) => ruleMissingFKColumn(t, c) },
    { id: RULE_IDS.RESERVED_WORD_NAME,    fn: (t, c) => ruleReservedWordName(t) },
    { id: RULE_IDS.NAMING_INCONSISTENCY,  fn: (t, c) => ruleNamingInconsistency(t) },
    { id: RULE_IDS.ORPHAN_TABLE,          fn: (t, c) => ruleOrphanTable(t, c) },
    { id: RULE_IDS.LARGE_TABLE,           fn: (t, c) => ruleLargeTable(t) },
    { id: RULE_IDS.SPARSE_TABLE,          fn: (t, c) => ruleSparseTable(t) },
    { id: RULE_IDS.MISSING_EMAIL_UNIQUE,  fn: (t, c) => ruleMissingEmailUnique(t) },
    { id: RULE_IDS.CONSIDER_UUID,         fn: (t, c) => ruleConsiderUUID(t) },
];

const SEVERITY_WEIGHT = {
    [SEVERITY.ERROR]: 10,
    [SEVERITY.WARNING]: 3,
    [SEVERITY.INFO]: 0,
};

/**
 * Main entry point.
 * @param {Array} tables
 * @param {Array} connections
 * @param {Set<string>} [disabledRules] - optional set of rule IDs to skip
 * @returns {{ score: number, issues: Issue[], tableIssues: Record<string, Issue[]> }}
 */
export function analyzeSchema(tables, connections, disabledRules = new Set()) {
    if (!tables || tables.length === 0) {
        return { score: 100, issues: [], tableIssues: {} };
    }

    const allIssues = [];
    for (const rule of RULES) {
        if (disabledRules.has(rule.id)) continue;
        try {
            const found = rule.fn(tables, connections);
            allIssues.push(...found);
        } catch (e) {
            console.warn(`[SchemaAnalyzer] Rule ${rule.id} threw:`, e);
        }
    }

    // Build tableIssues map: tableId → issues[]
    const tableIssues = {};
    for (const t of tables) {
        tableIssues[t.id] = allIssues.filter(i => i.tableId === t.id);
    }

    // Compute score
    const penalty = allIssues.reduce((acc, issue) => acc + (SEVERITY_WEIGHT[issue.severity] || 0), 0);
    const score = Math.max(0, Math.min(100, 100 - penalty));

    return { score, issues: allIssues, tableIssues };
}

/**
 * Returns the worst severity for a table's issue list.
 * @param {Issue[]} issues
 * @returns {'error'|'warning'|'info'|'ok'}
 */
export function getTableSeverity(issues) {
    if (!issues || issues.length === 0) return 'ok';
    if (issues.some(i => i.severity === SEVERITY.ERROR)) return SEVERITY.ERROR;
    if (issues.some(i => i.severity === SEVERITY.WARNING)) return SEVERITY.WARNING;
    return SEVERITY.INFO;
}
