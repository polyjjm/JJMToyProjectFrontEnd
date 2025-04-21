import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { post , postBoardSearch } from "../common/common";

export default function kakoAuth(){
    const navigate  = useNavigate() ;
    
    const backback = async () =>{
         const code = new URL(window.location.href).searchParams.get('code');
        const setValues ={
            code :  code
        }
        const returnResult = await postBoardSearch('/member/kakao/doLogin' ,setValues );
        // console.log(code);

        // navigate(-2);
        //const code = new URL(window.location.href).searchParams.get('code');
        //_xCo54c6MapvtVmUeA-NDGfAh2LxCjqDk9KhCTS6kM4GBtnUUSqecwAAAAQKDSHZAAABlbQLeuuBPKUF0hG4dQ
        console.log(code);
        console.log("주종민 확인중");
        localStorage.setItem("token" , returnResult.token)
        localStorage.setItem("user_email" , returnResult.id)
        navigate(-2)
    }
    return (
        <Box  style={{display:'flex' , flexWrap : 'wrap'}}>
            <Box onClick={(e) => backback()} style={{ margin:'auto' ,border:'1px solid red',  marginTop:'150px',width:'600px' ,height:'500px' }}>
                    we
            </Box>
        </Box>
    )
}