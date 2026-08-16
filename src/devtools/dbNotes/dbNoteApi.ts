import { apiOrigin, get, post } from '../../common/common';
import { DbNoteColumn, DbNoteProject, DbNoteTable } from './dbNote.types';

const BASE = '/api/tools/db-notes';

export async function fetchProjects(): Promise<DbNoteProject[]> {
    const res = await get(apiOrigin + `${BASE}/projects`);
    return res?.data ?? [];
}

export async function createProject(name: string) {
    return post(`${BASE}/projects`, { name });
}

export async function renameProject(projectId: number, name: string) {
    return post(`${BASE}/projects/${projectId}/update`, { name });
}

export async function deleteProject(projectId: number) {
    return post(`${BASE}/projects/${projectId}/delete`, {});
}

export async function fetchTables(projectId: number): Promise<DbNoteTable[]> {
    const res = await get(apiOrigin + `${BASE}/projects/${projectId}/tables`);
    return res?.data ?? [];
}

export async function createTable(projectId: number, name: string) {
    return post(`${BASE}/projects/${projectId}/tables`, { name });
}

export async function fetchTableDetail(tableId: number): Promise<{ table: DbNoteTable; columns: DbNoteColumn[] } | null> {
    const res = await get(apiOrigin + `${BASE}/tables/${tableId}`);
    return res?.data ?? null;
}

// Fetches the table/columns AND stamps last_generated_at server-side as a side effect - see
// dbNoteController.getGeneratedView. The returned `table.last_generated_at` is the PRE-touch
// value, so the caller can still diff columns' created_at against it for "what's new".
export async function fetchGeneratedView(tableId: number): Promise<{ table: DbNoteTable; columns: DbNoteColumn[] } | null> {
    const res = await get(apiOrigin + `${BASE}/tables/${tableId}/generated`);
    return res?.data ?? null;
}

export async function renameTable(tableId: number, name: string) {
    return post(`${BASE}/tables/${tableId}/update`, { name });
}

export async function deleteTable(tableId: number) {
    return post(`${BASE}/tables/${tableId}/delete`, {});
}

export interface ColumnFormValues {
    name: string;
    sql_type: string;
    length: string | null;
    nullable: boolean;
    is_primary_key: boolean;
    default_value: string | null;
    note: string | null;
}

export async function addColumn(tableId: number, column: ColumnFormValues) {
    return post(`${BASE}/tables/${tableId}/columns`, column);
}

export async function updateColumn(tableId: number, columnId: number, column: ColumnFormValues) {
    return post(`${BASE}/tables/${tableId}/columns/${columnId}/update`, column);
}

export async function moveColumn(tableId: number, columnId: number, direction: 'up' | 'down'): Promise<DbNoteColumn[] | undefined> {
    return post(`${BASE}/tables/${tableId}/columns/${columnId}/move?direction=${direction}`, {});
}

export async function deleteColumn(tableId: number, columnId: number) {
    return post(`${BASE}/tables/${tableId}/columns/${columnId}/delete`, {});
}
