import { Box } from "@mui/material"

export default function signin(){

    //JavaScript 키	f7af60f982c2441421b46e146905f7b8
    const kakaoLogin = (e:any) =>{
        
        
        //window.location.href = kakaoURL
        //const redirect_uri =  process.env.REACT_APP_KAKAO_REDIREACT_URI;
        const redirect_uri =  'http://localhost:3000/login/kakao/oauth'
        const client_id = process.env.REACT_APP_KAKAO_REST_API_KEY;
        if(client_id){
            encodeURI(client_id);
        }
        if(redirect_uri){
            encodeURI(redirect_uri);
        }
        

        window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`
                                

    }
    return (
        <Box  style={{display:'flex' , flexWrap : 'wrap' , backgroundColor: '#F8F9FA'}}>
            <Box style={{margin:'auto' , marginTop:'150px',width:'600px' ,height:'500px' ,backgroundColor: '#fff'}}>
                <Box style={{width:'600px' ,height:'150px',textAlign:'center',marginTop:'150px'}}>
                    
                        <h1> 로그인 </h1>
                    
                </Box>
                <Box style={{margin :'auto',width:'600px',textAlign:'center'}}>
                    <img onClick={e => kakaoLogin(e)} style={{cursor :'pointer'}} src={process.env.PUBLIC_URL + '/kakao_login.png'}  />
                </Box>
            </Box>
        </Box>
    )
}