import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../common/ConfirmDialog';
import { COLORS } from '../../theme';
import { DbNoteProject, DbNoteTable } from './dbNote.types';
import { createProject, createTable, deleteProject, deleteTable, fetchProjects, fetchTables } from './dbNoteApi';

// DB 관리 노트 (item 3) landing page - projects group table definitions (see the 2026-08-18
// migration). Not a live DB client: nothing here connects to or queries a real database, it's
// just tracking "what does this table look like" so code generation (CustomTableGrid's sibling
// tool, DbNoteTableEditor.tsx) has something to work from.
export default function DbNoteProjects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<DbNoteProject[]>([]);
    const [tablesByProject, setTablesByProject] = useState<Record<number, DbNoteTable[]>>({});
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const [projectModalOpen, setProjectModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [tableModalProject, setTableModalProject] = useState<DbNoteProject | null>(null);
    const [newTableName, setNewTableName] = useState('');
    const [deleteProjectTarget, setDeleteProjectTarget] = useState<DbNoteProject | null>(null);
    const [deleteTableTarget, setDeleteTableTarget] = useState<DbNoteTable | null>(null);

    const loadProjects = async () => {
        setProjects(await fetchProjects());
    };

    useEffect(() => { loadProjects(); }, []);

    const loadTablesFor = async (projectId: number) => {
        const tables = await fetchTables(projectId);
        setTablesByProject((prev) => ({ ...prev, [projectId]: tables }));
    };

    const toggleExpand = (project: DbNoteProject) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(project.project_id)) {
                next.delete(project.project_id);
            } else {
                next.add(project.project_id);
                if (!tablesByProject[project.project_id]) loadTablesFor(project.project_id);
            }
            return next;
        });
    };

    const submitNewProject = async () => {
        if (!newProjectName.trim()) return;
        const ok = await createProject(newProjectName.trim());
        if (ok) {
            setProjectModalOpen(false);
            setNewProjectName('');
            loadProjects();
        }
    };

    const submitNewTable = async () => {
        if (!tableModalProject || !newTableName.trim()) return;
        const ok = await createTable(tableModalProject.project_id, newTableName.trim());
        if (ok) {
            const projectId = tableModalProject.project_id;
            setTableModalProject(null);
            setNewTableName('');
            loadTablesFor(projectId);
        }
    };

    const confirmDeleteProject = async () => {
        if (!deleteProjectTarget) return;
        const ok = await deleteProject(deleteProjectTarget.project_id);
        setDeleteProjectTarget(null);
        if (ok) loadProjects();
    };

    const confirmDeleteTable = async () => {
        if (!deleteTableTarget) return;
        const ok = await deleteTable(deleteTableTarget.table_id);
        setDeleteTableTarget(null);
        if (ok) loadTablesFor(deleteTableTarget.project_id);
    };

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 720, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.3px', mb: 0.5, color: COLORS.textPrimary }}>
                        DB 관리 노트
                    </Typography>
                    <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
                        테이블 구조를 기록하고 코드를 생성합니다. 실제 DB에 연결하지 않습니다.
                    </Typography>
                </Box>
                <Button
                    onClick={() => setProjectModalOpen(true)}
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                    sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px', px: 2, '&:hover': { bgcolor: '#211F1B' } }}
                >
                    새 프로젝트
                </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {projects.length === 0 && (
                    <Typography sx={{ fontSize: 13, color: COLORS.textTertiary, textAlign: 'center', py: 4 }}>
                        아직 만든 프로젝트가 없습니다
                    </Typography>
                )}
                {projects.map((project) => {
                    const isOpen = expanded.has(project.project_id);
                    const tables = tablesByProject[project.project_id] || [];
                    return (
                        <Box key={project.project_id} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                            <Box
                                onClick={() => toggleExpand(project)}
                                sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '12px 14px',
                                    bgcolor: COLORS.surface, cursor: 'pointer', '&:hover': { bgcolor: COLORS.bg },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    {isOpen ? <ExpandMoreIcon sx={{ fontSize: 18, color: COLORS.textTertiary }} /> : <ChevronRightIcon sx={{ fontSize: 18, color: COLORS.textTertiary }} />}
                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{project.name}</Typography>
                                </Box>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteProjectTarget(project); }} sx={{ color: COLORS.textTertiary }}>
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            {isOpen && (
                                <Box sx={{ p: '4px 14px 12px 40px', bgcolor: COLORS.bg, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {tables.map((table) => (
                                        <Box
                                            key={table.table_id}
                                            onClick={() => navigate(`/tools/db-notes/${table.table_id}`)}
                                            sx={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '8px 10px',
                                                bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '8px', cursor: 'pointer',
                                                '&:hover': { borderColor: COLORS.accent },
                                            }}
                                        >
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: COLORS.textPrimary }}>{table.name}</Typography>
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteTableTarget(table); }} sx={{ p: 0.25, color: COLORS.textTertiary }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Box
                                        onClick={() => setTableModalProject(project)}
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 0.5, p: '8px 10px', mt: 0.25,
                                            color: COLORS.accent, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                                        }}
                                    >
                                        <AddIcon sx={{ fontSize: 15 }} /> 테이블 추가
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>

            <Modal open={projectModalOpen} onClose={() => setProjectModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '92vw', sm: 380 }, bgcolor: COLORS.surface, borderRadius: '14px', p: 3, boxShadow: 24,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>새 프로젝트</Typography>
                        <IconButton size="small" onClick={() => setProjectModalOpen(false)}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                    <TextField
                        fullWidth size="small" label="프로젝트 이름" placeholder="예: JJMToyProject"
                        value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') submitNewProject(); }}
                        sx={{ mb: 2 }} autoFocus
                    />
                    <Button fullWidth onClick={submitNewProject} sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px', py: 1.125, '&:hover': { bgcolor: '#211F1B' } }}>
                        만들기
                    </Button>
                </Box>
            </Modal>

            <Modal open={!!tableModalProject} onClose={() => setTableModalProject(null)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '92vw', sm: 380 }, bgcolor: COLORS.surface, borderRadius: '14px', p: 3, boxShadow: 24,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>새 테이블</Typography>
                        <IconButton size="small" onClick={() => setTableModalProject(null)}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                    <TextField
                        fullWidth size="small" label="테이블 이름" placeholder="예: board"
                        value={newTableName} onChange={(e) => setNewTableName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') submitNewTable(); }}
                        sx={{ mb: 2 }} autoFocus
                    />
                    <Button fullWidth onClick={submitNewTable} sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px', py: 1.125, '&:hover': { bgcolor: '#211F1B' } }}>
                        만들기
                    </Button>
                </Box>
            </Modal>

            <ConfirmDialog
                open={!!deleteProjectTarget}
                title={`'${deleteProjectTarget?.name}' 프로젝트를 삭제하시겠습니까? 포함된 모든 테이블 정의가 함께 삭제됩니다.`}
                onConfirm={confirmDeleteProject}
                onCancel={() => setDeleteProjectTarget(null)}
            />
            <ConfirmDialog
                open={!!deleteTableTarget}
                title={`'${deleteTableTarget?.name}' 테이블 정의를 삭제하시겠습니까?`}
                onConfirm={confirmDeleteTable}
                onCancel={() => setDeleteTableTarget(null)}
            />
        </Box>
    );
}
