import { Button, Paper, Typography } from "@mui/material"
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
/*
boardList Object 타입 

interface boardType {
    board_no : Number | undefined,
    board_title : String | undefined,
    board_writer : String | undefined,
    board_content : string | TrustedHTML,
    board_hit : String | 0,
    board_like : String | 0,
    board_hate : String | 0,
    board_date : String | ''
}
*/
export default function boardDetail() {
    // 페이지 이동시 훅 데이터 훅 관련 전페이지 데이터 전달
    const location = useLocation();

    const boardList = location.state.boardList;
    return (
        <Box sx={{margin: 'auto', maxWidth: 1200 , border : '1px solid red'}}>
            <Box sx={{width: '100%' , border : '1px solid black' ,textAlign:'right'}}>
                <Button variant="contained" >게시글 수정</Button>
                <Button variant="contained" >게시글 삭제</Button>                
            </Box>
            
            
        
            
            <Box sx={{maxWidth: 1200}}>
                <Typography id="transition-modal-description" sx={{ mt: 2, maxWidth: 1200 }} dangerouslySetInnerHTML={{__html:boardList.board_content}} />
            </Box>
        </Box>
    )
};