import { Box, Button, MenuItem, Modal, Pagination,Select,TextField,Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import './board.css';
import '../index.css';
import { post } from "../common/common";
import { postBoardSearch } from "../common/common";

import LoadingScreen from "../common/loadingScreen";
import { useNavigate } from "react-router-dom";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useRef, useState } from "react";
import BoardSkeleton from "./boardSkeleton";

const Img = styled('img')({
    marginTop:'10px',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
});
const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    textAlign : 'center',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
  };
const object = {};
interface boardType {
    board_no : number | 0,
    board_title : string | undefined,
    board_userName :string | undefined,
    board_writer : string | undefined,
    board_changeThumbnail : string | TrustedHTML,
    board_content : string | TrustedHTML,
    board_hit : string | 0,
    board_like : string | 0,
    board_hate : string | 0,
    board_date : string | '',
    board_imgList: string | '',
    board_hashTag : string | undefined ,
    board_hashTags : Array<string> | []
    returnUrl : string | undefined
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
    const [boards, setBoard] = useState<boardType[]>([]);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [modalStatus, setModalStatus] = useState(false);
    const [hasNextPage , setHasNextPage] = useState(true);
    const [pageParams,setPageParams] = useState<number[]>([]);
    const [searchIndex, setSearchIndex] = useState(0);
    const [searchValues, setSearchValues] = useState({
        searchType : 'title',
        searchWord : '',
        searchTableName : 'board',
        scrollIndex : 0
    });

    const pageUesRef = useRef(0);
    const pageParamsUseRef = useRef<number[]>([]);
    const hasNextPageUseRef = useRef(true);
    const searchIndexUseRef = useRef(0);
    const boardsUseRef = useRef<boardType[]>([]);
    const searchValuesUseRef = useRef({
        searchType : 'title',
        searchWord : '',
        searchTableName : 'board',
        scrollIndex : 0
    });
    const isLoadingUseRef = useRef(false);

    pageUesRef.current = page;
    pageParamsUseRef.current = pageParams;
    hasNextPageUseRef.current = hasNextPage;
    searchIndexUseRef.current = searchIndex;
    searchValuesUseRef.current = searchValues;
    isLoadingUseRef.current = isLoading;

    boardsUseRef.current = boards;

    const wait = (timeToDelay:number , value :string) => new Promise((resolve , reject) =>{
            
        if(value === 'start'){
            setIsLoading(true);
        }else {
            setIsLoading(false);
        }
        
        setTimeout(resolve, timeToDelay);
    });
    

    useEffect(() =>{
        if(searchIndexUseRef.current !== 1 && hasNextPageUseRef.current){
            fetchData(pageUesRef.current)
        }
        if(searchIndexUseRef.current === 1){
            searchScrollFucntion(pageUesRef.current)
        }
        
    },[page])

    useEffect(() =>{
        const observer = new IntersectionObserver((entries) =>{
            const firstEntry = entries[0]
            
            //추가할까말까 고민하는것 hasNextPage
            //기존 전체 검색은 토탈값 넘겨주고 
            // 내방식 자바에서 토탈카운트 가져와서 board 에 있는 개수 비교 작으면 다시호출 넘거나 같으면 호출안함 으로변경
            // search 생각
            /*
                처음에 useEffect 등록해야되는데 인덱스값을 줘서 실행 하는거 실행안함
                search에서 검색이 이루어지면 index true 변경후 새로운 useEffect 에서 값 감시후에 계속그걸로 검색
                문제 그럼 다른검색어로 검색하면 초기화 어케함? useEffect에서 감시하고있으면 계속 실행될텐데
                그럼 검색을 하면 초기화값으로 -1 을 주고 -1일경우 바로 return 시키고 0이상일경우 밑에 api 호출 ? 
            */
            if(firstEntry.isIntersecting  && hasNextPageUseRef.current && !isLoadingUseRef.current){
                setPage((e) =>e + 6)
            }
        },{
            threshold: 1 //Intersection Observer의 옵션, 0일 때는 교차점이 한 번만 발생해도 실행, 1은 모든 영역이 교차해야 콜백 함수가 실행. 
        })
        

        const observerTarget = document.getElementById("observer");

        if(observerTarget){
            observer.observe(observerTarget);
        }
        return () =>{
            if(observerTarget){
                observer.unobserve(observerTarget);
            }
        }
    },[])

