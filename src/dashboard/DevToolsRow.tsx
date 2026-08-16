import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DEV_TOOLS } from '../devtools/devTools';
import { COLORS } from '../theme';

// Fixed 4-card dev-tools row (see dashboard-mockup.html) - hardcoded, not table-backed, since
// these are specific app features rather than user-curated links (contrast QuickLinksWidget).
export default function DevToolsRow() {
    const navigate = useNavigate();

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.textPrimary }}>개발자 도구</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.75 }}>
                {DEV_TOOLS.map((tool) => (
                    <Box
                        key={tool.id}
                        onClick={() => navigate(`/tools/${tool.id}`)}
                        sx={{
                            bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '14px',
                            p: 2.25, cursor: 'pointer', transition: 'border-color .15s, transform .1s',
                            '&:hover': { borderColor: COLORS.accent, transform: 'translateY(-2px)' },
                        }}
                    >
                        <Box sx={{
                            width: 38, height: 38, borderRadius: '10px', bgcolor: COLORS.accentSoft, color: COLORS.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, fontSize: 17,
                        }}>
                            {tool.icon}
                        </Box>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700, mb: 0.5, color: COLORS.textPrimary }}>{tool.title}</Typography>
                        <Typography sx={{ fontSize: 11.5, color: COLORS.textSecondary, lineHeight: 1.5 }}>{tool.description}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
