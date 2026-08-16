import { apiOrigin, get, post } from '../../common/common';
import { ColumnType, CustomTable, CustomTableColumn, CustomTableRow } from './customTable.types';

const BASE = '/api/tools/tables';

export async function fetchTables(): Promise<CustomTable[]> {
    const res = await get(apiOrigin + BASE);
    return res?.data ?? [];
}

export async function createTable(name: string) {
    return post(BASE, { name });
}

export async function renameTable(tableId: number, name: string) {
    return post(`${BASE}/${tableId}/update`, { name });
}

export async function deleteTable(tableId: number) {
    return post(`${BASE}/${tableId}/delete`, {});
}

export async function fetchTableDetail(tableId: number): Promise<{ table: CustomTable; columns: CustomTableColumn[] } | null> {
    const res = await get(apiOrigin + `${BASE}/${tableId}`);
    return res?.data ?? null;
}

export async function addColumn(tableId: number, name: string, type: ColumnType, options: string | null) {
    return post(`${BASE}/${tableId}/columns`, { name, type, options });
}

export async function updateColumn(tableId: number, columnId: number, name: string, type: ColumnType, options: string | null) {
    return post(`${BASE}/${tableId}/columns/${columnId}/update`, { name, type, options });
}

export async function moveColumn(tableId: number, columnId: number, direction: 'up' | 'down'): Promise<CustomTableColumn[] | undefined> {
    return post(`${BASE}/${tableId}/columns/${columnId}/move?direction=${direction}`, {});
}

export async function deleteColumn(tableId: number, columnId: number) {
    return post(`${BASE}/${tableId}/columns/${columnId}/delete`, {});
}

export async function fetchRows(tableId: number): Promise<CustomTableRow[]> {
    const res = await get(apiOrigin + `${BASE}/${tableId}/rows`);
    return res?.data ?? [];
}

export async function addRow(tableId: number, data: string) {
    return post(`${BASE}/${tableId}/rows`, { data, sort_order: 0 });
}

export async function updateRow(tableId: number, rowId: number, data: string) {
    return post(`${BASE}/${tableId}/rows/${rowId}/update`, { data });
}

export async function deleteRow(tableId: number, rowId: number) {
    return post(`${BASE}/${tableId}/rows/${rowId}/delete`, {});
}
