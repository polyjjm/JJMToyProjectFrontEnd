import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../common/ConfirmDialog';
import { COLORS } from '../../theme';
import { CustomTable } from './customTable.types';
import { createTable, deleteTable, fetchTables } from './customTableApi';

// 만능 테이블 (item 1) landing page - lists every table the user has created, each linking to
// its own grid view (CustomTableGrid.tsx). Table shape (name/owner) is fixed and relational -
// only row data inside a table is schema-less, see the 2026-08-18 migration.
export default function CustomTableList() {
    const navigate = useNavigate();
    const [tables, setTables] = useState<CustomTable[]>([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<CustomTable | null>(null);

    const load = async () => {
        setTables(await fetchTables());
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const ok = await createTable(newName.trim());
        if (ok) {
            setCreateOpen(false);
            setNewName('');
            load();
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteTable(deleteTarget.table_id);
        setDeleteTarget(null);
        if (ok) load();
    };

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 720, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.3px', mb: 0.5, color: COLORS.textPrimary }}>
                        만능 테이블
                    </Typography>
                    <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
                        컬럼을 자유롭게 만들어 쓰는 나만의 표입니다.
                    </Typography>
                </Box>
                <Button
                    onClick={() => setCreateOpen(true)}
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                    sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px', px: 2, '&:hover': { bgcolor: '#211F1B' } }}
                >
                    새 테이블
                </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {tables.length === 0 && (
                    <Typography sx={{ fontSize: 13, color: COLORS.textTertiary, textAlign: 'center', py: 4 }}>
                        아직 만든 테이블이 없습니다
                    </Typography>
                )}
                {tables.map((table) => (
                    <Box
                        key={table.table_id}
                        onClick={() => navigate(`/tools/table/${table.table_id}`)}
                        sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '14px 16px',
                            bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '10px', cursor: 'pointer',
                            '&:hover': { borderColor: COLORS.accent },
                        }}
                    >
                        <Box>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{table.name}</Typography>
                            <Typography sx={{ fontSize: 11.5, color: COLORS.textTertiary, mt: 0.25 }}>
                                {table.created_at?.slice(0, 10)} 생성
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteTarget(table); }} sx={{ color: COLORS.textTertiary }}>
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
            </Box>

            <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '92vw', sm: 380 }, bgcolor: COLORS.surface, borderRadius: '14px', p: 3, boxShadow: 24,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>새 테이블</Typography>
                        <IconButton size="small" onClick={() => setCreateOpen(false)}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                    <TextField
                        fullWidth size="small" label="테이블 이름" placeholder="예: 가계부"
                        value={newName} onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                        sx={{ mb: 2 }} autoFocus
                    />
                    <Button fullWidth onClick={handleCreate} sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px', py: 1.125, '&:hover': { bgcolor: '#211F1B' } }}>
                        만들기
                    </Button>
                </Box>
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                title={`'${deleteTarget?.name}' 테이블을 삭제하시겠습니까? 모든 행이 함께 삭제됩니다.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </Box>
    );
}
