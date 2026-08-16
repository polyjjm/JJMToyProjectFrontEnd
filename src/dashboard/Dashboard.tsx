import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import WeatherMain from "../weather/WeatherMain";
import TodoWidget from "./TodoWidget";
import ServerStatusWidget from "./ServerStatusWidget";
import QuickLinksWidget from "./QuickLinksWidget";
import DevToolsRow from "./DevToolsRow";
import { COLORS } from "../theme";

const widgetCardSx = {
    bgcolor: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '14px',
    overflow: 'hidden',
    minHeight: 420,          // 추가 — 모든 카드의 최소 높이 통일
    display: 'flex',         // 추가 — 내부 콘텐츠가 세로로 꽉 채우도록
    flexDirection: 'column', // 추가
};

// Consolidates the old standalone 날씨/할일 nav items (previous round) plus the server-status/
// quick-links/dev-tools widgets (this round) into one 대시보드 page - see dashboard-mockup.html
// for the full approved layout this mirrors: weather+todo side by side up top, server-status+
// quick-links below that, then a fixed dev-tools row.
export default function Dashboard() {
    const navigate = useNavigate();

    // Every widget here needs a logged-in identity (todo/server-status/quick-links all hit
    // authenticated-only endpoints - see securityConfig, nothing under /api/dashboard/** or
    // /todo/** is permitAll) - same guard style as boardInsert.tsx, so an anonymous visitor
    // lands on /signin instead of a page full of failed requests.
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/signin', { replace: true });
        }
    }, [navigate]);

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.3px', mb: 0.5, color: COLORS.textPrimary }}>
                    대시보드
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
                    오늘의 날씨와 할 일을 한눈에 확인하세요.
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr' }, gap: 2.5 }}>
                <Box sx={widgetCardSx}><WeatherMain /></Box>
                <Box sx={widgetCardSx}><TodoWidget /></Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, gap: 2.5, mt: 2.5 }}>
                <Box sx={widgetCardSx}><ServerStatusWidget /></Box>
                <Box sx={widgetCardSx}><QuickLinksWidget /></Box>
            </Box>

            <DevToolsRow />
        </Box>
    );
}
