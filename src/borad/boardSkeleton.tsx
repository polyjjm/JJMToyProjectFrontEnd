import { Box, ButtonBase, Grid, Paper, Skeleton, Typography } from "@mui/material";

export default function boardSkeleton(){

    return(
        <Paper sx={{
            p: 2,
            margin: 'auto',
            width: 550,
            flexGrow: 1,
            backgroundColor: '#fff',
            marginBottom :'30px',
            marginLeft:'30px',
            float:'left'
        }}>
                    <ButtonBase  sx={{width:'100%' , height:158}}>    
                    <Grid item xs={12} sm container>
                        <Grid>
                            <Skeleton animation="wave" sx={{width:'178px' ,height :'250px'}} />
                        </Grid>
                        <Grid xs item sx={{ width:270 ,marginLeft:'10px'}}>
                            <Grid item >
                                <Typography gutterBottom style={{marginLeft:'5px' ,fontSize:'32px' ,textAlign:'left' ,overflow:'hidden' , textOverflow:'ellipsis' , whiteSpace:'nowrap' , marginTop:'40px'}}>
                                    <Skeleton animation="wave" />
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography
                                    id='wordStyleImg'
                                    gutterBottom
                                >
                                    <Skeleton animation="wave"  />
                                    <Skeleton animation="wave"  />
                                    <Skeleton animation="wave"  />
                                </Typography>
                            </Grid>
                        </Grid>
                       
                    </Grid>                
                    </ButtonBase>
        </Paper>
    
    )

}