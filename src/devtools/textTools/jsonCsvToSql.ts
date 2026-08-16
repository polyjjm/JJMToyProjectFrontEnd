import Papa from 'papaparse';

// JSON/CSV -> SQL INSERT (item 4) - quick ad-hoc use on arbitrary pasted data, not tied to a
// saved table definition (contrast DB 관리 노트's generator, which works from persisted columns
// and knows real SQL types - this one just quotes strings and leaves numbers/booleans bare).

function sqlLiteral(value: unknown): string {
    if (value === null || value === undefined || value === '') return 'NULL';
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return `'${String(value).replace(/'/g, "''")}'`;
}

export function parseJsonOrCsvRows(text: string, isCsv: boolean): Record<string, unknown>[] {
    if (isCsv) {
        const result = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
        return result.data as Record<string, unknown>[];
    }
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return [parsed];
    throw new Error('JSON 객체 또는 객체 배열이어야 합니다');
}

export function rowsToInsertStatements(rows: Record<string, unknown>[], tableName: string): string {
    if (!tableName.trim()) throw new Error('테이블 이름을 입력해주세요');
    if (rows.length === 0) return '-- 변환할 데이터가 없습니다';
    const columns = Object.keys(rows[0]);
    return rows
        .map((row) => `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map((c) => sqlLiteral(row[c])).join(', ')});`)
        .join('\n');
}