    const fetchData = async (page:any) => {
        
        if(pageParams.includes(page)){
            return 
        }
        
        await wait(1000 ,'start');
        try {
          
          const addBoadrList = await postBoardSearch('/board/select' , {'scrollIndex' : page} );
          console.log(addBoadrList,'보더확인')
          for(let idx in addBoadrList.data){
            if(addBoadrList.data[idx].board_hashTag){
                addBoadrList.data[idx].board_hashTags = addBoadrList.data[idx].board_hashTag.split(',');
            }
            
          }

          setBoard((boardList) => [...boardList, ...addBoadrList.data].sort((a, b) => a.board_no - b.board_no));

          setPageParams((prev) =>[...prev,page]);

          setHasNextPage((e) => e =addBoadrList.scrollIndex < addBoadrList.totalCount);


        } catch (error) {
          console.log(error);
          
        }finally{
            await wait(1000 ,'stop') ;
        }
        
    };

    const navigate = useNavigate();

    const clicked = (e :boardType) => {
        console.log(e);
        navigate("/board/boardDetail", { state: { boardList: e }});
    }
    const search = async (e:any) => {
        
        /*
            전체  or 해시태그 or 제목
            기간 
            기간별 검색 ex) 오늘 이번주 이번달 올해
        */

        const {value} = e.target;

        if(e.key =='Enter'){
            
            
            

            const replaceValue = value.replaceAll(" " , "");
            
            if(replaceValue == ""){
                alert("검색어를 입력해주세요");
                return false;
            }

            if(isLoadingUseRef.current === true){
                return false 
            }
            setBoard(e => e= []);
            
            await wait(1000 ,'start') ;

            setSearchIndex(1);

            const searcgValueList = {
                scrollIndex : 0,
                searchTableName : 'board',
                searchWord : value,
                searchType :searchValues.searchType
            }

            setPageParams([0]);
            try{

                

                //setPage(0);

                const searchData = await postBoardSearch('/board/boardSearch' ,  searcgValueList);   
                
                for(let idx in searchData.data){
                    if(searchData.data[idx].board_hashTag){
                        searchData.data[idx].board_hashTags = searchData.data[idx].board_hashTag.split(',');
                    }
                } 
                //기존 검색어 없이 스크롤 구분값값
                
                
                setBoard([...searchData.data]);

                setSearchValues((e) => e = {...e , searchWord : value});

                setSearchValues((e) => e = {...e , scrollIndex : searchData.scrollIndex});      
                
                setHasNextPage((e) => e =searchData.scrollIndex < searchData.totalCount);
                
                setPageParams((prev) =>[...prev,page]);
                
                
            }catch(error){
                console.log(error);
            }finally{
                await wait(1000 ,'stop') ;
            }
            
          
        }
    }
    const selectChange = (e:any) =>{
        const {value} = e.target ;
        setSearchValues({...searchValues , searchType : value});
    }

    const searchScrollFucntion = async (page:number) => {
        if(pageParams.includes(page)){
            return 
        }
        if(hasNextPage === false){
            return 
        }
           
        try{
            await wait(1000 ,'start') ;    

            setSearchValues((e) => e = {...e});   

            console.log('searchScrollFucntion' , searchValuesUseRef.current);

            const searchData = await postBoardSearch('/board/boardSearch' ,  searchValuesUseRef.current); 
            
            for(let idx in searchData.data){
                if(searchData.data[idx].board_hashTag){
                    searchData.data[idx].board_hashTags = searchData.data[idx].board_hashTag.split(',');
                }
            }
            
            setBoard((boardList) => [...boardList, ...searchData.data].sort((a, b) => a.board_no - b.board_no));

            setSearchValues({...searchValues , scrollIndex : searchData.scrollIndex});            
            
            setHasNextPage((e) => e =searchData.scrollIndex < searchData.totalCount);

            setPageParams((prev) =>[...prev,page]);
            
        }catch(error){
            console.log(error);
            
            
        }finally{
            await wait(1000 ,'stop') ;
        }
        
    }
    const insertClick = async() =>{ 

        const token = localStorage.getItem('token')
        if(token){
            
            location.href="/board/boardInsert"
        }else {
            location.href="/signin"
           // setModalStatus(true);
        }
    }
    const modalClose = async() =>{ 
           // setModalStatus(false);     
    }

