import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { apiOrigin, get, post } from '../common/common';
import ConfirmDialog from '../common/ConfirmDialog';
import { COLORS } from '../theme';

interface MonitoredService {
    service_id: number;
    service_name: string;
    container_name: string | null;
    health_check_url: string | null;
    sort_no: number;
    enabled: boolean;
    last_status: 'UP' | 'DOWN' | null;
    last_checked_at: string | null;
}

function relativeTime(iso: string | null): string {
    if (!iso) return '확인 전';
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return '방금 전';
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
}

// Server status widget for the dashboard (see dashboard-mockup.html). Status here is an HTTP
// health check against each service's optional health_check_url, NOT real Docker container
// state - the backend has no confirmed access to the Docker socket (see
// MonitoredServiceHealthChecker.java's comment). A service with no health_check_url configured
// shows as "확인 안함" rather than a faked "up", and the summary line only counts services that
// actually have a check configured.
export default function ServerStatusWidget() {
    const [services, setServices] = useState<MonitoredService[]>([]);
    const [addOpen, setAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newContainer, setNewContainer] = useState('');
    const [newHealthUrl, setNewHealthUrl] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<MonitoredService | null>(null);

    const load = async () => {
        const result = await get(apiOrigin + '/api/dashboard/services');
        if (result?.data) setServices(result.data);
    };

    useEffect(() => {
        load();
        // Health checks run server-side every 60s (MonitoredServiceHealthChecker) - this just
        // re-fetches the widget's view of that so status dots don't need a manual page refresh.
        const id = setInterval(load, 30000);
        return () => clearInterval(id);
    }, []);

    const monitored = services.filter((s) => !!s.health_check_url);
    const upCount = monitored.filter((s) => s.last_status === 'UP').length;

    const addService = async () => {
        if (!newName.trim()) return;
        const ok = await post('/api/dashboard/services', {
            service_name: newName.trim(),
            container_name: newContainer.trim() || null,
            health_check_url: newHealthUrl.trim() || null,
        });
        if (ok) {
            setAddOpen(false);
            setNewName(''); setNewContainer(''); setNewHealthUrl('');
            load();
        }
    };

    const move = async (id: number, direction: 'up' | 'down') => {
        const result = await post(`/api/dashboard/services/${id}/move?direction=${direction}`, {});
        if (result) setServices(result);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const ok = await post(`/api/dashboard/services/${deleteTarget.service_id}/delete`, {});
        setDeleteTarget(null);
        if (ok) load();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '18px 22px 0' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.875, color: COLORS.textPrimary }}>
                    🖥️ 서버 상태
                </Typography>
                <IconButton size="small" onClick={() => setAddOpen(true)} sx={{ color: COLORS.textTertiary }}>
                    <AddIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ p: '6px 22px 20px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {services.length === 0 && (
                    <Typography sx={{ fontSize: 12.5, color: COLORS.textTertiary, textAlign: 'center', py: 2 }}>
                        등록된 서비스가 없습니다
                    </Typography>
                )}
                {services.map((service, i) => (
                    <Box key={service.service_id} sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, p: '10px 12px',
                        border: `1px solid ${COLORS.border}`, borderRadius: '10px',
                    }}>
                        <Box sx={{
                            width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                            bgcolor: service.last_status === 'UP' ? '#4C9A6A' : service.last_status === 'DOWN' ? '#B3403B' : COLORS.border,
                            boxShadow: service.last_status ? `0 0 0 3px ${service.last_status === 'UP' ? 'rgba(76,154,106,0.15)' : 'rgba(179,64,59,0.15)'}` : 'none',
                        }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }} noWrap>
                                {service.service_name}
                            </Typography>
                            {service.container_name && (
                                <Typography sx={{ fontSize: 10.5, color: COLORS.textTertiary }} noWrap>
                                    {service.container_name}
                                </Typography>
                            )}
                        </Box>
                        <Typography sx={{ fontSize: 11, color: COLORS.textTertiary, flexShrink: 0 }}>
                            {service.health_check_url ? relativeTime(service.last_checked_at) : '확인 안함'}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                            <IconButton size="small" disabled={i === 0} onClick={() => move(service.service_id, 'up')} sx={{ p: 0.25 }}>
                                <KeyboardArrowUpIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <IconButton size="small" disabled={i === services.length - 1} onClick={() => move(service.service_id, 'down')} sx={{ p: 0.25 }}>
                                <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Box>
                        <IconButton size="small" onClick={() => setDeleteTarget(service)} sx={{ color: COLORS.textTertiary, flexShrink: 0 }}>
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>
                ))}
            </Box>

            {monitored.length > 0 && (
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: '22px', py: '10px 22px 16px',
                    fontSize: 11.5, color: COLORS.textTertiary, borderTop: `1px solid ${COLORS.border}`, mt: 0.5,
                }}>
                    {upCount === monitored.length ? '🟢' : '🟠'}
                    <Box component="b" sx={{ color: COLORS.textPrimary }}>{upCount}/{monitored.length}</Box> 정상
                </Box>
            )}

            <Modal open={addOpen} onClose={() => setAddOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '92vw', sm: 380 }, bgcolor: COLORS.surface, borderRadius: '14px', p: 3, boxShadow: 24,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>서비스 추가</Typography>
                        <IconButton size="small" onClick={() => setAddOpen(false)}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                    <TextField fullWidth size="small" label="이름" value={newName} onChange={(e) => setNewName(e.target.value)} sx={{ mb: 1.5 }} />
                    <TextField fullWidth size="small" label="컨테이너 이름 (표시용, 선택)" value={newContainer} onChange={(e) => setNewContainer(e.target.value)} sx={{ mb: 1.5 }} />
                    <TextField
                        fullWidth size="small" label="헬스체크 URL (선택)" placeholder="https://..."
                        value={newHealthUrl} onChange={(e) => setNewHealthUrl(e.target.value)} sx={{ mb: 0.5 }}
                    />
                    <Typography sx={{ fontSize: 11, color: COLORS.textTertiary, mb: 2 }}>
                        비워두면 "확인 안함"으로 표시되고 상태를 자동으로 확인하지 않습니다.
                    </Typography>
                    <Button fullWidth onClick={addService} sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px', py: 1.125, '&:hover': { bgcolor: '#211F1B' } }}>
                        추가
                    </Button>
                </Box>
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                title={`'${deleteTarget?.service_name}' 서비스를 삭제하시겠습니까?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </Box>
    );
}
