/**
 * SQL Parser — Reverse engineers CREATE TABLE statements into ReadyDB table objects.
 * Supports PostgreSQL, MySQL, and SQLite dialects.
 */

export function parseSQL(sql) {
    const tables = [];
    const connections = [];

    // Normalize: remove comments, collapse whitespace
    const cleaned = sql
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\r\n/g, '\n');

    // Match CREATE TABLE blocks
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(([\s\S]*?)\)\s*;/gi;
    let match;
    let tableIndex = 0;

    while ((match = tableRegex.exec(cleaned)) !== null) {
        const tableName = match[1];
        const body = match[2];
        const tableId = 'imported-' + Date.now() + '-' + tableIndex;

        const columns = [];
        const pkColumns = [];
        const fkDefs = [];

        // Split body by top-level commas (ignoring commas inside parentheses)
        const lines = splitByTopLevelComma(body);

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            // PRIMARY KEY constraint
            const pkMatch = line.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
            if (pkMatch) {
                pkMatch[1].split(',').forEach(col => pkColumns.push(col.trim().replace(/[`"']/g, '')));
                continue;
            }

            // FOREIGN KEY constraint
            const fkMatch = line.match(/(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i);
            if (fkMatch) {
                fkDefs.push({
                    localCol: fkMatch[1].trim().replace(/[`"']/g, ''),
                    refTable: fkMatch[2],
                    refCol: fkMatch[3].trim().replace(/[`"']/g, '')
                });
                continue;
            }

            // UNIQUE, CHECK, INDEX constraints — skip
            if (/^(UNIQUE|CHECK|INDEX|KEY|CONSTRAINT)\s/i.test(line)) continue;

            // Column definition
            const colMatch = line.match(/^[`"']?(\w+)[`"']?\s+(.+)$/);
            if (!colMatch) continue;

            const colName = colMatch[1];
            const rest = colMatch[2];

            // Extract type (first word, possibly with parens)
            const typeMatch = rest.match(/^(\w+(?:\s*\([^)]*\))?)/);
            const colType = typeMatch ? typeMatch[1].trim() : 'varchar';

            const isPK = /PRIMARY\s+KEY/i.test(rest);
            const isNullable = !/NOT\s+NULL/i.test(rest);
            const autoInc = /AUTO_INCREMENT|SERIAL|AUTOINCREMENT|GENERATED\s+ALWAYS/i.test(rest) || /SERIAL/i.test(colType);

            // Default value
            let defaultValue = '';
            const defMatch = rest.match(/DEFAULT\s+(.+?)(?:\s+(?:NOT\s+NULL|NULL|PRIMARY|UNIQUE|CHECK|REFERENCES|CONSTRAINT|,|$))/i);
            if (defMatch) {
                defaultValue = defMatch[1].trim().replace(/,\s*$/, '');
            }

            const colId = tableId + '-c' + columns.length;
            columns.push({
                id: colId,
                name: colName,
                type: colType,
                pk: isPK,
                nullable: isNullable && !isPK,
                defaultValue
            });
        }

        // Apply composite PK 
        for (const pkName of pkColumns) {
            const col = columns.find(c => c.name === pkName);
            if (col) col.pk = true;
        }

        const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#FF2D55'];
        tables.push({
            id: tableId,
            name: tableName,
            x: 80 + (tableIndex % 4) * 350,
            y: 80 + Math.floor(tableIndex / 4) * 300,
            color: colors[tableIndex % colors.length],
            columns
        });

        // Store FK defs to resolve after all tables parsed
        for (const fk of fkDefs) {
            connections.push({
                _fromTable: tableName,
                _fromCol: fk.localCol,
                _toTable: fk.refTable,
                _toCol: fk.refCol
            });
        }

        tableIndex++;
    }

    // Also detect ALTER TABLE ... ADD FOREIGN KEY
    const alterRegex = /ALTER\s+TABLE\s+[`"']?(\w+)[`"']?\s+ADD\s+(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/gi;
    while ((match = alterRegex.exec(cleaned)) !== null) {
        connections.push({
            _fromTable: match[1],
            _fromCol: match[2].trim().replace(/[`"']/g, ''),
            _toTable: match[3],
            _toCol: match[4].trim().replace(/[`"']/g, '')
        });
    }

    // Resolve connections to IDs
    const resolvedConnections = [];
    for (const conn of connections) {
        const fromTable = tables.find(t => t.name.toLowerCase() === conn._fromTable.toLowerCase());
        const toTable = tables.find(t => t.name.toLowerCase() === conn._toTable.toLowerCase());
        if (!fromTable || !toTable) continue;

        const fromCol = fromTable.columns.find(c => c.name.toLowerCase() === conn._fromCol.toLowerCase());
        const toCol = toTable.columns.find(c => c.name.toLowerCase() === conn._toCol.toLowerCase());
        if (!fromCol || !toCol) continue;

        resolvedConnections.push({
            id: 'conn-' + Date.now() + '-' + resolvedConnections.length,
            fromTableId: fromTable.id,
            fromColId: fromCol.id,
            toTableId: toTable.id,
            toColId: toCol.id,
            relationType: '1:n'
        });
    }

    return { tables, connections: resolvedConnections };
}

function splitByTopLevelComma(str) {
    const result = [];
    let depth = 0;
    let current = '';

    for (const ch of str) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        
        if (ch === ',' && depth === 0) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim()) result.push(current);
    return result;
}
