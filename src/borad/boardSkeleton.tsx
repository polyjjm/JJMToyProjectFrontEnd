import { Box, Paper, Skeleton, Typography } from "@mui/material";

// Card-shaped placeholder matching board.tsx's card layout (image on top, text below) -
// board.tsx renders these directly inside its CSS grid, so this has no grid-item wrapper
// of its own (it previously assumed an MUI <Grid container> parent that no longer exists).
export default function boardSkeleton(){

    return(
        <Paper elevation={0} sx={{
            border: '1px solid #E8E4DE',
            borderRadius: '10px',
            overflow: 'hidden',
        }}>
            <Skeleton variant="rectangular" animation="wave" sx={{ width: '100%', aspectRatio: '16/9' }} />
            <Box sx={{ p: '16px 18px 18px' }}>
                <Typography variant="h6"><Skeleton animation="wave" width="60%" /></Typography>
                <Typography variant="body2"><Skeleton animation="wave" /></Typography>
                <Typography variant="body2"><Skeleton animation="wave" width="80%" /></Typography>
            </Box>
        </Paper>
    )

}