    return (
        <Box id='fontNoto' style={{display:'flex' , flexWrap : 'wrap' , backgroundColor: '#F8F9FA'}}>
        
            <Box sx={{
                p: 2,
                margin: 'auto',
                marginTop:'20px',
                marginRight:'25px',
                width: 1200,
                flexGrow: 2,
                justifyContent: 'right',
                display:'flex',               
            }}>
                <Select
                    value={searchValues.searchType}
                    style={{width:'110px' ,height:'30px', backgroundColor:'white' , fontSize : '12px',marginTop:'8px',marginRight:'10px',textAlign:'center'}}
                    onChange={(e) => selectChange((e))}
                >
                    <MenuItem value='title'>제목</MenuItem>
                    <MenuItem value='hashTag'>해시태그</MenuItem>
                </Select>

                <Box style={{width:'900px'}}>
                <TextField
                id="standard-helperText"
                defaultValue=""
                helperText="제목 또는 태그를 입력해주세요"
                variant="standard"
                onKeyUp={(e) =>  search(e)}
                style={{width:'900px',marginTop:'5px'}}
                />
                </Box>
                <Box>
                    <Button variant="contained" onClick={e => insertClick() } >게시글 등록</Button>
                    <Modal
                        open={modalStatus}
                        onClose={modalClose}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                    >
                        <Box sx={modalStyle}>
                        <Typography id="modal-title" variant="h6" component="h2">
                            로그인이 필요합니다 로그인하시겠습니까?
                        </Typography>
                        <Typography id="modal-description" sx={{ mt: 2 }}>
                            
                        </Typography>
                        </Box>
                    </Modal>
                </Box>
            </Box>
            { boardsUseRef.current && boardsUseRef.current.length > 0 ? boardsUseRef.current.map((value,index) => (
                
                <Box key={value.board_no}>
                    
                    <Paper
                    sx={{
                        p: 2,
                        margin: 'auto',
                        width: 550,
                        flexGrow: 1,
                        backgroundColor: '#fff',
                        marginBottom :'30px',
                        marginLeft:'30px',
                        float:'left'
                    }}
                    key={value.board_no}
                    >
                    <ButtonBase  sx={{width:'100%' , height:158}} onClick={e => clicked(value) }>    
                            {
                                value.board_imgList ?
                                <Grid item xs={12} sm container>
                                    <Grid item xs={4}>
                                        <Img sx={{ width: 178, height: 148}} src={value.board_imgList.split(',')[0]} />
                                    </Grid>
                                    <Grid xs item sx={{ width:270 ,marginLeft:'10px'}}>
                                        <Grid item >
                                            <Typography id='fontNotoTitle' gutterBottom style={{marginLeft:'5px' ,fontSize:'32px' ,textAlign:'left' ,overflow:'hidden' , textOverflow:'ellipsis' , whiteSpace:'nowrap',marginTop:'10px'}}>
                                                {value.board_title}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography
                                                id='wordStyleImg'
                                                gutterBottom
                                                dangerouslySetInnerHTML={{__html:value.board_changeThumbnail}}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid style={{display:'flex'}}>
                                                <Typography sx={{ cursor: 'pointer' }} variant="body2" style={{margin:'auto' ,width:'80px' ,textAlign:'left',marginLeft:'5px',paddingTop:'5px'}}>
                                                    <span style={{verticalAlign: 'middle', fontSize:'15px'}}>{value.board_date.substr(0,10)}</span>
                                                </Typography>
                                                <Typography sx={{ cursor: 'pointer' }} variant="body2" style={{margin:'auto' ,width:'330px' ,textAlign:'left',float:'left'}}>
                                                        <span id='hashTagList' style={{margin:'auto',height:'40px',float:'left'}}> 
                                                            {
                                                                value.board_hashTags &&  value.board_hashTags.map((hashTag:string , idx:number) =>{
                                                                    return (
                                                                        idx < 3 ? 
                                                                        <span 
                                                                        
                                                                        style={{
                                                                            fontSize:'20px',
                                                                            height:'25px',
                                                                            float :'left',
                                                                            marginLeft:'10px',
                                                                            marginTop:'5px',
                                                                            backgroundColor:'#ED6C02',
                                                                            borderRadius:'10px',
                                                                            textAlign :'center',
                                                                            minWidth:'100px'
                                                                        }}
                                                                        key={hashTag}
                                                                        >
                                                                            <span style={{color:'#fff'}}>{hashTag}</span>
                                                                        </span>
                                                                        :
                                                                        null
                                                                    )
                                                                })
                                    
                                                            }
                                                        </span>
                                                </Typography>
                                                <Typography variant="subtitle1" component="div" style={{margin:'auto',width:'100px',textAlign:'right'}}>
                                                    <RemoveRedEyeIcon style={{verticalAlign: 'middle', fontSize:'15px'}}/><span style={{verticalAlign: 'middle' ,fontSize:'15px'}}>  {value.board_hit}</span>
                                                    <ThumbUpIcon style={{verticalAlign: 'middle' ,fontSize:'15px' ,marginLeft:'10px'}}/><span style={{verticalAlign: 'middle' ,fontSize:'15px'}}>  {value.board_like} </span>
                                                </Typography>
                                        </Grid>
                                </Grid>

                                    :  //분기점 


                                <Grid item xs={12} sm container style={{height:'158px'}}>

                                    <Grid item xs container direction="column"  style={{height:'148px',marginBottom:'-5px'}}>

                                        <Grid item style={{marginTop:'-10px'}}>
                                            <Grid>
                                                <Typography id='fontNotoTitle' gutterBottom  style={{marginLeft:'5px' ,fontSize:'32px' ,textAlign:'left' }}>
                                                    {value.board_title}
                                                </Typography>
                                            </Grid>
                                            <Grid>
                                                <Typography
                                                    id='wordStyle'
                                                    gutterBottom
                                                    dangerouslySetInnerHTML={{__html:value.board_changeThumbnail}}
                                                >
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        

                                    </Grid>
                                    <Grid style={{display:'flex'}}>
                                                <Typography sx={{ cursor: 'pointer' }} variant="body2" style={{margin:'auto' ,width:'80px' ,textAlign:'left',marginLeft:'5px'}}>
                                                    <span style={{verticalAlign: 'middle', fontSize:'15px'}}>{value.board_date.substr(0,10)}</span>
                                                </Typography>
                                                <Typography sx={{ cursor: 'pointer' }} variant="body2" style={{margin:'auto' ,width:'330px' ,textAlign:'left',float:'left',marginTop:'-5px'}}>
                                                        <span id='hashTagList' style={{margin:'auto',height:'40px',float:'left'}}> 
                                                            {
                                                                value.board_hashTags &&  value.board_hashTags.map((hashTag:string , idx:number) =>{
                                                                    return (
                                                                        idx < 3 ? 
                                                                        <span 
                                                                        
                                                                        style={{
                                                                            fontSize:'20px',
                                                                            height:'25px',
                                                                            float :'left',
                                                                            marginLeft:'10px',
                                                                            marginTop:'5px',
                                                                            backgroundColor:'#ED6C02',
                                                                            borderRadius:'10px',
                                                                            textAlign :'center',
                                                                            minWidth:'100px'
                                                                        }}
                                                                        key={hashTag}
                                                                        >
                                                                            <span style={{color:'#fff'}}>{hashTag}</span>
                                                                        </span>
                                                                        :
                                                                        null
                                                                    )
                                                                })
                                    
                                                            }
                                                        </span>
                                                </Typography>
                                                <Typography variant="subtitle1" component="div" style={{margin:'auto',width:'100px',textAlign:'right'}}>
                                                    <RemoveRedEyeIcon style={{verticalAlign: 'middle', fontSize:'15px'}}/><span style={{verticalAlign: 'middle' ,fontSize:'15px'}}>  {value.board_hit}</span>
                                                    <ThumbUpIcon style={{verticalAlign: 'middle' ,fontSize:'15px' ,marginLeft:'10px'}}/><span style={{verticalAlign: 'middle' ,fontSize:'15px'}}>  {value.board_like} </span>
                                                </Typography>
                                        </Grid>
                                </Grid>     
                            }                   
                    </ButtonBase>
                   </Paper>
                        
                </Box>
                   
            ))  :  <Box
                    sx={{
                        p: 2,
                        margin: 'auto',
                        maxWidth: 1200,
                        flexGrow: 1,
                        backgroundColor: '#F8F9FA',
                        marginBottom :'10px',
                        textAlign:'center',
                    }}
                  >
                    <span>{isLoading ? '' : '게시물이존재하지않습니다' }</span>
                  </Box>
                  
        }

            {
                          isLoading ? 
                          <Box id='fontNoto' style={{flexWrap : 'wrap' , backgroundColor: '#F8F9FA'}}>
                              
                                  <BoardSkeleton />
                                  <BoardSkeleton />
                                  <BoardSkeleton />
                                  <BoardSkeleton />
                                  <BoardSkeleton />
                                  <BoardSkeleton />
                              
                          </Box>
                          : null
             }
             {
                //isLoading  ? <LoadingScreen /> : null
             }
              <Box id='observer' style={{width:'1200px', height:'50px'}} />
              
        </Box>
            
        
    )
}






