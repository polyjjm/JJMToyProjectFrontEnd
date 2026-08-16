import { Box, CircularProgress, Dialog, Typography } from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { COLORS } from "../theme";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    // Optional one-line muted subtext under the title - none of the current call sites pass
    // this (they fold everything into `title`, e.g. "'X' 삭제하시겠습니까? 행도 함께
    // 삭제됩니다."), so omitting it just renders the title alone, same as before.
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    // Picks the icon badge glyph only - both variants use the same accentSoft/accent color
    // treatment (not a red "danger" scheme), to stay consistent with the rest of the app's
    // muted Cloud Dancer palette rather than introducing a one-off warning color here.
    variant?: 'delete' | 'edit';
    // While true: confirm button shows a spinner + loadingText (same pattern as
    // LoadingButton.tsx), both buttons disable, and backdrop/Escape dismissal is blocked - for
    // an async confirm action (e.g. boardDetail.tsx's board delete) that shouldn't be
    // interruptible mid-flight. Omit for instant/synchronous confirms.
    loading?: boolean;
    loadingText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const VARIANT_ICONS = {
    delete: DeleteOutlineIcon,
    edit: EditOutlinedIcon,
};

// Reusable confirmation dialog, styled to match the site's card/button language (rounded
// corners, accent icon badge, accent-filled confirm button matching board.tsx/
// boardInsert.tsx's submit buttons) instead of a bare default MUI Dialog.
export default function ConfirmDialog({
    open, title, description, confirmLabel = '삭제', cancelLabel = '취소', variant = 'delete',
    loading = false, loadingText, onConfirm, onCancel,
}: ConfirmDialogProps) {
    const Icon = VARIANT_ICONS[variant];

    return (
        <Dialog
            open={open}
            onClose={() => !loading && onCancel()}
            PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 20px 48px rgba(38,34,28,0.18)', maxWidth: 360, width: '100%', m: 2 } }}
        >
            <Box sx={{ p: '28px 26px 24px', textAlign: 'center' }}>
                <Box sx={{
                    width: 48, height: 48, borderRadius: '50%', bgcolor: COLORS.accentSoft, color: COLORS.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
                }}>
                    <Icon sx={{ fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: COLORS.textPrimary, mb: description ? 0.75 : 0 }}>
                    {title}
                </Typography>
                {description && (
                    <Typography sx={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>
                        {description}
                    </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1.25, mt: 3 }}>
                    <Box
                        component="button"
                        onClick={onCancel}
                        disabled={loading}
                        sx={{
                            flex: 1, borderRadius: '10px', px: 2, py: 1.25, fontSize: 13.5, fontWeight: 600,
                            fontFamily: 'inherit', cursor: loading ? 'default' : 'pointer',
                            border: `1px solid ${COLORS.border}`, bgcolor: COLORS.surface, color: COLORS.textSecondary,
                            opacity: loading ? 0.6 : 1,
                            '&:hover': loading ? undefined : { borderColor: COLORS.textTertiary, color: COLORS.textPrimary },
                        }}
                    >
                        {cancelLabel}
                    </Box>
                    <Box
                        component="button"
                        onClick={onConfirm}
                        disabled={loading}
                        sx={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
                            borderRadius: '10px', px: 2, py: 1.25, fontSize: 13.5, fontWeight: 600,
                            fontFamily: 'inherit', cursor: loading ? 'default' : 'pointer', border: 'none',
                            bgcolor: COLORS.accent, color: '#fff', boxShadow: '0 1px 2px rgba(38,34,28,0.12)',
                            opacity: loading ? 0.85 : 1,
                            '&:hover': loading ? undefined : { bgcolor: '#211F1B' },
                        }}
                    >
                        {loading && <CircularProgress size={14} thickness={5} sx={{ color: '#fff' }} />}
                        {loading ? (loadingText ?? confirmLabel) : confirmLabel}
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
