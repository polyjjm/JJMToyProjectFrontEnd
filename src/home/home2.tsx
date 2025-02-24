import { Box } from "@mui/material";
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';



export default function home() {    
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));
      
    return (
        
        <div style={{backgroundColor:'red',display:'flex',height: '750px'}}>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={3}>
                    <Grid item xs={6} >
                        <Paper style={{height:'300px',fontSize : '50px'}}> 설명 && 이력  </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper style={{height:'300px'}}>Content 2</Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper style={{height:'300px'}}>Content 3</Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper style={{height:'300px'}}>Content 4</Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper style={{height:'300px'}}>Content 5</Paper>
                    </Grid>
                    
                </Grid>
            </Box>
        </div>
    )

}

