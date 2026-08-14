import { Box, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import MdEditor from "../common/mdEditor";
import { postUpload } from "../common/common";
import { COLORS } from "../theme";
import { BoardFormState } from "./board.types";

export default function boardInsert(){
    const [textValue, setText] = useState(String);
    const [flagIndex, flagIndexSet] = useState(0);
    const [boardList, setBoard] = useState<BoardFormState>({
        board_title: '',
        board_content: '',
        board_userName: '', // 이건 string이지만 string | null 타입과 호환됨
        board_changeThumbnail: '',
        board_categoryMain: '',
        board_categoryMid: '',
        board_categorySub: '',
        boardImgList: [],
        boardImgLegacyList: [],
    });

    const [uploadFiles , setFiles] = useState<FormData>(new FormData);
    let editorValue:any;

    const changeTitle = (e:any) =>{
        const {value}  =e.target
        setBoard({...boardList , board_title : value});
    }

    const changeThumbnail = (e:any) =>{
        const {value}  =e.target
        setBoard({...boardList , board_changeThumbnail : value});
    }

    // 대/중/소 각각 자유 텍스트 입력 - 프리셋 목록에서 고르는 게 아니라 사용자가 직접 입력한다.
    const changeCategory = (level: 'board_categoryMain' | 'board_categoryMid' | 'board_categorySub') => (e:any) => {
        setBoard({...boardList , [level] : e.target.value});
    }

    const eidtorValue = (e:any) =>{
        setText(e);
        setBoard({...boardList , board_content :  e})
    }

    const subMit = async (e:any) =>{
        flagIndexSet(1);

        if(!boardList.board_title){
            alert('제목을 입력해주세요');
            return false;
        }

        if(!boardList.board_content){
            alert('내용을 입력해주세요');
            return false;
        }

        if(!boardList.board_changeThumbnail){
            alert('내용을 썸네일은 필수입니다 !');
            return false;
        }
        setBoard({...boardList , board_userName :  localStorage.getItem('user_email')})
        let reg = new RegExp(/<img[^>]+src=[\"']?([^>\"']+)[\"']?[^>]*>/, "g");

        const boardImg = boardList.board_content.match(reg);
        boardList.boardImgList = [];
        if(boardImg !== null){
            for(let i = 0 ; i < boardImg.length;i++){
                reg  = new RegExp(/src=".*?"/, "g");
                let srcValue = boardList.board_content.match(reg)
                if(srcValue){
                    boardList.boardImgList.push({idx: i , value : srcValue[0]});
                }

            }

        }
        uploadFiles.append('data' , new Blob([JSON.stringify(boardList)] , { type: "application/json"}));

        const result = await postUpload('/board/subMit' , uploadFiles);

        if(!result){
            alert('게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        flagIndexSet(1);

        window.location.href ='/board';
    }


    const preventClose =  (e:BeforeUnloadEvent) => {

        if(flagIndex == 0){
            e.preventDefault();
            e.returnValue = ""; // chrome에서는 설정이 필요해서 넣은 코드
        }

    }

    useEffect(() => {
        (() => {
            window.addEventListener("beforeunload", preventClose);
        })();
        return () => {
            window.removeEventListener("beforeunload", preventClose);
        };
    },[flagIndex]);

    return (
        <Box sx={{ mx: 'auto', maxWidth: 1200, px: { xs: 2, sm: 3 } }}>

            <Box sx={{mt: '50px', fontWeight: 'bold', mb: '50px', width:'100%', textAlign:'right', fontSize: { xs: '22px', sm: '30px' }, borderBottom: `2px solid ${COLORS.border}`}}>게시글 등록</Box>
            <Box sx={{ width:"100%" , pb:'20px'}}>
                <TextField
                sx={{width:"100%"}}
                variant="standard"
                label="제목"
                id="title"
                defaultValue=""
                placeholder="제목을 입력해주세요"
                name="title"
                onChange={changeTitle}
                size="small"
                focused
                inputProps={{maxLength : 50}}
                />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ width: { xs: '100%', sm: 400 } }}>
                    <TextField
                        sx={{ width: '100%' }}
                        label="-썸네일-"
                        onChange={changeThumbnail}
                        variant="standard"
                        placeholder="추가하실 썸네일을 입력해주세요"
                        focused
                        multiline
                        rows={4}
                        inputProps={{maxLength : 150}}
                    />
                </Box>
                {/* 3단계 카테고리: 대/중/소 모두 자유 텍스트 - 프리셋 목록 없이 직접 입력 */}
                <Box sx={{ width: { xs: '100%', sm: 500 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        sx={{ width: '100%' }}
                        label="대분류"
                        placeholder="예: 개발"
                        variant="standard"
                        focused
                        value={boardList.board_categoryMain}
                        onChange={changeCategory('board_categoryMain')}
                        inputProps={{maxLength : 50}}
                    />
                    <TextField
                        sx={{ width: '100%' }}
                        label="중분류"
                        placeholder="예: Frontend"
                        variant="standard"
                        focused
                        value={boardList.board_categoryMid}
                        onChange={changeCategory('board_categoryMid')}
                        inputProps={{maxLength : 50}}
                    />
                    <TextField
                        sx={{ width: '100%' }}
                        label="소분류"
                        placeholder="예: React"
                        variant="standard"
                        focused
                        value={boardList.board_categorySub}
                        onChange={changeCategory('board_categorySub')}
                        inputProps={{maxLength : 50}}
                    />
                </Box>
            </Box>
            <Box sx={{paddingTop:'10px'}}>
                <MdEditor value={textValue} onChange={eidtorValue} boardList={boardList} />
            </Box>
            <Box sx={{textAlign : 'center' , width:'100%' , marginTop:'50px'}}>
                <Button variant="outlined" sx={{marginRight:'10px'}} onClick={() => {window.history.back()}}>취소</Button>
                <Button variant="contained" sx={{ bgcolor: COLORS.accent, '&:hover': { bgcolor: '#211F1B' } }} onClick={subMit}>등록</Button>
            </Box>
        </Box>
    )
}
