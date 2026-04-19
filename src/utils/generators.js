export function generatePrismaSchema(tables, connections) {
    let schema = `generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`;

    tables.forEach(t => {
        schema += `model ${t.name} {\n`;
        
        t.columns.forEach(c => {
            let type = 'String';
            const sqlBase = c.type.toLowerCase();
            if (sqlBase.includes('int') || sqlBase.includes('serial')) type = 'Int';
            else if (sqlBase.includes('bool') || sqlBase.includes('bit')) type = 'Boolean';
            else if (sqlBase.includes('date') || sqlBase.includes('time')) type = 'DateTime';
            else if (sqlBase.includes('json')) type = 'Json';
            else if (sqlBase.includes('float') || sqlBase.includes('real') || sqlBase.includes('numeric')) type = 'Float';

            let line = `  ${c.name} ${type}${c.nullable ? '?' : ''}`;
            if (c.pk) line += ' @id' + (c.type.includes('serial') || c.type.includes('auto') ? ' @default(autoincrement())' : '');
            if (c.name === 'created_at') line += ' @default(now())';
            if (c.name === 'updated_at') line += ' @updatedAt';

            schema += line + '\n';
        });

        // Add relations
        const relatedFrom = connections.filter(conn => conn.fromTableId === t.id);
        const relatedTo = connections.filter(conn => conn.toTableId === t.id);

        if (relatedFrom.length > 0 || relatedTo.length > 0) schema += '\n';

        relatedFrom.forEach(conn => {
            const toTable = tables.find(x => x.id === conn.toTableId);
            const fromCol = t.columns.find(x => x.id === conn.fromColId);
            const toCol = toTable?.columns.find(x => x.id === conn.toColId);
            if (toTable && fromCol && toCol) {
                schema += `  ${toTable.name.toLowerCase()} ${toTable.name} @relation(fields: [${fromCol.name}], references: [${toCol.name}])\n`;
            }
        });

        relatedTo.forEach(conn => {
            const fromTable = tables.find(x => x.id === conn.fromTableId);
            // Reverse relationship (1:n default assumption for now)
            if (fromTable) {
                schema += `  ${fromTable.name}_list ${fromTable.name}[]\n`;
            }
        });

        schema += `}\n\n`;
    });

    return schema;
}

export function generateTypescript(tables, connections) {
    let code = `// Generado usando ReadyDB\n\n`;

    tables.forEach(t => {
        code += `export interface ${t.name.charAt(0).toUpperCase() + t.name.slice(1)} {\n`;
        
        t.columns.forEach(c => {
            let type = 'string';
            const sqlBase = c.type.toLowerCase();
            if (sqlBase.includes('int') || sqlBase.includes('serial') || sqlBase.includes('float') || sqlBase.includes('numeric')) type = 'number';
            else if (sqlBase.includes('bool') || sqlBase.includes('bit')) type = 'boolean';
            else if (sqlBase.includes('date') || sqlBase.includes('time')) type = 'Date';
            else if (sqlBase.includes('json')) type = 'any'; // Record<string, any> could be better, keeping it simple
            
            code += `  ${c.name}${c.nullable ? '?' : ''}: ${type};\n`;
        });
        code += `}\n\n`;
    });

    return code;
}
