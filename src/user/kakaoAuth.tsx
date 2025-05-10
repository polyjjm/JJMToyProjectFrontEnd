import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { post , postBoardSearch } from "../common/common";
import { useEffect } from "react";

export default function kakoAuth(){
    const navigate  = useNavigate() ;
    
    const backback = async () =>{
        const code = new URL(window.location.href).searchParams.get('code');
        const setValues ={
            code :  code
        }
        const returnResult = await postBoardSearch('/member/kakao/doLogin' ,setValues );
        console.log(code);

        // navigate(-2);
        //const code = new URL(window.location.href).searchParams.get('code');
        //_xCo54c6MapvtVmUeA-NDGfAh2LxCjqDk9KhCTS6kM4GBtnUUSqecwAAAAQKDSHZAAABlbQLeuuBPKUF0hG4dQ
        console.log(code);
        console.log("주종민 확인중");
        console.log(returnResult)
        localStorage.setItem("token" , returnResult.token)
        localStorage.setItem("user_email" , returnResult.id)
        navigate(-2)
        
    }
     useEffect(() =>{
    
        const fetchData = async () => {
            try {
              const code = new URL(window.location.href).searchParams.get('code');
              const setValues ={
                  code :  code
              }
              //const returnResult = await postBoardSearch('/member/kakao/doLogin' ,setValues );

              //localStorage.setItem("token" , returnResult.token)
              //localStorage.setItem("user_email" , returnResult.id)
              //window.location.href='/';
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          };
        
        fetchData();
        
        // navigate(-2);
        //const code = new URL(window.location.href).searchParams.get('code');
        //_xCo54c6MapvtVmUeA-NDGfAh2LxCjqDk9KhCTS6kM4GBtnUUSqecwAAAAQKDSHZAAABlbQLeuuBPKUF0hG4dQ
            //수정 들어왔을때 최초 이미지 구분해줘야함 중간에 삭제 혹은 추가시 처리를 위하여
                
    },[])
    return (
        <Box  style={{display:'flex' , flexWrap : 'wrap'}}>
            <Box onClick={(e) => backback()} style={{ margin:'auto' ,  marginTop:'150px',width:'600px' ,height:'500px' }}>
                    
            </Box>
        </Box>
    )
}