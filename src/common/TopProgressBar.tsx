import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { subscribeGlobalLoading } from "./globalLoading";
import { COLORS } from "../theme";

// Thin animated bar pinned above everything else, the single global "something is loading"
// signal - driven by every in-flight axios request (see globalLoading.ts + the interceptors
// registered in common.tsx), not a fixed timeout. Covers route transitions that kick off a
// fetch on mount (board list, board detail's comments, ...), which previously had no feedback
// at all. Local skeletons/spinners still answer "what specifically is loading" - this just
// answers "is anything happening", so the two are complementary, not a second competing system.
export default function TopProgressBar() {
    const [active, setActive] = useState(false);

    useEffect(() => subscribeGlobalLoading(setActive), []);

    if (!active) return null;

    return (
        <Box sx={{
            position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 2000,
            overflow: 'hidden', pointerEvents: 'none',
        }}>
            <Box sx={{
                position: 'absolute', top: 0, left: 0, height: '100%', width: '40%',
                bgcolor: COLORS.accent,
                animation: 'topProgressSlide 1s ease-in-out infinite',
                '@keyframes topProgressSlide': {
                    '0%': { left: '-40%' },
                    '100%': { left: '100%' },
                },
            }} />
        </Box>
    );
}
