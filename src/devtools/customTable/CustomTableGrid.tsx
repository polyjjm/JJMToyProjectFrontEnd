import { useEffect, useState } from 'react';
import { Box, Button, IconButton, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../../common/ConfirmDialog';
import { COLORS } from '../../theme';
import {
    COLUMN_TYPE_LABELS, ColumnType, CustomTable, CustomTableColumn, RowValues,
    parseOptions, parseRowValues,
} from './customTable.types';
import {
    addColumn, addRow, deleteColumn, deleteRow, fetchRows, fetchTableDetail,
    moveColumn, updateColumn, updateRow,
} from './customTableApi';

interface GridRow {
    row_id: number;
    values: RowValues;
}

const CELL_WIDTH = 160;

// Single-table grid view - the spreadsheet-like editor for one 만능 테이블. Deliberately one
// table per page (no cross-table relations/lookups in this pass, per the task's scope call).
export default function CustomTableGrid() {
    const { tableId } = useParams();
    const id = Number(tableId);
    const navigate = useNavigate();

    const [table, setTable] = useState<CustomTable | null>(null);
    const [columns, setColumns] = useState<CustomTableColumn[]>([]);
    const [rows, setRows] = useState<GridRow[]>([]);

    const [columnModalOpen, setColumnModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<CustomTableColumn | null>(null);
    const [colName, setColName] = useState('');
    const [colType, setColType] = useState<ColumnType>('TEXT');
    const [colOptionsText, setColOptionsText] = useState('');
    const [deleteColumnTarget, setDeleteColumnTarget] = useState<CustomTableColumn | null>(null);
    const [deleteRowTarget, setDeleteRowTarget] = useState<GridRow | null>(null);

    const load = async () => {
        const detail = await fetchTableDetail(id);
        if (detail) {
            setTable(detail.table);
            setColumns(detail.columns);
        }
        const rawRows = await fetchRows(id);
        setRows(rawRows.map((r) => ({ row_id: r.row_id, values: parseRowValues(r.data) })));
    };

    useEffect(() => { load(); }, [id]);

    const openAddColumn = () => {
        setEditingColumn(null);
        setColName(''); setColType('TEXT'); setColOptionsText('');
        setColumnModalOpen(true);
    };

    const openEditColumn = (column: CustomTableColumn) => {
        setEditingColumn(column);
        setColName(column.name); setColType(column.type);
        setColOptionsText(parseOptions(column.options).join('\n'));
        setColumnModalOpen(true);
    };

    const submitColumn = async () => {
        if (!colName.trim()) return;
        const options = colType === 'SELECT'
            ? JSON.stringify(colOptionsText.split('\n').map((s) => s.trim()).filter(Boolean))
            : null;
        const ok = editingColumn
            ? await updateColumn(id, editingColumn.column_id, colName.trim(), colType, options)
            : await addColumn(id, colName.trim(), colType, options);
        if (ok) {
            setColumnModalOpen(false);
            load();
        }
    };

    const handleMoveColumn = async (columnId: number, direction: 'up' | 'down') => {
        const updated = await moveColumn(id, columnId, direction);
        if (updated) setColumns(updated);
    };

    const confirmDeleteColumn = async () => {
        if (!deleteColumnTarget) return;
        const ok = await deleteColumn(id, deleteColumnTarget.column_id);
        setDeleteColumnTarget(null);
        if (ok) load();
    };

    const handleAddRow = async () => {
        const ok = await addRow(id, JSON.stringify({}));
        if (ok) load();
    };

    const handleCellChange = (row: GridRow, columnId: number, value: string | number | boolean | null) => {
        const nextValues = { ...row.values, [columnId]: value };
        setRows((prev) => prev.map((r) => r.row_id === row.row_id ? { ...r, values: nextValues } : r));
        updateRow(id, row.row_id, JSON.stringify(nextValues));
    };

    const confirmDeleteRow = async () => {
        if (!deleteRowTarget) return;
        const ok = await deleteRow(id, deleteRowTarget.row_id);
        setDeleteRowTarget(null);
        if (ok) load();
    };

    const cellSx = { border: `1px solid ${COLORS.border}`, p: '6px 8px', minWidth: CELL_WIDTH, fontSize: 12.5 };

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <IconButton size="small" onClick={() => navigate('/tools/table')} sx={{ color: COLORS.textTertiary }}>
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: COLORS.textPrimary }}>
                    {table?.name || '...'}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, ml: 5 }}>
                <Button
                    size="small" onClick={openAddColumn} startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                    sx={{ bgcolor: COLORS.accentSoft, color: COLORS.accent, borderRadius: '8px', fontSize: 12, '&:hover': { bgcolor: COLORS.accentSoft } }}
                >
                    컬럼 추가
                </Button>
                <Button
                    size="small" onClick={handleAddRow} startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                    sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '8px', fontSize: 12, '&:hover': { bgcolor: '#211F1B' } }}
                >
                    행 추가
                </Button>
            </Box>

            <Box sx={{ overflowX: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: '10px' }}>
                <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%' }}>
                    <Box component="thead">
                        <Box component="tr" sx={{ bgcolor: COLORS.bg }}>
                            {columns.map((column, i) => (
                                <Box component="th" key={column.column_id} sx={{ ...cellSx, textAlign: 'left', verticalAlign: 'top' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                                        <Box onClick={() => openEditColumn(column)} sx={{ cursor: 'pointer', minWidth: 0 }}>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textPrimary }} noWrap>{column.name}</Typography>
                                            <Typography sx={{ fontSize: 10, color: COLORS.textTertiary }}>{COLUMN_TYPE_LABELS[column.type]}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexShrink: 0 }}>
                                            <IconButton size="small" disabled={i === 0} onClick={() => handleMoveColumn(column.column_id, 'up')} sx={{ p: 0.125 }}>
                                                <KeyboardArrowUpIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                            <IconButton size="small" disabled={i === columns.length - 1} onClick={() => handleMoveColumn(column.column_id, 'down')} sx={{ p: 0.125 }}>
                                                <KeyboardArrowDownIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => setDeleteColumnTarget(column)} sx={{ p: 0.125, color: COLORS.textTertiary }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                            <Box component="th" sx={{ ...cellSx, minWidth: 40 }} />
                        </Box>
                    </Box>
                    <Box component="tbody">
                        {rows.map((row) => (
                            <Box component="tr" key={row.row_id}>
                                {columns.map((column) => {
                                    const value = row.values[column.column_id];
                                    return (
                                        <Box component="td" key={column.column_id} sx={cellSx}>
                                            {column.type === 'TEXT' && (
                                                <Box
                                                    component="input" defaultValue={(value as string) ?? ''}
                                                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleCellChange(row, column.column_id, e.target.value)}
                                                    sx={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', fontSize: 12.5, bgcolor: 'transparent' }}
                                                />
                                            )}
                                            {column.type === 'NUMBER' && (
                                                <Box
                                                    component="input" type="number" defaultValue={(value as number) ?? ''}
                                                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleCellChange(row, column.column_id, e.target.value === '' ? null : Number(e.target.value))}
                                                    sx={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', fontSize: 12.5, bgcolor: 'transparent' }}
                                                />
                                            )}
                                            {column.type === 'DATE' && (
                                                <Box
                                                    component="input" type="date" defaultValue={(value as string) ?? ''}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCellChange(row, column.column_id, e.target.value)}
                                                    sx={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', fontSize: 12.5, bgcolor: 'transparent' }}
                                                />
                                            )}
                                            {column.type === 'CHECKBOX' && (
                                                <Box
                                                    component="input" type="checkbox" checked={!!value}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCellChange(row, column.column_id, e.target.checked)}
                                                />
                                            )}
                                            {column.type === 'SELECT' && (
                                                <Select
                                                    variant="standard" disableUnderline fullWidth
                                                    value={(value as string) ?? ''}
                                                    onChange={(e) => handleCellChange(row, column.column_id, e.target.value)}
                                                    sx={{ fontSize: 12.5 }}
                                                >
                                                    <MenuItem value=""><em>-</em></MenuItem>
                                                    {parseOptions(column.options).map((opt) => (
                                                        <MenuItem key={opt} value={opt} sx={{ fontSize: 12.5 }}>{opt}</MenuItem>
                                                    ))}
                                                </Select>
                                            )}
                                        </Box>
                                    );
                                })}
                                <Box component="td" sx={{ ...cellSx, minWidth: 40, textAlign: 'center' }}>
                                    <IconButton size="small" onClick={() => setDeleteRowTarget(row)} sx={{ color: COLORS.textTertiary }}>
                                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                        {rows.length === 0 && (
                            <Box component="tr">
                                <Box component="td" colSpan={columns.length + 1} sx={{ ...cellSx, textAlign: 'center', color: COLORS.textTertiary }}>
                                    행이 없습니다
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            <Modal open={columnModalOpen} onClose={() => setColumnModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '92vw', sm: 380 }, bgcolor: COLORS.surface, borderRadius: '14px', p: 3, boxShadow: 24,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>
                            {editingColumn ? '컬럼 수정' : '컬럼 추가'}
                        </Typography>
                        <IconButton size="small" onClick={() => setColumnModalOpen(false)}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                    <TextField fullWidth size="small" label="컬럼 이름" value={colName} onChange={(e) => setColName(e.target.value)} sx={{ mb: 1.5 }} autoFocus />
                    <Select
                        fullWidth size="small" value={colType}
                        onChange={(e) => setColType(e.target.value as ColumnType)}
                        sx={{ mb: 1.5, fontSize: 13 }}
                    >
                        {(Object.keys(COLUMN_TYPE_LABELS) as ColumnType[]).map((t) => (
                            <MenuItem key={t} value={t}>{COLUMN_TYPE_LABELS[t]}</MenuItem>
                        ))}
                    </Select>
                    {colType === 'SELECT' && (
                        <TextField
                            fullWidth multiline minRows={3} size="small" label="옵션 (줄바꿈으로 구분)"
                            value={colOptionsText} onChange={(e) => setColOptionsText(e.target.value)}
                            sx={{ mb: 1.5 }}
                        />
                    )}
                    <Button fullWidth onClick={submitColumn} sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px', py: 1.125, '&:hover': { bgcolor: '#211F1B' } }}>
                        {editingColumn ? '저장' : '추가'}
                    </Button>
                </Box>
            </Modal>

            <ConfirmDialog
                open={!!deleteColumnTarget}
                title={`'${deleteColumnTarget?.name}' 컬럼을 삭제하시겠습니까? 모든 행의 이 값이 함께 삭제됩니다.`}
                onConfirm={confirmDeleteColumn}
                onCancel={() => setDeleteColumnTarget(null)}
            />
            <ConfirmDialog
                open={!!deleteRowTarget}
                title="이 행을 삭제하시겠습니까?"
                onConfirm={confirmDeleteRow}
                onCancel={() => setDeleteRowTarget(null)}
            />
        </Box>
    );
}
