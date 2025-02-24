import { Box, Button, ButtonBase, Card, CardActionArea, CardContent, CardMedia, Chip, Fab, Link, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import './Home.css';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import CallIcon from '@mui/icons-material/Call';
import AttachEmailIcon from '@mui/icons-material/AttachEmail';
import ModeIcon from '@mui/icons-material/Mode';
import backendImage1 from '../img/backend.2f24287c.svg';
import backendImage2 from '../img/dev-ops.bba7bfe0.svg';
import backendImage3 from '../img/frontend.cc822109.svg';
import backendImage4 from '../img/language.112e0b13.svg';
import React, { useRef, useState, useEffect,forwardRef, RefObject } from 'react';




type HomeProps = {
    scrollRef0: React.RefObject<HTMLDivElement>,
    scrollRef1: React.RefObject<HTMLDivElement>,
    scrollRef2: React.RefObject<HTMLDivElement>,
    scrollRef3: React.RefObject<HTMLDivElement>
};

export const Home : React.FC<HomeProps>  = ({scrollRef0 ,scrollRef1, scrollRef2, scrollRef3}) => {    
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));


    const ref = useRef <null | HTMLDivElement[] > ([]);

    return (
        
        <div  style={{display:'flex' ,width:'100%', flexWrap : 'wrap' }}>
            <Box   id="main-image" display="flex" style={{ height:'500px' ,width:'100%' ,textAlign:'center' ,justifyContent: 'center'}}>
                <div style={{marginTop:'60px' ,lineHeight:'40px'}}>
                    <span id='jua' style={{color: '#fff',fontSize:'40px' }}>
                    -주종민-
                    <br/>
                    웹개발 포트폴리오 사이트입니다 
                    </span>
                    <br/>
                    <div style={{marginTop:'50px'}}></div>
                    <span id='jua'>
                        안녕하세요<br/>
                        새로운것을 탐구하는 풀스택 개발자<br/>
                        주종민입니다.
                    </span>
                    <br/>
                </div>

                
            </Box>
            <Box ref={scrollRef0} style={{width:'100%', height: '400px',justifyContent: 'center' ,marginTop:'100px'}}>
                <Box  width='100%' style={{textAlign:'center' , margin:'auto' , marginBottom:'60px',}}>
                <BorderColorIcon  style={{fontSize:'35px' , verticalAlign: 'middle'}}/><span id='jua' style={{ verticalAlign: 'middle' , fontSize:'40px', borderBottom:'2px solid gray' }}>ABOUT  ME</span>
                </Box>
                <Box width='100%' style={{margin:'auto'}} >
                    <Box width='100%' display={'flex'} style={{margin:'auto', marginLeft:'100px'}}>
                        
                        <Box style={{width:'33%' ,height:'20xp'}} display={'flex'}>
                            <PersonIcon style={{fontSize:'35px'}}/><span id='jua' style={{fontSize:'25px'}}>이름 : 주종민</span>
                        </Box>
                        <Box style={{width:'33%'}} display={'flex'}>
                            <CalendarTodayIcon style={{fontSize:'35px' , height:'20xp'}}/><span id='jua' style={{fontSize:'25px'}}>생년월일 : 1996/03/05  </span>
                        </Box>
                        <Box style={{width:'33%'}} display={'flex'}>
                            <AddLocationIcon style={{fontSize:'35px'}}/><span id='jua' style={{fontSize:'25px'}}>위치 : 경기도 고양시</span>
                        </Box>
                    </Box>
                    <Box style={{width:'100%' , display:'flex' , margin:'auto',marginTop:'70px' , marginLeft:'100px'}}>
                        <Box style={{width:'33%'}} display={'flex'}>
                            <CallIcon style={{fontSize:'35px'}}/><span id='jua' style={{fontSize:'25px'}}>연락처 : 010-6660-9328</span>
                        </Box>
                        <Box style={{width:'33%'}} display={'flex'}>
                            <AttachEmailIcon style={{fontSize:'35px'}}/><span id='jua' style={{fontSize:'25px'}}>이메일 : wnwhd788@gmail.com</span>
                        </Box>
                        <Box style={{width:'33%'}} display={'flex'}>
                            <ModeIcon style={{fontSize:'35px'}}/><span id='jua' style={{fontSize:'25px'}}>학력 : 인천 폴리텍</span>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box ref={scrollRef1} style={{width:'100%', height: '500px',justifyContent: 'center',backgroundColor:'#ffc107' , margin:'auto'}}>
                <Box width='100%' style={{textAlign:'center' ,marginTop:'50px', marginBottom:'40px'}}>
                    <BorderColorIcon style={{fontSize:'35px' , verticalAlign: 'middle'}}/><span id='jua' style={{ verticalAlign: 'middle' , fontSize:'40px', borderBottom:'2px solid gray'}}>SKILLS</span>
                    
                </Box>
                <Box style={{width:'100%'}}>
                    <Grid container style={{width:'100%',justifyContent: 'center'}}>
                        <Grid item xs={9}>
                            <Paper style={{height:'300px',fontSize : '20px' ,backgroundColor:'#FEF3D2' , borderRadius: '30px',paddingLeft:'40px'}}>
                                
                                <Box style={{marginBottom:'20px',paddingTop:'35px'}}>
                                    <img src={backendImage3} style={{width:'40px', verticalAlign: 'middle'}} />
                                    <span id='jua' style={{marginLeft:'20px' , marginRight:'20px'}}>FrontEnd</span>
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="JavaScript"  />
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="Vue"  />
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="React"  />
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="TypeScript"  />
                                </Box>
                                <Box style={{marginBottom:'20px'}}>
                                    <img src={backendImage4} style={{width:'40px' ,verticalAlign: 'middle'}} />
                                    <span id='jua' style={{marginLeft:'20px' , marginRight:'20px'}}>BackEnd</span>
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="Java"  />
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="SpringBoot"  />
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="Spring"  />
                                </Box>
                                <Box style={{marginBottom:'20px'}}>
                                    <img src={backendImage2} style={{width:'40px', verticalAlign: 'middle'}} /> 
                                    <span id='jua' style={{marginLeft:'20px' , marginRight:'20px'}}>DevOps</span>
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="Aws"  />
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="Docker"  />
                                </Box>
                                <Box >
                                    <img src={backendImage1} style={{width:'40px' , verticalAlign: 'middle'}} />
                                    <span id='jua' style={{marginLeft:'20px' , marginRight:'20px'}}>DB</span>
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="Oracle"  />
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="MariaDB"  />
                                    <Chip id='jua' style={{marginLeft:'10px', fontSize:'20px'}} label="Mysql"  />
                                </Box>    
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Box style={{width:'100%', height: '1000px',justifyContent: 'center',backgroundColor:'#222222' , margin:'auto'}}>
                <Box  width='100%' style={{textAlign:'center' ,marginTop:'50px', marginBottom:'40px'}}>
                    <BorderColorIcon style={{fontSize:'35px' , verticalAlign: 'middle'}}/><span id='jua' style={{ verticalAlign: 'middle' , fontSize:'40px', borderBottom:'2px solid gray' ,color:'#ffffff'}}>CAREER</span>
                </Box>
                <Box>
                <Paper ref={scrollRef2}
                    sx={() => ({
                        p: 4,
                        margin: 'auto',
                        maxWidth: 1200,
                        flexGrow: 1,
                        backgroundColor: '#fff',
                        marginBottom:'50px',
                        borderRadius: '30px'
                    })}
                    >
                    <Grid container spacing={8}>
                        <Grid item xs={12} sm container>
                        <Grid item xs container direction="column" spacing={2}>
                            <Grid item xs>
                            <Typography id='jua' gutterBottom variant="subtitle1" component="div">
                                사방넷 차세대
                            </Typography>
                            <Typography id='jua' variant="body2" gutterBottom>
                                사용언어 : Vue , SpringBoot
                            </Typography>
                            <Typography id='jua' variant="body2" sx={{ color: 'text.secondary' }}>
                                업무 : 각종 인터넷쇼핑몰 , 옥션 , G마켓 , 오늘의집 , cafe24 등등 100개이상의 사이트의 정산을 하는과정에서 각 사이트의 API 요청을 java 를통해 가져오고 각 화면을 만드는 업무수행 , 각각의 쇼핑몰마다 화면구축
                                       관리자 페이지에서 API 호출을통해 필요한 토큰값 등을 개발 , PHP 사이트를 Vue 로 컨버전 개발과정에있어서 php 구형 코드들이 많아서 자체적으로 흐름을 파악한후 Vue 로  재개발

                            </Typography>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Typography id='jua' variant="subtitle1" component="div">
                                2020-12-01 ~ 2022-06-01
                            </Typography>
                        </Grid>
                        </Grid>
                    </Grid>
                    </Paper>
                    <Paper
                    sx={() => ({
                        p: 4,
                        margin: 'auto',
                        maxWidth: 1200,
                        flexGrow: 1,
                        backgroundColor: '#fff',
                        marginBottom:'50px',
                        borderRadius: '30px'
                    })}
                    >
                    <Grid container spacing={8}>
                        <Grid item xs={12} sm container>
                        <Grid item xs container direction="column" spacing={2}>
                            <Grid item xs>
                            <Typography id='jua' gutterBottom variant="subtitle1" component="div">
                                우체국 차세대
                            </Typography>
                            <Typography id='jua' variant="body2" gutterBottom>
                                사용기술 : 웹스퀘어 , Spring
                            </Typography>
                            <Typography id='jua' variant="body2" sx={{ color: 'text.secondary' }}>
                            업무 : 보험쪽 업무를 담당했음 처음에는 스케쥴러로 관리해야하는 배치 프로그램을 개발 상세 내용은 보험비용을 정해진 시간에 맞춰 배치가 돌면 각 타 업무들의 거래내역을 종합해서 패치해주는 배치프로그램
                                   돈관련 업무라 정확성을 요구했습니다 이후 보험 화면개발 

                            </Typography>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Typography id='jua' variant="subtitle1" component="div">
                                2022-07-01 ~ 2022-10-01
                            </Typography>
                        </Grid>
                        </Grid>
                    </Grid>
                    </Paper>
                    <Paper
                    sx={() => ({
                        p: 4,
                        margin: 'auto',
                        maxWidth: 1200,
                        flexGrow: 1,
                        backgroundColor: '#fff',
                        marginBottom:'50px',
                        borderRadius: '30px'
                    })}
                    >
                    <Grid container spacing={8}>
                        <Grid item xs={12} sm container>
                        <Grid item xs container direction="column" spacing={2}>
                            <Grid item xs>
                            <Typography id='jua' gutterBottom variant="subtitle1" component="div">
                                LG유플러스 차세대
                            </Typography>
                            <Typography id='jua' variant="body2" gutterBottom>
                                사용기술 : 웹스퀘어 , SpringBoot
                            </Typography>
                            <Typography id='jua' variant="body2" sx={{ color: 'text.secondary' }}>
                                업무 : 소호인터넷 화면개발 기존에 12000줄이넘는 페이지에서 흐름을 파악하고 개선과 웹스퀘어로 마이그레이션 하는 업무담당 추가업무와 타업무와의 DB 분리를 통해 타업무와 API 를 주고받아서 처리 
                                        추가요구사항도 많았고 복잡도가 높아서 흐름파악이 중요했음 타부서와 소통이 중요했음 말그대로 소호인터넷에 관련해서 기업들을 상대로 인터넷가입하는 화면 
                            </Typography>
                            </Grid>
                            
                        </Grid>
                        <Grid item>
                            <Typography id='jua' variant="subtitle1" component="div">
                                2022-11-01 ~ 2023-07-01
                            </Typography>
                        </Grid>
                        </Grid>
                    </Grid>
                    </Paper>
                </Box>
            </Box>
            <Box ref={scrollRef3} style={{width:'100%', height: '300px',justifyContent: 'center',backgroundColor:'#F5F5F5' , margin:'auto'}}>
                <Box width='100%' style={{textAlign:'center' , margin:'auto' , marginBottom:'60px',}}>
                    <BorderColorIcon style={{fontSize:'35px' , verticalAlign: 'middle'}}/><span id='jua' style={{ verticalAlign: 'middle' , fontSize:'40px', borderBottom:'2px solid gray' }}>ARCHIVING</span>
                </Box>
                <Box style={{width:'100%', height: '300px',justifyContent: 'center',backgroundColor:'#F5F5F5' , margin:'auto'}}>
                    
                    <Card id='hoverImage' sx={{ maxWidth: 345 , margin:'auto' , borderRadius: '20px'}} >
                    <Link href="https://github.com/polyjjm" target="_blank">
                    <CardActionArea>
                        <CardMedia
                        component="img"
                        height="140"
                        image={process.env.PUBLIC_URL + '/gitHub.png'}
                        alt="green iguana"
                        />
                        <CardContent>
                        <Typography id='jua' gutterBottom variant="h5" component="div" >
                            https://github.com/polyjjm
                        </Typography>
                        </CardContent>
                    </CardActionArea>
                    </Link>
                    </Card>
                </Box>
            </Box>
        </div>
    )

};

