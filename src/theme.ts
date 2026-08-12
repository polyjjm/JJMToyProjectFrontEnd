import { createTheme } from '@mui/material/styles';

// "Vivid Citrus & Ink" palette
export const COLORS = {
    coral: '#FF6B4A',   // primary
    teal: '#2EC4B6',    // secondary
    amber: '#FFC857',   // accent (chips, highlights)
    bg: '#F6F5FC',       // page background - cool off-white, not cream
    surface: '#FFFFFF',  // cards/paper
    ink: '#1B1B3A',      // primary text - deep indigo-black, not pure black
    inkSoft: '#4B4B68',  // secondary text
};

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: COLORS.coral,
            contrastText: COLORS.ink,
        },
        secondary: {
            main: COLORS.teal,
            contrastText: COLORS.ink,
        },
        warning: {
            // repurposed as the palette's accent color, so components that already
            // use color="warning" (chips, hashtags) pick up the new palette for free
            main: COLORS.amber,
            contrastText: COLORS.ink,
        },
        background: {
            default: COLORS.bg,
            paper: COLORS.surface,
        },
        text: {
            primary: COLORS.ink,
            secondary: COLORS.inkSoft,
        },
    },
    typography: {
        fontFamily: `'Jua', 'Roboto', sans-serif`,
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: COLORS.surface,
                    color: COLORS.ink,
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
