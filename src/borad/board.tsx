import { Box, Button, Pagination,Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import './board.css';
import { post } from "../common/common";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Img = styled('img')({
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
});
const object = {};
interface boardType {
    board_no : Number | undefined,
    board_title : String | undefined,
    board_writer : String | undefined,
    board_content : string | TrustedHTML,
    board_hit : String | 0,
    board_like : String | 0,
    board_hate : String | 0,
    board_date : String | '',
    board_imgList: String | ''
}
interface pageType {
    currentPage : number,
    endPage : number,
    pagingCount : number,
    startPage : number,
    total : number ,
    totalPages : number
}
/**
 * 오늘 해야할일 날짜 글씨 색깔변경  오른쪽위에 달러 대신 메뉴 이름 넣기
 * 
 */

export default function board(){
    const [boards, setBoard] = useState<Array<boardType>>([]);
    const [paging, setPage] = useState<pageType>();
    let boardList :any ;
    
    useEffect(()=>{
        async function fetch() {
            
            boardList = await post('/board/select' , {'currentPage' : 1});
            setBoard(boardList.content)
            setPage(boardList)
        };
        fetch();


    }, [])
    useEffect(()=>{


    }, [boards])

    const pageButtonClick = async (event:any) =>{
        console.log(event.target.dataset.testid , 22);
        let currentPage = 1; 
        // mui 페이징 버그있음 
        if(event.target.outerText){
            currentPage = event.target.outerText
        }else {
            if(event.target.dataset.testid === 'NavigateBeforeIcon'){
                currentPage = paging ? paging.currentPage -1 : 1
            }else if(event.target.dataset.testid === 'NavigateNextIcon') {
                currentPage = paging ? paging.currentPage + 1 : 1
            }else if(event.target.dataset.testid === 'LastPageIcon'){
                currentPage = paging ? paging.totalPages : 1
            }else if(event.target.dataset.testid === 'FirstPageIcon'){
                currentPage = 1
            }
        }
        
        const setPagingData = {
            'currentPage' : currentPage
        }
        boardList = await post('/board/select' , setPagingData);
        setBoard(boardList.content)

    }

    const navigate = useNavigate();
    const clicked = (e :Object) => {
        console.log(e);
        navigate("/board/boardDetail", { state: { boardList: e } });
    }

    return (
        <Box>
            <Box sx={{
                p: 2,
                margin: 'auto',
                maxWidth: 1200,
                flexGrow: 1,
                backgroundColor: '#fff',
                marginBottom :'10px',
                justifyContent: 'right',
                display:'flex'

                
            }}>
                <Button variant="contained" href="/board/boardInsert">게시글 등록</Button>
            </Box>
            {boards ? boards.map((value,index) => (
                    <Paper
                    sx={{
                        p: 2,
                        margin: 'auto',
                        maxWidth: 1200,
                        flexGrow: 1,
                        backgroundColor: '#fff',
                        marginBottom :'10px'
                    }}
                    key={index}
                    >
                    <ButtonBase  sx={{width:'100%' , height:158}} onClick={e => clicked(value)}>    
                        <Grid item container spacing={2} xs={12}>
                            {
                            value.board_imgList ?
                                <Grid item xs={3}>
                                 <Img sx={{ width: 170, height: 128 }} src={value.board_imgList.split(',')[0]} />
                                </Grid>
                                : null
                            }
                            <Grid item xs={9} sm container style={{textAlign:'left'}}>
                                <Grid item xs container direction="column" spacing={2}>
                                    <Grid  >
                                        <Typography gutterBottom variant="subtitle1" component="div" className="title">
                                            <p style={{fontSize:'18px'}}>{value.board_title}</p>
                                        </Typography>
                                        
                                    </Grid>
                                    <Grid  >
                                        <Typography sx={{ cursor: 'pointer' }} variant="body2">
                                            {value.board_date.substr(0,10)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid  >
                                    <Typography variant="subtitle1" component="div">
                                    조회수 : {value.board_hit} 좋아요 : {value.board_like} 싫어요 : {value.board_hate}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </ButtonBase>
                   </Paper>
            )) :  <Paper
                    sx={{
                        p: 2,
                        margin: 'auto',
                        maxWidth: 1200,
                        flexGrow: 1,
                        backgroundColor: '#fff',
                        marginBottom :'10px'
                    }}
                  >
                    <p>게시글이 존재하지않습니다 </p>
                  </Paper>
        }
            <Box sx={{
                p: 2,
                margin: 'auto',
                maxWidth: 1200,
                flexGrow: 1,
                backgroundColor: '#fff',
                marginBottom :'10px',
                justifyContent: 'center',
                display:'flex'

                
            }}>
                <Pagination count={paging ? paging.totalPages : 1} defaultPage={1} variant="outlined" shape="rounded" showFirstButton showLastButton onChange={pageButtonClick}/>
            </Box>
        </Box>
    )
}






