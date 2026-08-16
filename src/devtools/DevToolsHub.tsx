import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DEV_TOOLS } from './devTools';
import { COLORS } from '../theme';

// Landing page for the "개발자 도구" sidebar nav entry - lists the same 4 tools as the
// dashboard's DevToolsRow (shared DEV_TOOLS data), just as a dedicated page rather than a
// quick-access row alongside other widgets.
export default function DevToolsHub() {
    const navigate = useNavigate();

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.3px', mb: 0.5, color: COLORS.textPrimary }}>
                    개발자 도구
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
                    직접 만든 유틸리티 도구 모음입니다.
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {DEV_TOOLS.map((tool) => (
                    <Box
                        key={tool.id}
                        onClick={() => navigate(`/tools/${tool.id}`)}
                        sx={{
                            bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '14px',
                            p: 2.5, cursor: 'pointer', transition: 'border-color .15s, transform .1s',
                            display: 'flex', alignItems: 'flex-start', gap: 1.5,
                            '&:hover': { borderColor: COLORS.accent, transform: 'translateY(-2px)' },
                        }}
                    >
                        <Box sx={{
                            width: 42, height: 42, borderRadius: '10px', bgcolor: COLORS.accentSoft, color: COLORS.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 19,
                        }}>
                            {tool.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 14.5, fontWeight: 700, mb: 0.375, color: COLORS.textPrimary }}>{tool.title}</Typography>
                            <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.5 }}>{tool.description}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
