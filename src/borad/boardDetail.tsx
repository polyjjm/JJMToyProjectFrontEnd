import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Typography } from "@mui/material"
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { post } from "../common/common";
/*
boardList Object 타입 
*/
interface boardType {
    board_no : Number | undefined,
    board_title : String | undefined,
    board_writer : String | undefined,
    board_userName : string | undefined,
    board_content : string | TrustedHTML,
    board_hit : String | 0,
    board_like : String | 0,
    board_hate : String | 0,
    board_date : String | '',
    board_hashTag :string | undefined
}
export default function boardDetail() {
    // 페이지 이동시 훅 데이터 훅 관련 전페이지 데이터 전달
    const [updateStatus , setUpdateStatus] = useState(false);
    const [deleteStatus , setDeleteStatus] = useState(false);
    const location = useLocation();
     const navigate = useNavigate();
    const boardList = location.state.boardList;
    const hashList = boardList.board_hashTag ? boardList.board_hashTag.split(',') : [];
    useEffect(() =>{
        const addBoadrList = post('/board/view' , {'board_no' : boardList.board_no} );
        
        if(boardList.board_userName !== localStorage.getItem('user_email')){
            const btn1 = document.getElementById('update');
            const btn2 = document.getElementById('delete');
            if(btn1 && btn2){
                btn2.style.display = 'none';
                btn1.style.display = 'none';
            }

            
        }        
        
    },[])
    

    const deleteContent = async (status:string) =>{
        if(status === 'YES'){
            post('/board/delete' , {'board_no' : boardList.board_no} );
            navigate(-1)
        }else {
            setDeleteStatus(false)
        }
    }
    const updateContent = async (status:string) =>{
        if(status === 'YES'){
            navigate("/board/boardUpdate", { state: { boardList: boardList }});
        }else {
            setDeleteStatus(false)
        }
    }
    const modalDelete = async() =>{ 
        setDeleteStatus(true)
    }

    const modalUpdate = async() =>{ 
        setUpdateStatus(true)
    }
    return (
        <Box sx={{width: 1200  ,minHeight:'900px' }} >
            <Box sx={{margin: 'auto', height:'350px'}}>
                <Box style={{marginTop:'100px'}}>
                
                    <h1 dangerouslySetInnerHTML={{__html:boardList.board_title}} style={{fontSize:'40px' ,lineHeight:'12px',textAlign:'center'}}></h1>
                    <Button variant="contained" onClick ={e => modalUpdate()} id='update'style={{float:'right',marginLeft:'10px'}}>수정</Button>
                    <Button variant="contained" onClick={e => modalDelete()} id='delete' style={{float:'right'}}>삭제</Button>
                    <Dialog
                        open={deleteStatus}
                        onClose={modalDelete}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                        {" 정말로 삭제하시겠습니까?"}
                        </DialogTitle>
                        <DialogActions>
                        <Button onClick={e => deleteContent('YES')}>삭제</Button>
                        <Button onClick={e => deleteContent('NO')} autoFocus>
                            취소
                        </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={updateStatus}
                        onClose={modalDelete}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                        {" 정말로 수정하시겠습니까?"}
                        </DialogTitle>
                        <DialogActions>
                        <Button onClick={e => updateContent('YES')}>수정</Button>
                        <Button onClick={e => updateContent('NO')} autoFocus>
                            취소
                        </Button>
                        </DialogActions>
                    </Dialog>
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