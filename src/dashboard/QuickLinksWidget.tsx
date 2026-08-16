import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { apiOrigin, get, post } from '../common/common';
import ConfirmDialog from '../common/ConfirmDialog';
import { COLORS } from '../theme';

interface QuickLink {
    link_id: number;
    label: string;
    subtitle: string | null;
    url: string;
    icon: string;
    sort_no: number;
}

// Generic link icon (same glyph as this widget's own header icon) as an inline SVG data URI -
// used as the <img> fallback src on favicon load failure, not a separate element, so the
// onError swap below can follow the same "swap img.src" pattern as board.tsx's thumbnail
// fallback rather than switching to a different icon component.
const FALLBACK_ICON_SRC = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ADA79C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>'
)}`;

// Google's favicon service, keyed off the link's own hostname - no manual icon picker needed,
// the card just shows whatever favicon the site actually has. Falls back to the generic icon
// above (via the <img>'s onError, see the card render) if the URL is unparseable or the
// favicon fails to load.
function faviconUrl(linkUrl: string): string {
    try {
        const hostname = new URL(linkUrl).hostname;
        return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
    } catch {
        return FALLBACK_ICON_SRC;
    }
}

// Quick links widget for the dashboard (see dashboard-mockup.html) - fully table-backed/
// user-managed (unlike item 4's hardcoded dev-tools row), since these are arbitrary
// bookmarks the user curates themselves rather than fixed app features.
export default function QuickLinksWidget() {
    const [links, setLinks] = useState<QuickLink[]>([]);
    const [editing, setEditing] = useState<QuickLink | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [url, setUrl] = useState('');
    const [icon, setIcon] = useState('🔗');
    const [deleteTarget, setDeleteTarget] = useState<QuickLink | null>(null);

    const load = async () => {
        const result = await get(apiOrigin + '/api/dashboard/links');
        if (result?.data) setLinks(result.data);
    };

    useEffect(() => { load(); }, []);

    const openAddForm = () => {
        setEditing(null);
        setLabel(''); setSubtitle(''); setUrl(''); setIcon('🔗');
        setFormOpen(true);
    };

    const openEditForm = (link: QuickLink) => {
        setEditing(link);
        setLabel(link.label); setSubtitle(link.subtitle || ''); setUrl(link.url); setIcon(link.icon);
        setFormOpen(true);
    };

    const submitForm = async () => {
        if (!label.trim() || !url.trim()) return;
        const payload = { label: label.trim(), subtitle: subtitle.trim() || null, url: url.trim(), icon: icon.trim() || '🔗' };
        const ok = editing
            ? await post(`/api/dashboard/links/${editing.link_id}/update`, payload)
            : await post('/api/dashboard/links', payload);
        if (ok) {
            setFormOpen(false);
            load();
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const ok = await post(`/api/dashboard/links/${deleteTarget.link_id}/delete`, {});
        setDeleteTarget(null);
        if (ok) load();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '18px 22px 0' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.875, color: COLORS.textPrimary }}>
                    🔗 빠른 링크
                </Typography>
                <IconButton size="small" onClick={openAddForm} sx={{ color: COLORS.textTertiary }}>
                    <AddIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ p: '10px 22px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
                {links.length === 0 && (
                    <Typography sx={{ gridColumn: '1 / -1', fontSize: 12.5, color: COLORS.textTertiary, textAlign: 'center', py: 2 }}>
                        등록된 링크가 없습니다
                    </Typography>
                )}
                {links.map((link) => (
                    <Box
                        key={link.link_id}
                        sx={{
                            position: 'relative', display: 'flex', alignItems: 'center', gap: 1.25, p: 1.5,
                            border: `1px solid ${COLORS.border}`, borderRadius: '10px', cursor: 'pointer',
                            transition: 'border-color .15s, background .15s',
                            '&:hover': { borderColor: COLORS.accent, bgcolor: COLORS.accentSoft },
                        }}
                    >
                        <Box
                            onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0 }}
                        >
                            <Box sx={{
                                width: 34, height: 34, borderRadius: '9px', bgcolor: COLORS.accentSoft,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
                            }}>
                                <Box
                                    component="img"
                                    src={faviconUrl(link.url)}
                                    alt=""
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        if (img.src !== FALLBACK_ICON_SRC) img.src = FALLBACK_ICON_SRC;
                                    }}
                                    sx={{ width: 18, height: 18, objectFit: 'contain' }}
                                />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textPrimary }} noWrap>{link.label}</Typography>
                                {link.subtitle && (
                                    <Typography sx={{ fontSize: 10.5, color: COLORS.textTertiary, mt: '1px' }} noWrap>{link.subtitle}</Typography>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexShrink: 0 }}>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditForm(link); }} sx={{ p: 0.375, color: COLORS.textTertiary }}>
                                <Typography sx={{ fontSize: 12 }}>✎</Typography>
                            </IconButton>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteTarget(link); }} sx={{ p: 0.375, color: COLORS.textTertiary }}>
                                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Modal open={formOpen} onClose={() => setFormOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '92vw', sm: 380 }, bgcolor: COLORS.surface, borderRadius: '14px', p: 3, boxShadow: 24,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>
                            {editing ? '링크 수정' : '링크 추가'}
                        </Typography>
                        <IconButton size="small" onClick={() => setFormOpen(false)}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                        <TextField
                            label="아이콘" value={icon} onChange={(e) => setIcon(e.target.value)}
                            size="small" sx={{ width: 90 }} inputProps={{ maxLength: 4, style: { textAlign: 'center' } }}
                        />
                        <TextField fullWidth size="small" label="이름" value={label} onChange={(e) => setLabel(e.target.value)} />
                    </Box>
                    <TextField fullWidth size="small" label="설명 (선택)" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} sx={{ mb: 1.5 }} />
                    <TextField fullWidth size="small" label="URL" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} sx={{ mb: 2 }} />
                    <Button fullWidth onClick={submitForm} sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px', py: 1.125, '&:hover': { bgcolor: '#211F1B' } }}>
                        {editing ? '저장' : '추가'}
                    </Button>
                </Box>
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                title={`'${deleteTarget?.label}' 링크를 삭제하시겠습니까?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </Box>
    );
}
