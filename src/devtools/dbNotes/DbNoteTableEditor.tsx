import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, IconButton, Modal, Select, MenuItem, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../../common/ConfirmDialog';
import { COLORS } from '../../theme';
import { DbNoteColumn, DbNoteTable, SQL_TYPES } from './dbNote.types';
import {
    ColumnFormValues, addColumn, deleteColumn, fetchGeneratedView, fetchTableDetail,
    moveColumn, updateColumn,
} from './dbNoteApi';
import {
    generateAlterTable, generateCreateTable, generateJavaDto, generateMyBatisMapper, generateSampleInsert,
} from './codeGenerators';

type Tab = 'columns' | 'generate';

const emptyForm: ColumnFormValues = {
    name: '', sql_type: 'VARCHAR', length: null, nullable: true, is_primary_key: false, default_value: null, note: null,
};

function download(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Read-only output block with copy/download - reused for all 5 generated artifacts below.
function OutputBlock({ title, filename, content }: { title: string; filename: string; content: string }) {
    return (
        <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{title}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => navigator.clipboard.writeText(content)} sx={{ color: COLORS.textTertiary }}>
                        <ContentCopyIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => download(filename, content)} sx={{ color: COLORS.textTertiary }}>
                        <DownloadIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                </Box>
            </Box>
            <Box component="pre" sx={{
                m: 0, p: 1.5, bgcolor: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px',
                fontSize: 11.5, fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, monospace',
                overflowX: 'auto', whiteSpace: 'pre', color: COLORS.textPrimary,
            }}>
                {content}
            </Box>
        </Box>
    );
}

