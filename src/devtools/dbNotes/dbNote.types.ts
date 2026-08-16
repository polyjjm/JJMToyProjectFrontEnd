export interface DbNoteProject {
    project_id: number;
    name: string;
    created_at: string;
}

export interface DbNoteTable {
    table_id: number;
    project_id: number;
    name: string;
    last_generated_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbNoteColumn {
    column_id: number;
    table_id: number;
    name: string;
    sql_type: string;
    length: string | null;
    nullable: boolean;
    is_primary_key: boolean;
    default_value: string | null;
    note: string | null;
    sort_order: number;
    created_at: string;
}

// Common SQL types offered in the column editor - free text is still allowed (sql_type is a
// plain string column), this is just a convenience list covering what comes up most often.
export const SQL_TYPES = [
    'VARCHAR', 'TEXT', 'INT', 'BIGINT', 'DECIMAL', 'BOOLEAN',
    'DATE', 'DATETIME', 'TIMESTAMP', 'JSON', 'ENUM',
];
