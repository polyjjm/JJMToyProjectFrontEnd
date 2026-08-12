import { Box, Grid, Paper, Skeleton, Typography } from "@mui/material";

export default function boardSkeleton(){

    return(
        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                p: 2,
                borderRadius: 3,
                minHeight: 200,
            }}>
                <Skeleton variant="rectangular" animation="wave" sx={{ width: { xs: '100%', sm: 150 }, height: 150, flexShrink: 0, mr: { sm: 2 }, mb: { xs: 2, sm: 0 }, borderRadius: 2 }} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6"><Skeleton animation="wave" width="60%" /></Typography>
                    <Typography variant="body2"><Skeleton animation="wave" /></Typography>
                    <Typography variant="body2"><Skeleton animation="wave" width="80%" /></Typography>
                </Box>
            </Paper>
        </Grid>
    )

}