export default function DbNoteTableEditor() {
    const { tableId } = useParams();
    const id = Number(tableId);
    const navigate = useNavigate();

    const [table, setTable] = useState<DbNoteTable | null>(null);
    const [columns, setColumns] = useState<DbNoteColumn[]>([]);
    const [tab, setTab] = useState<Tab>('columns');

    const [generated, setGenerated] = useState<{ table: DbNoteTable; columns: DbNoteColumn[] } | null>(null);

    const [columnModalOpen, setColumnModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<DbNoteColumn | null>(null);
    const [form, setForm] = useState<ColumnFormValues>(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState<DbNoteColumn | null>(null);

    const load = async () => {
        const detail = await fetchTableDetail(id);
        if (detail) {
            setTable(detail.table);
            setColumns(detail.columns);
        }
    };

    useEffect(() => { load(); }, [id]);

    // Fetching the generated view stamps last_generated_at server-side (see dbNoteApi.ts) -
    // only do it once per page visit, when the user actually opens this tab, not eagerly on
    // mount (editing columns shouldn't silently consume the "what's new" diff).
    const openGenerateTab = async () => {
        setTab('generate');
        if (!generated) {
            const view = await fetchGeneratedView(id);
            if (view) setGenerated(view);
        }
    };

    const openAddColumn = () => {
        setEditingColumn(null);
        setForm(emptyForm);
        setColumnModalOpen(true);
    };

    const openEditColumn = (column: DbNoteColumn) => {
        setEditingColumn(column);
        setForm({
            name: column.name, sql_type: column.sql_type, length: column.length,
            nullable: column.nullable, is_primary_key: column.is_primary_key,
            default_value: column.default_value, note: column.note,
        });
        setColumnModalOpen(true);
    };

    const submitColumn = async () => {
        if (!form.name.trim() || !form.sql_type.trim()) return;
        const ok = editingColumn
            ? await updateColumn(id, editingColumn.column_id, form)
            : await addColumn(id, form);
        if (ok) {
            setColumnModalOpen(false);
            load();
        }
    };

    const handleMove = async (columnId: number, direction: 'up' | 'down') => {
        const updated = await moveColumn(id, columnId, direction);
        if (updated) setColumns(updated);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteColumn(id, deleteTarget.column_id);
        setDeleteTarget(null);
        if (ok) load();
    };

    const newColumns = generated
        ? generated.columns.filter((c) => !generated.table.last_generated_at || new Date(c.created_at) > new Date(generated.table.last_generated_at))
        : [];

    const cellSx = { border: `1px solid ${COLORS.border}`, p: '6px 8px', fontSize: 12 };

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 860, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <IconButton size="small" onClick={() => navigate('/tools/db-notes')} sx={{ color: COLORS.textTertiary }}>
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: COLORS.textPrimary }}>{table?.name || '...'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.75, mb: 2.5 }}>
                {([['columns', '컬럼 관리'], ['generate', '코드 생성']] as [Tab, string][]).map(([value, label]) => (
                    <Box
                        key={value}
                        onClick={() => value === 'generate' ? openGenerateTab() : setTab(value)}
                        sx={{
                            px: 1.75, py: 0.75, borderRadius: '999px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                            bgcolor: tab === value ? COLORS.accent : COLORS.bg,
                            color: tab === value ? '#fff' : COLORS.textSecondary,
                            border: `1px solid ${tab === value ? COLORS.accent : COLORS.border}`,
                        }}
                    >
                        {label}
                    </Box>
                ))}
            </Box>

            {tab === 'columns' && (
                <>
                    <Button
                        size="small" onClick={openAddColumn} startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                        sx={{ mb: 1.5, bgcolor: COLORS.accent, color: '#fff', borderRadius: '8px', fontSize: 12, '&:hover': { bgcolor: '#211F1B' } }}
                    >
                        컬럼 추가
                    </Button>

                    <Box sx={{ overflowX: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: '10px' }}>
                        <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%' }}>
                            <Box component="thead">
                                <Box component="tr" sx={{ bgcolor: COLORS.bg }}>
                                    {['이름', '타입', '길이', 'NULL', 'PK', '기본값', '메모', ''].map((h) => (
                                        <Box component="th" key={h} sx={{ ...cellSx, textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>{h}</Box>
                                    ))}
                                </Box>
                            </Box>
                            <Box component="tbody">
                                {columns.map((column, i) => (
                                    <Box component="tr" key={column.column_id}>
                                        <Box component="td" onClick={() => openEditColumn(column)} sx={{ ...cellSx, cursor: 'pointer', fontWeight: 600, color: COLORS.textPrimary }}>{column.name}</Box>
                                        <Box component="td" sx={cellSx}>{column.sql_type}</Box>
                                        <Box component="td" sx={cellSx}>{column.length || '-'}</Box>
                                        <Box component="td" sx={cellSx}>{column.nullable ? 'Y' : 'N'}</Box>
                                        <Box component="td" sx={cellSx}>{column.is_primary_key ? 'PK' : ''}</Box>
                                        <Box component="td" sx={cellSx}>{column.default_value || '-'}</Box>
                                        <Box component="td" sx={{ ...cellSx, color: COLORS.textTertiary }}>{column.note || ''}</Box>
                                        <Box component="td" sx={{ ...cellSx, whiteSpace: 'nowrap' }}>
                                            <IconButton size="small" disabled={i === 0} onClick={() => handleMove(column.column_id, 'up')} sx={{ p: 0.125 }}>
                                                <KeyboardArrowUpIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                            <IconButton size="small" disabled={i === columns.length - 1} onClick={() => handleMove(column.column_id, 'down')} sx={{ p: 0.125 }}>
                                                <KeyboardArrowDownIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => setDeleteTarget(column)} sx={{ p: 0.125, color: COLORS.textTertiary }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}
                                {columns.length === 0 && (
                                    <Box component="tr">
                                        <Box component="td" colSpan={8} sx={{ ...cellSx, textAlign: 'center', color: COLORS.textTertiary }}>컬럼이 없습니다</Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </>
            )}

            {tab === 'generate' && (
                <Box>
                    {newColumns.length > 0 && (
                        <Typography sx={{ fontSize: 12, color: COLORS.accent, mb: 2, fontWeight: 600 }}>
                            마지막 생성 이후 {newColumns.length}개 컬럼이 추가되었습니다 (ALTER TABLE 참고)
                        </Typography>
                    )}
                    <OutputBlock title="CREATE TABLE" filename={`${table?.name}_create.sql`} content={generateCreateTable(table?.name || '', columns)} />
                    <OutputBlock title="ALTER TABLE (마지막 생성 이후 추가된 컬럼)" filename={`${table?.name}_alter.sql`} content={generateAlterTable(table?.name || '', newColumns)} />
                    <OutputBlock title="샘플 INSERT" filename={`${table?.name}_insert.sql`} content={generateSampleInsert(table?.name || '', columns)} />
                    <OutputBlock title="Java DTO" filename={`${table?.name}DTO.java`} content={generateJavaDto(table?.name || '', columns)} />
                    <OutputBlock title="MyBatis Mapper XML" filename={`${table?.name}Mapper.xml`} content={generateMyBatisMapper(table?.name || '', columns)} />
                </Box>
            )}

            <Modal open={columnModalOpen} onClose={() => setColumnModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '92vw', sm: 420 }, maxHeight: '85vh', overflowY: 'auto',
                    bgcolor: COLORS.surface, borderRadius: '14px', p: 3, boxShadow: 24,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>
                            {editingColumn ? '컬럼 수정' : '컬럼 추가'}
                        </Typography>
                        <IconButton size="small" onClick={() => setColumnModalOpen(false)}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                    <TextField fullWidth size="small" label="컬럼 이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ mb: 1.5 }} autoFocus />
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                        <Select
                            size="small" value={form.sql_type}
                            onChange={(e) => setForm({ ...form, sql_type: e.target.value })}
                            sx={{ flex: 1, fontSize: 13 }}
                        >
                            {SQL_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                        <TextField
                            size="small" label="길이" placeholder="예: 100 또는 10,2" sx={{ width: 140 }}
                            value={form.length || ''} onChange={(e) => setForm({ ...form, length: e.target.value || null })}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox size="small" checked={form.nullable} onChange={(e) => setForm({ ...form, nullable: e.target.checked })} />
                            <Typography sx={{ fontSize: 12.5 }}>NULL 허용</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox size="small" checked={form.is_primary_key} onChange={(e) => setForm({ ...form, is_primary_key: e.target.checked })} />
                            <Typography sx={{ fontSize: 12.5 }}>기본키</Typography>
                        </Box>
                    </Box>
                    <TextField
                        fullWidth size="small" label="기본값 (선택)" value={form.default_value || ''}
                        onChange={(e) => setForm({ ...form, default_value: e.target.value || null })} sx={{ mb: 1.5 }}
                    />
                    <TextField
                        fullWidth size="small" label="메모 (선택)" value={form.note || ''}
                        onChange={(e) => setForm({ ...form, note: e.target.value || null })} sx={{ mb: 2 }}
                    />
                    <Button fullWidth onClick={submitColumn} sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px', py: 1.125, '&:hover': { bgcolor: '#211F1B' } }}>
                        {editingColumn ? '저장' : '추가'}
                    </Button>
                </Box>
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                title={`'${deleteTarget?.name}' 컬럼을 삭제하시겠습니까?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </Box>
    );
}
