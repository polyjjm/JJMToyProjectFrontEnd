import { createTheme } from '@mui/material/styles';

// Muted warm-neutral palette from the approved design-mockup.html - replaces the old
// "Vivid Citrus & Ink" direction. Values match the mockup's CSS custom properties 1:1
// so this file stays the single source of truth for the palette across every page
// (Home, board, todo, chat, weather), same as the mockup's :root variables.
export const COLORS = {
    bg: '#F7F5F2',               // page background - warm off-white, not stark white
    surface: '#FFFFFF',          // cards/paper
    border: '#E8E4DE',
    textPrimary: '#262420',
    textSecondary: '#7C766C',
    textTertiary: '#ADA79C',
    accent: '#38332C',           // muted warm charcoal - primary button, active tab/nav, NOT a bright color
    accentSoft: '#EFEBE4',       // light beige highlight (tag backgrounds, soft chips)
    sidebarBg: '#211F1B',
    sidebarText: '#A39C8F',
    sidebarTextActive: '#FFFFFF',
};

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: COLORS.accent,
            contrastText: '#FFFFFF',
        },
        // The mockup has no separate secondary hue - everything that needs emphasis
        // uses the one muted accent color, so secondary just mirrors primary rather
        // than introducing a second brand color that isn't in the design.
        secondary: {
            main: COLORS.accent,
            contrastText: '#FFFFFF',
        },
        background: {
            default: COLORS.bg,
            paper: COLORS.surface,
        },
        text: {
            primary: COLORS.textPrimary,
            secondary: COLORS.textSecondary,
        },
    },
    typography: {
        // Pretendard first (Korean-friendly), falling back through the mockup's stack.
        fontFamily: `'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif`,
    },
    shape: {
        borderRadius: 10,
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: COLORS.surface,
                    color: COLORS.textPrimary,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 700,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },
    },
});

export default theme;
