import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";
import Editor from "../common/Editor";
import { styled } from '@mui/material/styles';
import { post, postUpload } from "../common/common";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileButton from "../common/fileUploadButton";
import BoardPreview from "./boardPreview";
const Input = styled('input')({
  display: 'none',
  border:'2px solid red'
});



const Img = styled('img')({
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
});

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});


// CSS

export default function boardInsert(){
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [boardList , setBoard] = useState({
        board_title : '',
        board_content : '',
        boardImgList : new Array(),
        boardImgLegacyList : new Array()

    });
    const [uploadFiles , setFiles] = useState<FormData>(new FormData);
    let editorValue:any;

    const stateValue = (e:any) =>{
        const {value , name }  =e.target
        setBoard({...boardList , board_title : value});

        console.log(boardList);
    }

    const eidtorValue = (e:any) =>{
        

        if(Array.isArray(e)){
            for(let i= 0 ; i < e.length; i++){
                boardList.boardImgLegacyList.push({idx: i , value : e[i]});
            }
            console.log("타는지 확인");
        }
        
        
            
            setBoard({...boardList , board_content :  e})
            console.log(editorValue , '해결');
        
    }

    const onChangeFileValue = (e:any) => {
        uploadFiles.delete('files');
        for(let i = 0 ; i < e.target.files.length; i++){
            uploadFiles.append('files' , e.target.files[i]);
        }
        
    }

    
    const subMit = (e:any) =>{
        let reg = new RegExp(/<img[^>]+src=[\"']?([^>\"']+)[\"']?[^>]*>/, "g");

        const boardImg = boardList.board_content.match(reg);
        boardList.boardImgList = [];
        if(boardImg !== null){
            for(let i = 0 ; i < boardImg.length;i++){
                const stringValue = boardImg[i];
                reg  = new RegExp(/src=".*?"/, "g");
                let srcValue = boardList.board_content.match(reg)
                if(srcValue){
                    boardList.boardImgList.push({idx: i , value : srcValue[0]});
                }
                
            }
            
        }
        console.log("주종민 이미지 배열 확인중 " ,boardList);
        uploadFiles.append('data' , new Blob([JSON.stringify(boardList)] , { type: "application/json"}));
        
        for (let key of uploadFiles.keys()) {
            console.log(key);
        }
          
          // FormData의 value 확인
        for (let value of uploadFiles.values()) {
            console.log(value);
        }
        
        
        postUpload('/board/subMit' , uploadFiles);
    }

    return (
        <Box sx={{margin: 'auto', maxWidth: 1200}}>
            <Box sx={{fontWeight : 'bold' ,  marginBottom:'50px', width:'100%' ,textAlign:'right' , fontSize :'30px' ,borderBottom : '2px solid #E4EDFC'}}>게시글 등록</Box>
            <Box sx={{ margin:"auto",width:"100%" , paddingBottom:'20px'}}>
                <TextField
                sx={{width:"80%"}}
                label="제목"
                id="title"
                defaultValue=""
                placeholder="제목을 입력해주세요"
                name="title"
                onChange={stateValue}
                size="small"
                />
            </Box>
            <Box sx={{ width:'80%' ,height: '70px' , float:'left', display:'flex'}}>
                    <FileButton onChange ={onChangeFileValue}></FileButton>
            </Box>
            <Box sx={{paddingTop:'70px'}}>
                <Editor onChange={eidtorValue}></Editor>
            </Box>
            <Box sx={{textAlign : 'center' , width:'100%' , marginTop:'50px'}}>
                <Button variant="outlined" sx={{marginRight:'10px'}} onClick={handleOpen}> 미리보기 </Button>
                <BoardPreview boardList={boardList} open={open} onClose={handleClose}></BoardPreview>
                <Button variant="outlined" sx={{marginRight:'10px'}} onClick={() => {history.back()}}>취소</Button>
                <Button variant="contained" onClick={subMit}>등록</Button>
            </Box>
        </Box>
    )
}