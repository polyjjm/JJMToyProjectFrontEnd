import { Box, TextField, TextFieldProps, Typography } from "@mui/material";
import { COLORS } from "../theme";

// Shared visual building blocks for boardInsert.tsx / boardUpdate.tsx - both forms need the
// exact same "form-card" section styling from board-insert-mockup.html, so this keeps the two
// pages from drifting into slightly-different copies of the same box-shadow/border/radius values.

export const formCardSx = {
    bgcolor: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '14px',
    p: { xs: 2.5, sm: '28px 30px' },
    mb: 2.5,
};

// Matches the mockup's .text-input focus ring (border + soft accent glow) on top of MUI's
// outlined TextField instead of the old variant="standard" underline style.
export const fieldSx = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        bgcolor: COLORS.surface,
        fontSize: 14,
        '& fieldset': { borderColor: COLORS.border },
        '&:hover fieldset': { borderColor: COLORS.textTertiary },
        '&.Mui-focused fieldset': { borderColor: COLORS.accent, borderWidth: '1px' },
    },
    '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: `0 0 0 3px ${COLORS.accentSoft}` },
};

export function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12.5, fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
            {children}
            {optional && (
                <Box component="span" sx={{
                    fontSize: 11, fontWeight: 600, color: COLORS.textTertiary,
                    bgcolor: COLORS.bg, px: 0.875, py: '2px', borderRadius: '999px',
                }}>
                    선택
                </Box>
            )}
        </Box>
    );
}

// One "대 ›" / "중 ›" / "소 ›" row - consistent with the "›" breadcrumb chevron style board.tsx
// already uses for its category tabs and boardDetail.tsx's category path.
export function CategoryRow({ label, ...textFieldProps }: { label: string } & TextFieldProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box component="span" sx={{ color: COLORS.textTertiary, fontSize: 13, flexShrink: 0, minWidth: 34 }}>
                {label} ›
            </Box>
            <TextField sx={fieldSx} size="small" {...textFieldProps} />
        </Box>
    );
}
