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
import AdFitBanner from "../common/AdFitBanner";

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
    const observerRef = useRef(null);
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
    const handleCardClick = (item: boardType) => {
        navigate("/board/boardDetail", { state: { boardList: item } });
    };
    const handleInsert = () => {
        const token = localStorage.getItem('token');
        navigate(token ? "/board/boardInsert" : "/signin");
    };
    const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value.trim();
      if (!value) return alert('검색어를 입력해주세요');

      setIsLoading(true);
    const result = await postBoardSearch('/board/boardSearch', {
        ...searchValues,
        searchWord: value,
        scrollIndex: 0
    });

    const data = result.data.map((b: boardType) => ({
            ...b,
            board_hashTags: b.board_hashTag ? b.board_hashTag.split(',') : []
        }));
        setBoard(data);
        setSearchValues(prev => ({ ...prev, searchWord: value, scrollIndex: result.scrollIndex }));
        setPage(1);
        setIsLoading(false);
        }
    };
    return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, bgcolor: '#F5F7FA' }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid xs={12} md={12} textAlign={{ xs: 'center', }}>
                  <AdFitBanner  adUnit="DAN-1z5CmB0DZNK1zHzu" width={728} height={90}  />
        </Grid>
        <Grid item xs={12} sm={3} md={2}>
          <Select
            fullWidth
            value={searchValues.searchType}
            size="small"
            onChange={(e) => setSearchValues({ ...searchValues, searchType: e.target.value })}
          >
            <MenuItem value='title'>제목</MenuItem>
            <MenuItem value='hashTag'>해시태그</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={6} md={7}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="제목 또는 태그를 입력해주세요"
            onKeyUp={handleSearch}
          />
        </Grid>
        <Grid item xs={12} sm={3} md={3} textAlign={{ xs: 'center', sm: 'right' }}>
          <Button variant="contained" color="primary" onClick={handleInsert} sx={{ borderRadius: 2 }}>게시글 등록</Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {boards.length > 0 ? boards.map((item) => (
          <Grid item xs={12} md={6} key={item.board_no}>
            <Paper elevation={3} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, p: 2, borderRadius: 3, boxShadow: '0 3px 10px rgba(0,0,0,0.08)' ,minHeight: 200}}>
              {item.board_imgList && (
                <Box sx={{ width: 150, height: 150, overflow: 'hidden', flexShrink: 0, mr: { sm: 2 }, mb: { xs: 2, sm: 0 }, borderRadius: 2 }}>
                  <img
                    src={item.board_imgList.split(',')[0]}
                    alt="썸네일"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                </Box>
              )}
              <Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
                <Box onClick={() => handleCardClick(item)} sx={{ cursor: 'pointer' }}>
                  <Typography variant="h6" fontWeight={600} noWrap>{item.board_title}</Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mt: 1,
                      color: 'text.secondary'
                    }}
                    dangerouslySetInnerHTML={{ __html: item.board_changeThumbnail }}
                  />
                </Box>

                <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                  {item.board_hashTags?.slice(0, 3).map((tag) => (
                    <Box
                      key={tag}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 12,
                        backgroundColor: '#ED6C02',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 500
                      }}
                    >
                      #{tag}
                    </Box>
                  ))}
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pt: 2 }}>
                  <Typography variant="body2" color="text.secondary">{item.board_date?.substring(0, 10)}</Typography>
                  <Box display="flex" gap={2} alignItems="center">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <RemoveRedEyeIcon fontSize="small" />
                      <Typography variant="body2" color="text.secondary">{item.board_hit}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <ThumbUpIcon fontSize="small" />
                      <Typography variant="body2" color="text.secondary">{item.board_like}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )) : (
          <Grid item xs={12} textAlign="center">
            <Typography>{isLoading ? '' : '게시물이 존재하지 않습니다'}</Typography>
          </Grid>
        )}
      </Grid>

      {isLoading && (
        <Grid container spacing={2} mt={2}>
          <BoardSkeleton />
          <BoardSkeleton />
          <BoardSkeleton />
          <BoardSkeleton />
        </Grid>
      )}

      <Box id='observer' style={{width:'100%', height:'300px'}} />

      <Modal open={modalStatus} onClose={() => setModalStatus(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6">로그인이 필요합니다. 로그인하시겠습니까?</Typography>
        </Box>
      </Modal>
    </Box>
  );
}






