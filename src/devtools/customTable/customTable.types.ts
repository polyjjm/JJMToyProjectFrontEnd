export type ColumnType = 'TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX' | 'SELECT';

export const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
    TEXT: '텍스트',
    NUMBER: '숫자',
    DATE: '날짜',
    CHECKBOX: '체크박스',
    SELECT: '선택',
};

export interface CustomTable {
    table_id: number;
    name: string;
    user_id: string;
    created_at: string;
}

export interface CustomTableColumn {
    column_id: number;
    table_id: number;
    name: string;
    type: ColumnType;
    // JSON-encoded string array (e.g. '["옵션1","옵션2"]') for SELECT columns, null otherwise -
    // see customTableColumnDTO.java. Parsed to string[] at the UI boundary (parseOptions below).
    options: string | null;
    sort_order: number;
}

export interface CustomTableRow {
    row_id: number;
    table_id: number;
    data: string; // JSON-encoded {"<column_id>": value, ...} - see customTableRowDTO.java
    sort_order: number;
    created_at: string;
}

// A row's data, parsed - keyed by column_id (numbers, since that's what the backend uses as
// the JSON key, even though JS object keys are always strings under the hood).
export type RowValues = Record<number, string | number | boolean | null>;

export function parseOptions(options: string | null): string[] {
    if (!options) return [];
    try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function parseRowValues(data: string): RowValues {
    try {
        return JSON.parse(data) || {};
    } catch {
        return {};
    }
}
