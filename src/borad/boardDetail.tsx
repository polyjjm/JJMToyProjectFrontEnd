import { Button, Paper, Typography } from "@mui/material"
import { Box } from "@mui/material";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { post } from "../common/common";
/*
boardList Object 타입 
*/
interface boardType {
    board_no : Number | undefined,
    board_title : String | undefined,
    board_writer : String | undefined,
    board_content : string | TrustedHTML,
    board_hit : String | 0,
    board_like : String | 0,
    board_hate : String | 0,
    board_date : String | '',
    board_hashTag :string | undefined
}
export default function boardDetail() {
    // 페이지 이동시 훅 데이터 훅 관련 전페이지 데이터 전달
    const location = useLocation();
    
    const boardList = location.state.boardList;

    const hashList = boardList.board_hashTag ? boardList.board_hashTag.split(',') : [];

    console.log(boardList ,'확인중boardList');
    console.log(boardList.board_no , '넘버 확인중');
    
    const addBoadrList = post('/board/view' , {'board_no' : boardList.board_no} );
    
    return (
        <Box sx={{width: 1200  ,minHeight:'900px' }} >
            <Box sx={{margin: 'auto', height:'350px'}}>
                <Box style={{marginTop:'100px'}}>
                    <h1 dangerouslySetInnerHTML={{__html:boardList.board_title}} style={{fontSize:'40px' ,lineHeight:'12px',textAlign:'center'}}></h1>
                </Box>
                <Box id='hashTagList' style={{margin:'auto',height:'100px'}}> 
                        {
                            hashList.length > 0 && hashList.map((hashTag:string , idx:number) =>{
                                return (
                                    <Box 
                                    
                                        style={{
                                            fontSize:'20px',
                                            height:'30px',
                                            float :'left',
                                            marginLeft:'10px',
                                            backgroundColor:'#ED6C02',
                                            borderRadius:'10px',
                                            textAlign :'center',
                                            minWidth:'100px'
                                            }}
                                            key={hashTag}>
                                        <span style={{color:'#fff'}}>{hashTag}</span>
                                    </Box>
                                )
                            })

                        }
                  </Box>
                  <Box style={{borderBottom:'4px solid gray',height:'30px'}}>
                    <Box sx={{width:'300px' ,float:'left',marginLeft:'20px'}} >
                        <span dangerouslySetInnerHTML={{__html:boardList.board_date.substr(0,10)}} />
                    </Box>
                    <Box sx={{width:'300px',float:'right' ,textAlign:'right',height:'30px',marginRight:'20px'}}>
                        <span dangerouslySetInnerHTML={{__html:boardList.board_writer}} style={{textAlign :'left'}} />
                    </Box>
                  </Box>
            </Box>
            <Box sx={{margin: 'auto', width: 1200 }}>
                <Box sx={{maxWidth: 1200 ,minHeight: 530 }}>
                    <Typography id="transition-modal-description" sx={{ mt: 2, maxWidth: 1200 }} dangerouslySetInnerHTML={{__html:boardList.board_content}} />
                </Box>
            </Box>
        </Box>
    )
};