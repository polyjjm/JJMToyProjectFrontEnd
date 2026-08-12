import { Box, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Editor from "../common/Editor";
import MdEditor from "../common/mdEditor";
import { styled } from '@mui/material/styles';
import { postUpload } from "../common/common";
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { COLORS } from "../theme";
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

interface BoardState {
    board_title: string;
    board_content: string;
    board_userName: string | null;
    board_changeThumbnail: string;
    boardImgList: any[];           // 구체적인 타입이 있다면 any 대신 사용
    boardImgLegacyList: any[];
    board_hashTag: string;
  }

// CSS

export default function boardInsert(){
    const [open, setOpen] = useState(false);
    const [textValue, setText] = useState(String);
    const [flagIndex, flagIndexSet] = useState(0);
    const [hashInputText, sethashInputText] = useState("");
    const [hashTagList, sethashTagList] = useState(new Array);
    const [boardList, setBoard] = useState<BoardState>({
        board_title: '',
        board_content: '',
        board_userName: '', // 이건 string이지만 string | null 타입과 호환됨
        board_changeThumbnail: '',
        boardImgList: [],
        boardImgLegacyList: [],
        board_hashTag: ''
    });

    const [uploadFiles , setFiles] = useState<FormData>(new FormData);
    let editorValue:any;

    const changeTitle = (e:any) =>{
        const {value , name }  =e.target
        setBoard({...boardList , board_title : value});

        console.log(boardList);
    }

    const changeThumbnail = (e:any) =>{
        const {value , name }  =e.target
        setBoard({...boardList , board_changeThumbnail : value});

    }

    const ChangeHashTage = async (hashList:Array<string>) =>{

        let stringHash = '';
        for(let i = 0 ; i < hashList.length ; i++) {
            stringHash += hashList[i]  +  ','
            console.log(stringHash);
        }
        boardList.board_hashTag = stringHash.substr(0,stringHash.length -1);

        console.log(boardList);
        

    }


    const eidtorValue = (e:any) =>{
        setText(e);
        // if(Array.isArray(e)){
        //     for(let i= 0 ; i < e.length; i++){
        //         boardList.boardImgLegacyList.push({idx: i , value : e[i]});
        //     }
        //     console.log("타는지 확인");
        // }
        
        
            
        setBoard({...boardList , board_content :  e})
        console.log(editorValue , '해결');
        
    }

    const onChangeFileValue = (e:any) => {
        uploadFiles.delete('files');
        for(let i = 0 ; i < e.target.files.length; i++){
            uploadFiles.append('files' , e.target.files[i]);
        }
        
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
                const stringValue = boardImg[i];
                reg  = new RegExp(/src=".*?"/, "g");
                let srcValue = boardList.board_content.match(reg)
                if(srcValue){
                    boardList.boardImgList.push({idx: i , value : srcValue[0]});
                }
                
            }
            
        }
        uploadFiles.append('data' , new Blob([JSON.stringify(boardList)] , { type: "application/json"}));
        
        for (let key of uploadFiles.keys()) {
            console.log(key);
        }
          
          // FormData의 value 확인
        for (let value of uploadFiles.values()) {
            console.log(value);
        }
        
        
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
        }else {

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


    const activeButton  = (e:any) =>{
        const HashInputTextValue = e.target.value.trim(); 

        if(!HashInputTextValue){
            return sethashInputText('');
        }

        const regExp = /^[a-z|A-Z|가-힣|ㄱ-ㅎ|ㅏ-ㅣ|0-9| \t|]+$/g;
        if (!regExp.test(HashInputTextValue)) {
            
            return sethashInputText(HashInputTextValue.substr(0,HashInputTextValue.length -1));
        }

        
        
        if(e.key == "Enter") {
            activeKeyUpButton(HashInputTextValue);
        }
        
        
    }
    const hashTagkeyDown = async (e:any) =>{
        const HashInputTextValue = e.target.value.trim(); 
        if(HashInputTextValue.length > 10){       
            return sethashInputText(HashInputTextValue.substr(0,HashInputTextValue.length -1));
        }
    }

    const activeKeyUpButton = async (HashInputTextValue:string) => {

        const hashInputTextNoSpace = HashInputTextValue.replace(/(\s*)/g, '');
        
        if(hashTagList.includes('#'+ hashInputTextNoSpace)){
            
            return sethashInputText('');
        }


        if(hashTagList.length >= 10){
            
            alert('해시태그는 10개까지 등록가능합니다!');
            return sethashInputText('');;
        }
        const hashArray = [...new Array(...hashTagList , '#' + hashInputTextNoSpace)] ;

        await sethashTagList((prevHashTags) => {
            return [...new Array(...prevHashTags , '#' + hashInputTextNoSpace)]
        });
        
        await ChangeHashTage(hashArray);

        sethashInputText('');
    }

    const deletHashTag = (e:any , idx :number) =>{
        hashTagList.splice(idx ,1)
        sethashTagList((prevHashTags) => {
            return [...new Array(...prevHashTags)]
        });
    }

    return (
        <Box sx={{ mx: 'auto', maxWidth: 1200, px: { xs: 2, sm: 3 } }}>

            <Box sx={{mt: '50px', fontWeight: 'bold', mb: '50px', width:'100%', textAlign:'right', fontSize: { xs: '22px', sm: '30px' }, borderBottom : '2px solid #E4EDFC'}}>게시글 등록</Box>
            <Box sx={{ width:"100%" , pb:'20px'}}>
                <TextField
                sx={{width:"100%"}}
                variant="standard"
                color="warning"
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
                        color="warning"
                        focused
                        multiline
                        rows={4}
                        inputProps={{maxLength : 150}}

                    />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: 500 } }}>
                    <TextField
                    sx={{ width: '100%' }}
                    id='hashTag'
                    value={hashInputText ? hashInputText : ''}
                    label="-해시 태그- / 공백 불가 , 최대 글자수 10"
                    placeholder="추가 하실 해시태그를 입력해주세요"
                    variant="standard"
                    color="warning"
                    focused
                    onChange={(e) => sethashInputText(e.target.value)}
                    onKeyDown={(e) => hashTagkeyDown(e)}
                    onKeyUp={(e) => activeButton(e)}
                    />
                    <Box id='hashTagList' sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, maxHeight: 150, overflow: 'auto' }}>
                        {
                            hashTagList.length > 0 && hashTagList.map((hashTag ,idx) =>{
                            return (
                            <Box
                                sx={{
                                    fontSize:'16px',
                                    px: 1.5,
                                    py: 0.5,
                                    backgroundColor: COLORS.coral,
                                    borderRadius:'10px',
                                    textAlign :'center',
                                    }}
                                    key={idx}>
                                <span style={{color:'#fff'}}>{hashTag}</span>
                                <DisabledByDefaultIcon onClick={(e) =>deletHashTag(e ,idx)} style={{fontSize:'10px', marginLeft:'5px', color: '#fff', cursor: 'pointer'}} />
                            </Box>)
                        })

                        }
                    </Box>
                </Box>
            </Box>
            <Box sx={{paddingTop:'10px'}}>
                <MdEditor value={textValue} onChange={eidtorValue} boardList={boardList} />
            </Box>
            <Box sx={{textAlign : 'center' , width:'100%' , marginTop:'50px'}}>
                <Button variant="outlined" sx={{marginRight:'10px'}} onClick={() => {window.history.back()}}>취소</Button>
                <Button variant="contained" onClick={subMit}>등록</Button>
            </Box>
        </Box>
    )
}

